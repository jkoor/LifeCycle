/**
 * 过期检查服务 (Expiry Checker Service)
 *
 * 核心业务逻辑层 —— 与触发方式完全解耦。
 * 可由 Cron API、手动按钮、队列消费者等任意触发器调用。
 *
 * 职责:
 *  1. 查询即将过期 / 已过期的物品
 *  2. 按用户分组
 *  3. 去重（通过 NotificationLog 避免重复通知）
 *  4. 调用 webhook-sender 发送通知
 *  5. 记录通知日志
 */

import { prisma } from "@/lib/prisma"
import {
  sendToAllWebhooks,
  type TemplateVariables,
  type WebhookConfig,
  type WebhookSendResult,
} from "./webhook-sender"

// ==========================================
// 类型定义
// ==========================================

/** 单个需要通知的过期物品 */
interface ExpiringItem {
  id: string
  name: string
  brand: string | null
  stock: number
  categoryName: string
  userId: string
  /** 到期日期 */
  expiryDate: Date
  /** 距到期剩余天数 (负数表示已过期) */
  daysLeft: number
  /** 通知类型 */
  type: "expiry" | "lifespan"
}

/** 按用户分组的通知任务 */
interface UserNotificationTask {
  userId: string
  items: ExpiringItem[]
  webhookConfigs: WebhookConfig[]
}

/** 检查运行结果摘要 */
export interface ExpiryCheckResult {
  /** 检查的物品总数 */
  totalItemsChecked: number
  /** 需要通知的物品数量 */
  expiringItemsFound: number
  /** 实际发送的通知数量 (去重后) */
  notificationsSent: number
  /** 发送失败的通知数量 */
  notificationsFailed: number
  /** 跳过的通知数量 (已发送过) */
  notificationsSkipped: number
  /** 涉及的用户数量 */
  usersNotified: number
  /** 执行耗时 (ms) */
  durationMs: number
  /** 错误详情 (如有) */
  errors: string[]
}

// ==========================================
// 核心：查询即将过期的物品
// ==========================================

/**
 * 查询所有需要通知的过期物品
 *
 * 判定逻辑:
 *  1. expirationDate (绝对日期) — 到 expirationDate 距今 <= notifyAdvanceDays
 *  2. shelfLifeDays + lastOpenedAt — 开封后保质期 = lastOpenedAt + shelfLifeDays
 *  3. lifespanDays + lastOpenedAt — 使用寿命 = lastOpenedAt + lifespanDays
 *
 * 排除:
 *  - notifyAdvanceDays = -1 (用户禁用通知)
 *  - isArchived = true (已归档)
 *  - stock <= 0  (无库存)
 */
async function findExpiringItems(): Promise<ExpiringItem[]> {
  const now = new Date()
  const results: ExpiringItem[] = []

  // 查询所有未归档、有库存、启用通知的物品
  const items = await prisma.item.findMany({
    where: {
      isArchived: false,
      stock: { gt: 0 },
      notifyAdvanceDays: { gt: 0 }, // > 0 表示启用通知
    },
    include: {
      category: { select: { name: true } },
    },
  })

  for (const item of items) {
    const advanceDays = item.notifyAdvanceDays

    // ── 场景 1: 绝对过期日期 ──
    if (item.expirationDate) {
      const daysLeft = diffInDays(item.expirationDate, now)
      if (daysLeft <= advanceDays) {
        results.push({
          id: item.id,
          name: item.name,
          brand: item.brand,
          stock: item.stock,
          categoryName: item.category.name,
          userId: item.userId,
          expiryDate: item.expirationDate,
          daysLeft,
          type: "expiry",
        })
        continue // 优先使用绝对日期，跳过相对计算
      }
    }

    // ── 场景 2: 开封后保质期 (shelfLifeDays) ──
    if (item.shelfLifeDays && item.lastOpenedAt) {
      const shelfExpiryDate = addDays(item.lastOpenedAt, item.shelfLifeDays)
      const daysLeft = diffInDays(shelfExpiryDate, now)
      if (daysLeft <= advanceDays) {
        results.push({
          id: item.id,
          name: item.name,
          brand: item.brand,
          stock: item.stock,
          categoryName: item.category.name,
          userId: item.userId,
          expiryDate: shelfExpiryDate,
          daysLeft,
          type: "expiry",
        })
        continue
      }
    }

    // ── 场景 3: 使用寿命 (lifespanDays) ──
    if (item.lifespanDays && item.lastOpenedAt) {
      const lifespanExpiryDate = addDays(item.lastOpenedAt, item.lifespanDays)
      const daysLeft = diffInDays(lifespanExpiryDate, now)
      if (daysLeft <= advanceDays) {
        results.push({
          id: item.id,
          name: item.name,
          brand: item.brand,
          stock: item.stock,
          categoryName: item.category.name,
          userId: item.userId,
          expiryDate: lifespanExpiryDate,
          daysLeft,
          type: "lifespan",
        })
      }
    }
  }

  return results
}

// ==========================================
// 核心：按用户分组 & 获取 Webhook 配置
// ==========================================

async function buildNotificationTasks(
  items: ExpiringItem[],
): Promise<UserNotificationTask[]> {
  // 按用户分组
  const userItemsMap = new Map<string, ExpiringItem[]>()
  for (const item of items) {
    const list = userItemsMap.get(item.userId) ?? []
    list.push(item)
    userItemsMap.set(item.userId, list)
  }

  const userIds = Array.from(userItemsMap.keys())
  if (userIds.length === 0) return []

  // 批量获取所有相关用户的 Webhook 配置
  const webhookConfigs = await prisma.webhookConfig.findMany({
    where: {
      userId: { in: userIds },
      enabled: true,
    },
  })

  // 按用户 ID 索引 webhook 配置
  const userWebhookMap = new Map<string, WebhookConfig[]>()
  for (const config of webhookConfigs) {
    const list = userWebhookMap.get(config.userId) ?? []
    list.push(config)
    userWebhookMap.set(config.userId, list)
  }

  // 组装任务（只保留有 webhook 配置的用户）
  const tasks: UserNotificationTask[] = []
  for (const [userId, items] of userItemsMap) {
    const configs = userWebhookMap.get(userId)
    if (configs && configs.length > 0) {
      tasks.push({ userId, items, webhookConfigs: configs })
    }
  }

  return tasks
}

// ==========================================
// 核心：去重 + 发送 + 记录日志
// ==========================================

async function processNotificationTask(
  task: UserNotificationTask,
): Promise<{
  sent: number
  failed: number
  skipped: number
  errors: string[]
}> {
  let sent = 0
  let failed = 0
  let skipped = 0
  const errors: string[] = []

  for (const item of task.items) {
    const expiryDateStr = item.expiryDate.toISOString().split("T")[0]

    // ── 去重检查：是否已对该物品+到期日发送过通知 ──
    for (const webhook of task.webhookConfigs) {
      const existing = await prisma.notificationLog.findUnique({
        where: {
          itemId_webhookId_expiryDate: {
            itemId: item.id,
            webhookId: webhook.id,
            expiryDate: expiryDateStr,
          },
        },
      })

      if (existing) {
        skipped++
        continue
      }

      // ── 构造模板变量 ──
      const variables: TemplateVariables = {
        itemName: item.name,
        expiryDate: expiryDateStr,
        daysLeft:
          item.daysLeft <= 0
            ? `已过期 ${Math.abs(item.daysLeft)} 天`
            : `${item.daysLeft} 天`,
        categoryName: item.categoryName,
        brand: item.brand ?? undefined,
        stock: String(item.stock),
      }

      // ── 发送通知 ──
      const results: WebhookSendResult[] = await sendToAllWebhooks(
        [webhook],
        variables,
      )
      const result = results[0]

      // ── 记录日志 ──
      try {
        await prisma.notificationLog.create({
          data: {
            itemId: item.id,
            userId: task.userId,
            webhookId: webhook.id,
            type: item.type,
            expiryDate: expiryDateStr,
            success: result?.success ?? false,
            errorMsg: result?.error ?? null,
          },
        })
      } catch (logError) {
        // 日志写入失败不影响主流程
        console.error("[ExpiryChecker] Failed to write notification log:", logError)
      }

      if (result?.success) {
        sent++
      } else {
        failed++
        errors.push(
          `[${item.name}] Webhook(${webhook.id}): ${result?.error ?? "Unknown error"}`,
        )
      }
    }
  }

  return { sent, failed, skipped, errors }
}

// ==========================================
// 公共入口：执行过期检查
// ==========================================

/**
 * 执行一次完整的过期物品检查与通知流程
 *
 * 这是唯一的公共 API —— 触发器只需调用此函数。
 */
export async function runExpiryCheck(): Promise<ExpiryCheckResult> {
  const startTime = Date.now()
  const errors: string[] = []

  let totalItemsChecked = 0
  let expiringItemsFound = 0
  let notificationsSent = 0
  let notificationsFailed = 0
  let notificationsSkipped = 0
  let usersNotified = 0

  try {
    // 1. 查询过期物品
    const allItems = await prisma.item.count({
      where: { isArchived: false, stock: { gt: 0 } },
    })
    totalItemsChecked = allItems

    const expiringItems = await findExpiringItems()
    expiringItemsFound = expiringItems.length

    if (expiringItems.length === 0) {
      return {
        totalItemsChecked,
        expiringItemsFound: 0,
        notificationsSent: 0,
        notificationsFailed: 0,
        notificationsSkipped: 0,
        usersNotified: 0,
        durationMs: Date.now() - startTime,
        errors: [],
      }
    }

    // 2. 构建通知任务
    const tasks = await buildNotificationTasks(expiringItems)
    usersNotified = tasks.length

    // 3. 逐用户处理（用户间串行，单用户内 webhook 并发由 sendToAllWebhooks 处理）
    for (const task of tasks) {
      const result = await processNotificationTask(task)
      notificationsSent += result.sent
      notificationsFailed += result.failed
      notificationsSkipped += result.skipped
      errors.push(...result.errors)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    errors.push(`[Fatal] ${message}`)
    console.error("[ExpiryChecker] Fatal error:", error)
  }

  return {
    totalItemsChecked,
    expiringItemsFound,
    notificationsSent,
    notificationsFailed,
    notificationsSkipped,
    usersNotified,
    durationMs: Date.now() - startTime,
    errors,
  }
}

// ==========================================
// 工具函数
// ==========================================

/** 计算两个日期之间的天数差 (target - now)，向下取整 */
function diffInDays(target: Date, now: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((target.getTime() - now.getTime()) / msPerDay)
}

/** 为日期加上指定天数 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
