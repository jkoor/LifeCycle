import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * NextAuth.js 中间件
 * 
 * 保护需要认证的路由:
 * - /dashboard/*
 * - /api/* (除了 /api/auth/*)
 * 
 * 重定向规则:
 * - 未登录访问受保护页面 → /auth/login
 * - 已登录访问登录页 → /dashboard
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // 受保护的路由
  const isProtectedRoute = pathname.startsWith("/dashboard")
  const isApiRoute = pathname.startsWith("/api") && !pathname.startsWith("/api/auth")
  
  // 认证页面
  const isAuthPage = pathname.startsWith("/auth")

  // 未登录用户访问受保护路由
  if (!isLoggedIn && (isProtectedRoute || isApiRoute)) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录用户访问认证页面
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

// 配置需要运行中间件的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹中的文件
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
