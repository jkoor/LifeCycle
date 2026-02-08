/**
 * Cron Scheduler 服务
 *
 * 使用 node-cron 在 Node.js 进程内运行定时任务。
 * 适用于自托管部署 (Docker / VPS / PM2 等)。
 *
 * 所有可配置项均通过环境变量暴露:
 *
 *  CRON_SCHEDULE        — cron 表达式，默认 "0 9 * * *" (每天 09:00)
 *  CRON_TIMEZONE        — 时区，默认 "Asia/Shanghai"
 *  CRON_ENABLED         — 是否启用内置调度器，默认 "true"
 *  WEBHOOK_TIMEOUT_MS   — 单个 Webhook 请求超时 (ms)，默认 "10000"
 *
 * 该模块通过 Next.js instrumentation hook 在服务器启动时自动加载。
 */

import cron from "node-cron"
import type { ScheduledTask } from "node-cron"
import { runExpiryCheck } from "./expiry-checker"

// ==========================================
// 环境变量 & 默认值
// ==========================================

/** Cron 表达式 (默认每天 09:00) */
const CRON_SCHEDULE = process.env.CRON_SCHEDULE ?? "0 9 * * *"

/** Cron 时区 (默认上海) */
const CRON_TIMEZONE = process.env.CRON_TIMEZONE ?? "Asia/Shanghai"

/** 是否启用内置 cron 调度器 */
const CRON_ENABLED = process.env.CRON_ENABLED !== "false" // 默认启用

// ==========================================
// 全局状态 (方便外部管理生命周期)
// ==========================================

let scheduledTask: ScheduledTask | null = null

/**
 * 获取当前运行的 cron 任务实例
 * 用于外部管理 (停止、销毁等)
 */
export function getScheduledTask(): ScheduledTask | null {
  return scheduledTask
}

/**
 * 检查 cron 调度器是否正在运行
 */
export function isSchedulerRunning(): boolean {
  return scheduledTask !== null
}

// ==========================================
// 启动 / 停止
// ==========================================

/**
 * 启动 cron 调度器
 *
 * 在 Next.js instrumentation hook 中调用。
 * 多次调用是安全的 —— 会先停止旧任务。
 */
export function startScheduler(): void {
  if (!CRON_ENABLED) {
    console.log("[CronScheduler] Disabled via CRON_ENABLED=false")
    return
  }

  // 校验 cron 表达式
  if (!cron.validate(CRON_SCHEDULE)) {
    console.error(
      `[CronScheduler] Invalid CRON_SCHEDULE: "${CRON_SCHEDULE}". Scheduler not started.`,
    )
    return
  }

  // 幂等: 停止已有任务
  stopScheduler()

  scheduledTask = cron.schedule(
    CRON_SCHEDULE,
    async () => {
      const startedAt = new Date().toISOString()
      console.log(`[CronScheduler] Expiry check started at ${startedAt}`)

      try {
        const result = await runExpiryCheck()

        console.log("[CronScheduler] Expiry check completed:", {
          itemsChecked: result.totalItemsChecked,
          expiringFound: result.expiringItemsFound,
          sent: result.notificationsSent,
          failed: result.notificationsFailed,
          skipped: result.notificationsSkipped,
          users: result.usersNotified,
          duration: `${result.durationMs}ms`,
          errors: result.errors.length > 0 ? result.errors : undefined,
        })
      } catch (error) {
        console.error("[CronScheduler] Expiry check failed:", error)
      }
    },
    {
      timezone: CRON_TIMEZONE,
    },
  )

  console.log(
    `[CronScheduler] Started — schedule: "${CRON_SCHEDULE}", timezone: "${CRON_TIMEZONE}"`,
  )
}

/**
 * 停止 cron 调度器
 */
export function stopScheduler(): void {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
    console.log("[CronScheduler] Stopped")
  }
}
