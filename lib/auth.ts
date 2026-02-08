import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { twoFactor } from "better-auth/plugins"
import { passkey } from "@better-auth/passkey"
import { prisma } from "@/lib/prisma"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  appName: "Lifecycle",
  baseURL: `http://127.0.0.1:${process.env.PORT || 3000}`,
  // 从请求的 Origin header 自动推断受信来源，无需手动配置域名
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
    nextCookies(), // Make sure to include this for Next.js
    twoFactor({
      issuer: "Lifecycle",
      skipVerificationOnEnable: false,
    }),
    passkey(),
  ],
})
