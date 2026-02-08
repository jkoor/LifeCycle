/**
 * Turso 数据库迁移 CLI
 *
 * 将 Prisma 生成的迁移 SQL 应用到 Turso 远程数据库。
 *
 * 用法：
 *   pnpm db:migrate:turso                    # 应用所有未执行的迁移
 *   pnpm db:migrate:turso -- --force-reset   # 清空并重新应用所有迁移
 *
 * 需要环境变量：
 *   TURSO_DATABASE_URL  - Turso 数据库连接 URL (libsql://...)
 *   TURSO_AUTH_TOKEN    - Turso 认证令牌
 */

import { migrateTurso } from "../lib/services/turso-migrate"

async function main() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  const forceReset = process.argv.includes("--force-reset")

  if (!url) {
    console.error("❌ 缺少环境变量 TURSO_DATABASE_URL")
    process.exit(1)
  }
  if (!authToken) {
    console.error("❌ 缺少环境变量 TURSO_AUTH_TOKEN")
    process.exit(1)
  }

  console.log(`🔗 连接到 Turso: ${url}`)

  const result = await migrateTurso({ url, authToken, forceReset })

  if (result.applied === 0) {
    console.log("\n✨ 数据库已是最新状态，无需迁移")
  } else {
    console.log(`\n✅ 成功应用 ${result.applied} 个迁移`)
  }
}

main().catch((err) => {
  console.error("❌ 迁移脚本出错:", err)
  process.exit(1)
})
