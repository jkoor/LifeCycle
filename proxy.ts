import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * NextAuth.js 中间件 (Next.js 16+ 使用 proxy.ts)
 *
 * 路由保护策略:
 * 1. /dashboard/* - 需要认证
 * 2. /api/* (除了 /api/auth/*) - 需要认证
 * 3. /login, /register - 已登录用户自动重定向到 dashboard
 * 4. / - 根路径，已登录用户重定向到 dashboard
 *
 * 重定向规则:
 * - 未登录访问受保护页面 → /login (带 callbackUrl)
 * - 已登录访问认证页面 → /dashboard
 * - 已登录访问根路径 → /dashboard
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // 定义路由类型
  const isProtectedRoute = pathname.startsWith("/dashboard")
  const isApiRoute =
    pathname.startsWith("/api") && !pathname.startsWith("/api/auth")
  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isRootPath = pathname === "/"

  // 场景 1: 未登录用户访问受保护的路由
  if (!isLoggedIn && (isProtectedRoute || isApiRoute)) {
    // API 路由返回 401 错误而不是重定向
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Unauthorized", message: "请先登录" },
        { status: 401 },
      )
    }

    // 页面路由重定向到登录页，并保存原始 URL
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 场景 2: 已登录用户访问认证页面 (登录、注册等)
  if (isLoggedIn && isAuthPage) {
    // 检查是否有 callbackUrl，如果有则重定向到该 URL
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl")
    if (callbackUrl && callbackUrl.startsWith("/")) {
      return NextResponse.redirect(new URL(callbackUrl, req.url))
    }
    // 否则重定向到 dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 场景 3: 已登录用户访问根路径，重定向到 dashboard
  if (isLoggedIn && isRootPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 其他情况正常通过
  return NextResponse.next()
})

// 配置中间件匹配器
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - _next/static (Next.js 静态文件)
     * - _next/image (Next.js 图片优化)
     * - favicon.ico (网站图标)
     * - 静态资源文件 (svg, png, jpg, jpeg, gif, webp)
     * - robots.txt, sitemap.xml 等 SEO 文件
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
