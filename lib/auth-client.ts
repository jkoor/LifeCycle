import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"

function getBaseURL() {
  // 浏览器端：始终使用当前页面 origin，避免自定义域名与 Vercel URL 不一致导致 CORS
  if (typeof window !== "undefined") return window.location.origin
  // 服务端：优先使用显式配置
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  // Vercel 自动注入（仅服务端使用）
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  return "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    twoFactorClient(),
    passkeyClient(),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
