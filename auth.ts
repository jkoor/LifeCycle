import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

/**
 * NextAuth.js v5 实例
 * 
 * 导出的对象:
 * - handlers: { GET, POST } - API 路由处理器
 * - auth: 服务端验证函数
 * - signIn: 登录函数
 * - signOut: 登出函数
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
