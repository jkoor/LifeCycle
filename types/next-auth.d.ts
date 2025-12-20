import { DefaultSession } from "next-auth"

/**
 * 扩展 NextAuth 类型定义
 * 添加自定义字段到 session 和 token
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name: string | null
    image: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}
