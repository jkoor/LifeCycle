"use client"

import { ScrollProvider } from "@/components/providers/scroll-provider"

interface ClientLayoutProps {
  children: React.ReactNode
}

/**
 * 客户端布局包装器
 * 提供滚动状态 Context
 */
export function ClientLayout({ children }: ClientLayoutProps) {
  return <ScrollProvider>{children}</ScrollProvider>
}
