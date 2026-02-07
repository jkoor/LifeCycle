"use client"

import React, { useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useScrollState } from "@/components/providers/scroll-provider"

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * 页面内容容器
 *
 * 功能：
 * - 监听滚动事件并更新 ScrollContext
 * - 提供独立的滚动区域
 */
export function PageContent({ children, className }: PageContentProps) {
  const { handleScroll } = useScrollState()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Desktop: Internal scroll handling
  const onScroll = useCallback(() => {
    if (scrollRef.current) {
      handleScroll(scrollRef.current.scrollTop)
    }
  }, [handleScroll])

  // Mobile: Global scroll handling
  useEffect(() => {
    const handleWindowScroll = () => {
      // Only handle window scroll if we are not in a desktop layout (check width or assume mobile based on layout)
      // Since layout structure changes, we can just listen to window scroll.
      // However, on desktop, the window doesn't scroll, the container does.
      // So this listener won't fire on desktop, which is fine.
      handleScroll(window.scrollY)
    }

    window.addEventListener("scroll", handleWindowScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleWindowScroll)
  }, [handleScroll])

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={cn("flex-1 md:overflow-y-auto", className)}
    >
      {children}
    </div>
  )
}
