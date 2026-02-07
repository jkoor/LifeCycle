"use client"

import { useSession as useBetterAuthSession } from "@/lib/auth-client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useSession() {
  const { data: session, isPending, error } = useBetterAuthSession()

  const status = isPending
    ? "loading"
    : session
      ? "authenticated"
      : "unauthenticated"

  return {
    session,
    status,
    update: () => {}, // better-auth handles updates differently, placeholder for now
    isLoading: isPending,
    isAuthenticated: !!session,
    isUnauthenticated: !isPending && !session,
    error,
  }
}

export function useUser() {
  const { session } = useSession()
  return session?.user || null
}

export function useUserId() {
  const user = useUser()
  return user?.id || null
}

export function useRequireAuth(onUnauthenticated?: () => void) {
  const { session, isAuthenticated, isLoading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (onUnauthenticated) {
        onUnauthenticated()
      } else {
        router.push("/login")
      }
    }
  }, [isAuthenticated, isLoading, onUnauthenticated, router])

  return isAuthenticated && session ? session.user : null
}
