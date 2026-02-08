/**
 * Turso 数据库自动迁移模块
 *
 * 将 prisma/migrations/ 下的 SQL 迁移文件自动应用到 Turso 远程数据库。
 * 通过 _prisma_migrations 表跟踪已应用的迁移，实现幂等执行。
 *
 * 核心保障：
 * - 使用 batch 事务保证 SQL 迁移的原子性（全部成功或全部回滚）
 * - 迁移记录仅在所有语句执行成功后才写入
 * - 启动时自动校验已记录的迁移是否真正生效
 *
 * 使用场景：
 * - 应用启动时自动建表（instrumentation.ts）
 * - CLI 手动迁移（scripts/migrate-turso.ts）
 */

import { createClient, type Client, type InStatement } from "@libsql/client"
import * as fs from "fs"
import * as path from "path"

const MIGRATION_TABLE = "_prisma_migrations"
const LOG_PREFIX = "[turso-migrate]"

export interface MigrateOptions {
  /** Turso 数据库 URL */
  url: string
  /** Turso 认证令牌 */
  authToken: string
  /** 是否强制重置（删除所有表后重新迁移） */
  forceReset?: boolean
  /** 迁移文件目录，默认为 prisma/migrations */
  migrationsDir?: string
}

export interface MigrateResult {
  /** 本次应用的迁移数量 */
  applied: number
  /** 本次应用的迁移名称列表 */
  appliedNames: string[]
}

/**
 * 解析迁移目录路径
 * 支持多种运行环境（本地开发、Next.js standalone 构建产物等）
 */
function resolveMigrationsDir(customDir?: string): string {
  if (customDir) return customDir

  // 尝试多个可能的路径
  const candidates = [
    path.join(process.cwd(), "prisma", "migrations"),
    path.join(__dirname, "..", "prisma", "migrations"),
    path.join(__dirname, "..", "..", "prisma", "migrations"),
  ]

  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir
  }

  return candidates[0] // fallback
}

/**
 * 将 SQL 文件内容拆分为独立的可执行语句
 *
 * 相比简单的 split(";")，此实现：
 * - 正确处理字符串中包含分号的情况
 * - 跳过纯注释行和空行
 * - 保留完整语句（不会截断多行语句）
 */
function splitStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ""
  let inString = false
  let stringChar = ""

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]

    // 处理字符串边界
    if (inString) {
      current += ch
      // 转义的引号（两个连续引号）不结束字符串
      if (ch === stringChar) {
        if (i + 1 < sql.length && sql[i + 1] === stringChar) {
          current += sql[++i]
        } else {
          inString = false
        }
      }
      continue
    }

    // 跳过行注释  -- ...
    if (ch === "-" && i + 1 < sql.length && sql[i + 1] === "-") {
      const eol = sql.indexOf("\n", i)
      i = eol === -1 ? sql.length - 1 : eol
      continue
    }

    // 进入字符串
    if (ch === "'" || ch === '"') {
      inString = true
      stringChar = ch
      current += ch
      continue
    }

    // 分号 → 结束当前语句
    if (ch === ";") {
      const trimmed = current.trim()
      if (trimmed.length > 0) {
        statements.push(trimmed)
      }
      current = ""
      continue
    }

    current += ch
  }

  // 尾部没有分号的语句
  const trimmed = current.trim()
  if (trimmed.length > 0) {
    statements.push(trimmed)
  }

  return statements
}

/**
 * 将所有待执行的 Prisma 迁移应用到 Turso 数据库
 */
export async function migrateTurso(options: MigrateOptions): Promise<MigrateResult> {
  const { url, authToken, forceReset = false } = options
  const migrationsDir = resolveMigrationsDir(options.migrationsDir)

  const client = createClient({ url, authToken })

  try {
    return await applyMigrations(client, migrationsDir, forceReset)
  } finally {
    client.close()
  }
}

async function applyMigrations(
  client: Client,
  migrationsDir: string,
  forceReset: boolean
): Promise<MigrateResult> {
  // 强制重置：删除所有表
  if (forceReset) {
    console.log(`${LOG_PREFIX} ⚠️ 强制重置：清空数据库`)
    const tables = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%'"
    )
    for (const row of tables.rows) {
      const tableName = row.name as string
      await client.execute(`DROP TABLE IF EXISTS "${tableName}"`)
    }
  }

  // 确保迁移记录表存在
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "${MIGRATION_TABLE}" (
      "id"                    TEXT PRIMARY KEY NOT NULL,
      "checksum"              TEXT NOT NULL,
      "finished_at"           DATETIME,
      "migration_name"        TEXT NOT NULL,
      "logs"                  TEXT,
      "rolled_back_at"        DATETIME,
      "started_at"            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count"   INTEGER NOT NULL DEFAULT 0
    )
  `)

  // 获取已应用的迁移
  const applied = await client.execute(
    `SELECT migration_name FROM "${MIGRATION_TABLE}" WHERE rolled_back_at IS NULL`
  )
  const appliedNames = new Set(applied.rows.map((r) => r.migration_name as string))

  // 校验已记录的迁移是否真正生效（防止"幽灵记录"）
  if (appliedNames.size > 0) {
    await repairStaleMigrations(client, appliedNames, migrationsDir)
  }

  // 扫描本地迁移目录
  if (!fs.existsSync(migrationsDir)) {
    console.log(`${LOG_PREFIX} 迁移目录不存在: ${migrationsDir}`)
    return { applied: 0, appliedNames: [] }
  }

  const migrationDirs = fs
    .readdirSync(migrationsDir)
    .filter((name) => {
      const fullPath = path.join(migrationsDir, name)
      return (
        fs.statSync(fullPath).isDirectory() &&
        fs.existsSync(path.join(fullPath, "migration.sql"))
      )
    })
    .sort()

  if (migrationDirs.length === 0) {
    return { applied: 0, appliedNames: [] }
  }

  const result: MigrateResult = { applied: 0, appliedNames: [] }

  for (const dir of migrationDirs) {
    if (appliedNames.has(dir)) continue

    const sqlPath = path.join(migrationsDir, dir, "migration.sql")
    const sql = fs.readFileSync(sqlPath, "utf-8")

    console.log(`${LOG_PREFIX} 应用迁移: ${dir}`)

    const statements = splitStatements(sql)
    if (statements.length === 0) {
      console.log(`${LOG_PREFIX} ⏭️ 跳过空迁移: ${dir}`)
      continue
    }

    // 构建 batch：所有 DDL 语句 + 迁移记录写入一起提交
    // libsql batch 是原子事务，失败时全部回滚
    const checksum = simpleHash(sql)
    const migrationId = generateId()

    const batchStatements: InStatement[] = [
      ...statements,
      {
        sql: `INSERT INTO "${MIGRATION_TABLE}" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count") VALUES (?, ?, ?, datetime('now'), ?)`,
        args: [migrationId, checksum, dir, statements.length],
      },
    ]

    try {
      await client.batch(batchStatements, "write")
      result.applied++
      result.appliedNames.push(dir)
      console.log(
        `${LOG_PREFIX} ✅ 完成: ${dir} (${statements.length} 条语句)`
      )
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.error(`${LOG_PREFIX} ❌ 迁移失败: ${dir}`)
      console.error(`${LOG_PREFIX}    错误: ${errMsg}`)
      // 因为使用了 batch 事务，失败时不会写入迁移记录
      // 抛出错误中止后续迁移，避免顺序依赖的迁移在基础缺失时继续执行
      throw new Error(
        `迁移 "${dir}" 执行失败，已回滚，后续迁移已中止。原因: ${errMsg}`
      )
    }
  }

  return result
}

/**
 * 修复"幽灵"迁移记录
 *
 * 检测 _prisma_migrations 中已标记完成，但实际表不存在的迁移。
 * 删除这些无效记录，使下次运行能重新应用。
 */
async function repairStaleMigrations(
  client: Client,
  appliedNames: Set<string>,
  migrationsDir: string
): Promise<void> {
  // 获取数据库中实际存在的表
  const tablesResult = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
  )
  const existingTables = new Set(tablesResult.rows.map((r) => r.name as string))

  // 从迁移 SQL 中提取预期创建的表名
  for (const migrationName of appliedNames) {
    const sqlPath = path.join(migrationsDir, migrationName, "migration.sql")
    if (!fs.existsSync(sqlPath)) continue

    const sql = fs.readFileSync(sqlPath, "utf-8")
    const expectedTables = extractTableNames(sql)

    // 如果迁移应创建表，但表不存在 → 该迁移记录无效
    if (expectedTables.length > 0) {
      const missingTables = expectedTables.filter((t) => !existingTables.has(t))
      if (missingTables.length > 0) {
        console.warn(
          `${LOG_PREFIX} ⚠️ 检测到幽灵迁移记录: ${migrationName}`
        )
        console.warn(
          `${LOG_PREFIX}    缺失的表: ${missingTables.join(", ")}`
        )
        console.warn(
          `${LOG_PREFIX}    正在删除无效记录，下次将重新应用该迁移`
        )
        await client.execute({
          sql: `DELETE FROM "${MIGRATION_TABLE}" WHERE migration_name = ?`,
          args: [migrationName],
        })
        appliedNames.delete(migrationName)
      }
    }
  }
}

/**
 * 从 SQL 中提取 CREATE TABLE 语句的表名
 */
function extractTableNames(sql: string): string[] {
  const regex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?/gi
  const names: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(sql)) !== null) {
    names.push(match[1])
  }
  return names
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash).toString(16).padStart(8, "0")
}

function generateId(): string {
  return Array.from({ length: 36 }, (_, i) => {
    if (i === 8 || i === 13 || i === 18 || i === 23) return "-"
    return Math.floor(Math.random() * 16).toString(16)
  }).join("")
}
