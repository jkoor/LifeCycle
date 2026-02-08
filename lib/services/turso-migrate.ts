/**
 * Turso 数据库自动迁移模块
 *
 * 将 prisma/migrations/ 下的 SQL 迁移文件自动应用到 Turso 远程数据库。
 * 通过 _prisma_migrations 表跟踪已应用的迁移，实现幂等执行。
 *
 * 使用场景：
 * - 应用启动时自动建表（instrumentation.ts）
 * - CLI 手动迁移（scripts/migrate-turso.ts）
 */

import { createClient, type Client } from "@libsql/client"
import * as fs from "fs"
import * as path from "path"

const MIGRATION_TABLE = "_prisma_migrations"

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
    console.log("[turso-migrate] ⚠️ 强制重置：清空数据库")
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

  // 扫描本地迁移目录
  if (!fs.existsSync(migrationsDir)) {
    console.log(`[turso-migrate] 迁移目录不存在: ${migrationsDir}`)
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

    console.log(`[turso-migrate] 应用迁移: ${dir}`)

    // 将 SQL 按语句分割执行
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    for (const statement of statements) {
      await client.execute(statement)
    }

    // 记录迁移
    const checksum = simpleHash(sql)
    await client.execute({
      sql: `INSERT INTO "${MIGRATION_TABLE}" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count") VALUES (?, ?, ?, datetime('now'), 1)`,
      args: [generateId(), checksum, dir],
    })

    result.applied++
    result.appliedNames.push(dir)
    console.log(`[turso-migrate] ✅ 完成: ${dir}`)
  }

  return result
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
