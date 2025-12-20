"use client"

/**
 * SessionProvider Component
 * 
 * Wraps the application with NextAuth SessionProvider to enable
 * client-side session access via useSession hook.
 */

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

interface SessionProviderProps {
    children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
    return (
        <NextAuthSessionProvider>
            {children}
        </NextAuthSessionProvider>
    )
}
