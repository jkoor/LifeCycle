import { PrismaClient } from "@/generated/prisma/client"

/**
 * Prisma Client 单例
 *
 * 支持两种数据库模式：
 * - 本地 SQLite：本地开发 & Docker 部署，DATABASE_URL 使用 file: 协议
 * - Turso (LibSQL)：Serverless 平台 (Vercel 等)，需设置 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN
 *
 * 通过环境变量 DATABASE_PROVIDER 控制：
 * - "sqlite" (默认)：使用本地 SQLite 文件
 * - "turso"：使用 Turso 远程数据库
 *
 * Prisma 7: 所有数据库都需要 driver adapter
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const hasTursoConfig =
    !!process.env.TURSO_DATABASE_URL && !!process.env.TURSO_AUTH_TOKEN
  const provider =
    process.env.DATABASE_PROVIDER ?? (hasTursoConfig ? "turso" : "sqlite")

  if (provider === "turso") {
    // Turso / LibSQL Adapter
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url || !authToken) {
      throw new Error(
        "Using Turso requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN",
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql")
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client")

    const libsql = createClient({
      url,
      authToken,
    })

    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
  } else {
    // Local SQLite Adapter
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3")
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3")

    const databaseUrl = process.env.DATABASE_URL || "file:./dev.db"
    // Extract filename from "file:./dev.db" -> "./dev.db"
    const filename = databaseUrl.replace(/^file:/, "")

    const db = new Database(filename)
    const adapter = new PrismaBetterSqlite3(db)

    return new PrismaClient({ adapter })
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
