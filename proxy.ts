import { betterFetch } from "@better-fetch/fetch"
import { NextResponse, type NextRequest } from "next/server"
import type { Session } from "better-auth/types"

/**
 * 内部请求直接走 localhost，避免经过反向代理产生 HTTPS→HTTP 错误
 */
const INTERNAL_BASE_URL = `http://127.0.0.1:${process.env.PORT || 3000}`

export default async function authMiddleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: INTERNAL_BASE_URL,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  )

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  // 注意: /api/cron/* 不在此列表中，由路由自身通过 CRON_SECRET 鉴权
  matcher: ["/dashboard/:path*", "/inventory/:path*", "/me/:path*"],
}
