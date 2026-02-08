/**
 * Next.js Instrumentation Hook
 *
 * 在 Next.js 服务器启动时执行一次。
 * 用于初始化进程级的后台任务（如 cron 调度器）和自动数据库迁移。
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // 仅在 Node.js 运行时启动 (排除 Edge Runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Turso 模式：启动时自动应用数据库迁移
    if (process.env.DATABASE_PROVIDER === "turso") {
      const { migrateTurso } = await import("@/lib/services/turso-migrate")
      const url = process.env.TURSO_DATABASE_URL
      const authToken = process.env.TURSO_AUTH_TOKEN

      if (url && authToken) {
        try {
          const result = await migrateTurso({ url, authToken })
          if (result.applied > 0) {
            console.log(
              `[instrumentation] Turso 自动迁移完成，应用了 ${result.applied} 个迁移`
            )
          } else {
            console.log("[instrumentation] Turso 数据库已是最新状态")
          }
        } catch (error) {
          console.error("[instrumentation] Turso 自动迁移失败:", error)
          // 不阻塞启动，但记录错误
        }
      }
    }

    const { startScheduler } = await import("@/lib/services/cron-scheduler")
    startScheduler()
  }
}
