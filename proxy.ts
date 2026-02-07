import { betterFetch } from "@better-fetch/fetch"
import { NextResponse, type NextRequest } from "next/server"
import type { Session } from "better-auth/types"

export default async function authMiddleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
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
