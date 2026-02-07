import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

/**
 * Auth.js v5 配置
 *
 * 核心配置包括:
 * - Providers: 支持凭证登录 (邮箱/密码)
 * - Session: 使用 JWT 策略
 * - Pages: 自定义认证页面路径
 * - Callbacks: 会话和 JWT 回调
 */
export const authConfig: NextAuthConfig = {
  // Secret for JWT encryption
  secret: process.env.AUTH_SECRET,

  // 使用 JWT 策略 (无服务器友好)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },

  // 自定义页面路径
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/dashboard", // 新用户注册后跳转
  },

  // 认证提供商
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@email.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password,
        )

        if (!isPasswordValid) {
          return null
        }

        // 确保email不为null，符合NextAuth User类型
        if (!user.email) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],

  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Verify user still exists in database
        const userExists = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true },
        })

        if (!userExists) {
          // User was deleted, invalidate session
          return { ...session, user: undefined } as typeof session
        }

        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },
  },

  // 调试模式 (开发环境)
  debug: process.env.NODE_ENV === "development",
}
