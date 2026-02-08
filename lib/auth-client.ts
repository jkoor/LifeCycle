import { createAuthClient } from "better-auth/react"
import { twoFactorClient } from "better-auth/client/plugins"
import { passkeyClient } from "@better-auth/passkey/client"

function getBaseURL() {
  // 浏览器端：始终使用当前页面 origin，避免自定义域名与 Vercel URL 不一致导致 CORS
  if (typeof window !== "undefined") return window.location.origin
  // 服务端（SSR）：内部请求直接走 127.0.0.1，避免经过反向代理产生 HTTPS→HTTP 错误
  // 注：使用 127.0.0.1 而非 localhost，避免 Alpine 将 localhost 解析为 IPv6
  return `http://127.0.0.1:${process.env.PORT || 3000}`
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    twoFactorClient(),
    passkeyClient(),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
