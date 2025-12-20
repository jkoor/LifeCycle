import { PrismaClient } from "@prisma/client"

/**
 * Prisma Client 单例
 * 
 * 在开发模式下防止热重载导致多个 Prisma 实例
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
