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
  prismaPromise: Promise<PrismaClient> | undefined
}

async function createPrismaClient(): Promise<PrismaClient> {
  const hasTursoConfig =
    !!process.env.TURSO_DATABASE_URL && !!process.env.TURSO_AUTH_TOKEN
  const provider = process.env.DATABASE_PROVIDER ?? (hasTursoConfig ? "turso" : "sqlite")

  if (provider === "turso") {
    const { PrismaLibSQL } = await import("@prisma/adapter-libsql")
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url) {
      throw new Error(
        "DATABASE_PROVIDER 为 turso 时，必须设置 TURSO_DATABASE_URL 环境变量"
      )
    }
    if (!authToken) {
      throw new Error(
        "DATABASE_PROVIDER 为 turso 时，必须设置 TURSO_AUTH_TOKEN 环境变量"
      )
    }

    const adapter = new PrismaLibSQL({ url, authToken })
    return new PrismaClient({ adapter })
  }

  // 默认：本地 SQLite，使用 @prisma/adapter-better-sqlite3
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3")
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./dev.db",
  })
  return new PrismaClient({ adapter })
}

const prismaPromise = globalForPrisma.prismaPromise ?? createPrismaClient()
export const prisma = await prismaPromise

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaPromise = prismaPromise
  globalForPrisma.prisma = prisma
}
