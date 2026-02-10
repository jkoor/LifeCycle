import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { twoFactor } from "better-auth/plugins"
import { passkey } from "@better-auth/passkey"
import { prisma } from "@/lib/prisma"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  appName: "Lifecycle",
  // 不设置 baseURL — 让 better-auth 从每个请求的 Host header 自动推断
  // 这样 passkey 的 rpID 会自动匹配用户实际访问的域名
  // 内部 SSR 请求的路由由 auth-client.ts / proxy.ts 独立处理
  trustedOrigins: (request) => {
    if (!request) return []
    const origin = request.headers.get("origin")
    return origin ? [origin] : []
  },
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [
    nextCookies(),
    twoFactor({
      issuer: "Lifecycle",
      skipVerificationOnEnable: false,
    }),
    passkey(),
  ],
})
