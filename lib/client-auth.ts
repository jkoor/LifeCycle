"use client"

/**
 * 客户端会话钩子
 * 
 * 这些钩子用于在客户端组件中访问会话信息
 * 使用 Auth.js 提供的 useSession hook
 */

import { useSession as useNextAuthSession } from "next-auth/react"
import { useEffect } from "react"

/**
 * 获取客户端会话
 * 
 * @returns 会话状态对象，包含 data, status, update
 * 
 * @example
 * ```tsx
 * "use client"
 * 
 * export function MyComponent() {
 *   const { session, status, isLoading, isAuthenticated } = useSession()
 *   
 *   if (isLoading) {
 *     return <div>加载中...</div>
 *   }
 *   
 *   if (!isAuthenticated) {
 *     return <div>请先登录</div>
 *   }
 *   
 *   return <div>欢迎, {session?.user?.name}</div>
 * }
 * ```
 */
export function useSession() {
  const { data: session, status, update } = useNextAuthSession()

  return {
    session,
    status,
    update,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  }
}

/**
 * 获取当前用户信息
 * 
 * @returns 用户对象或 null
 * 
 * @example
 * ```tsx
 * "use client"
 * 
 * export function UserGreeting() {
 *   const user = useUser()
 *   
 *   if (!user) {
 *     return <div>请先登录</div>
 *   }
 *   
 *   return <div>你好, {user.name}!</div>
 * }
 * ```
 */
export function useUser() {
  const { session } = useSession()
  return session?.user || null
}

/**
 * 获取当前用户 ID
 * 
 * @returns 用户 ID 或 null
 * 
 * @example
 * ```tsx
 * "use client"
 * 
 * export function MyComponent() {
 *   const userId = useUserId()
 *   
 *   if (!userId) {
 *     return <div>未登录</div>
 *   }
 *   
 *   return <div>用户 ID: {userId}</div>
 * }
 * ```
 */
export function useUserId() {
  const user = useUser()
  return user?.id || null
}

/**
 * 要求用户必须登录
 * 
 * 如果用户未登录，返回 null 并可选地执行回调
 * 
 * @param onUnauthenticated - 未登录时的回调函数（可选）
 * @returns 用户对象或 null
 * 
 * @example
 * ```tsx
 * "use client"
 * 
 * import { useRouter } from "next/navigation"
 * 
 * export function ProtectedComponent() {
 *   const router = useRouter()
 *   const user = useRequireAuth(() => {
 *     router.push("/auth/login")
 *   })
 *   
 *   if (!user) {
 *     return <div>重定向中...</div>
 *   }
 *   
 *   return <div>受保护的内容</div>
 * }
 * ```
 */
export function useRequireAuth(onUnauthenticated?: () => void) {
  const { session, isAuthenticated } = useSession()

  // 使用 useEffect 处理重定向，避免在渲染期间调用 setState
  useEffect(() => {
    if (!isAuthenticated && onUnauthenticated) {
      onUnauthenticated()
    }
  }, [isAuthenticated, onUnauthenticated])

  return isAuthenticated && session ? session.user : null
}
