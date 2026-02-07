/**
 * Cron API: 过期物品检查
 *
 * 薄触发层 —— 仅负责:
 *  1. 验证 CRON_SECRET（安全保护）
 *  2. 调用业务逻辑服务
 *  3. 返回执行结果
 *
 * 触发方式:
 *  - Vercel Cron Jobs (vercel.json)
 *  - GitHub Actions
 *  - 外部调度器 (curl + CRON_SECRET)
 *  - 手动调用 (POST /api/cron/check-expiry)
 *
 * 安全:
 *  - 必须在请求头中携带 Authorization: Bearer <CRON_SECRET>
 *  - Vercel Cron 自动注入的 x-vercel-cron-token (production only) 也会被校验
 */

import { NextRequest, NextResponse } from "next/server"
import { runExpiryCheck } from "@/lib/services/expiry-checker"

// ==========================================
// 安全校验
// ==========================================

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET

  // 如果未配置 CRON_SECRET，拒绝所有请求（安全默认策略）
  if (!cronSecret) {
    console.error(
      "[Cron] CRON_SECRET is not configured. Rejecting all cron requests.",
    )
    return false
  }

  // 方式 1: Authorization: Bearer <secret>
  const authHeader = request.headers.get("authorization")
  if (authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  // 方式 2: Vercel Cron 自动注入的 header（生产环境）
  const vercelCronToken = request.headers.get("x-vercel-cron-token")
  if (vercelCronToken === cronSecret) {
    return true
  }

  return false
}

// ==========================================
// GET handler — 兼容 Vercel Cron (仅支持 GET)
// ==========================================

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await runExpiryCheck()

    console.log("[Cron] Expiry check completed:", {
      itemsChecked: result.totalItemsChecked,
      expiringFound: result.expiringItemsFound,
      sent: result.notificationsSent,
      failed: result.notificationsFailed,
      skipped: result.notificationsSkipped,
      duration: `${result.durationMs}ms`,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("[Cron] Expiry check failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

// ==========================================
// POST handler — 供手动触发 / 外部调度器使用
// ==========================================

export async function POST(request: NextRequest) {
  // 复用同一鉴权 & 逻辑
  return GET(request)
}
