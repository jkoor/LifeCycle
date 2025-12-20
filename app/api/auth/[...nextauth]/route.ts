import { handlers } from "@/auth"

/**
 * NextAuth.js API 路由处理器
 * 
 * 处理所有认证相关的请求:
 * - GET /api/auth/signin - 登录页面
 * - POST /api/auth/signin - 登录处理
 * - GET /api/auth/signout - 登出页面
 * - POST /api/auth/signout - 登出处理
 * - GET /api/auth/session - 获取会话
 * - GET /api/auth/csrf - CSRF Token
 * - GET /api/auth/providers - 获取提供商列表
 */
export const { GET, POST } = handlers
