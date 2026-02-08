/**
 * Next.js Instrumentation Hook
 *
 * 在 Next.js 服务器启动时执行一次。
 * 用于初始化进程级的后台任务（如 cron 调度器）。
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // 仅在 Node.js 运行时启动 (排除 Edge Runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("@/lib/services/cron-scheduler")
    startScheduler()
  }
}
