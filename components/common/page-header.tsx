"use client"

import React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { useScrollState } from "@/components/providers/scroll-provider"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

/**
 * 统一的页面标题组件
 *
 * 功能：
 * - 固定在内容区顶部
 * - 移动端向下滚动时隐藏副标题，只显示标题
 * - 响应式字体大小
 */
export function PageHeader({
  title,
  description,
  children,
  bottom,
  className,
}: PageHeaderProps & { bottom?: React.ReactNode }) {
  const { isScrolled } = useScrollState()

  return (
    <header
      className={cn(
        "sticky top-0 z-40 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:static",
        className,
      )}
    >
      <div className="px-4 py-4 md:py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl lg:text-3xl truncate">
              {title}
            </h1>
            {description && (
              <motion.p
                initial={false}
                animate={{
                  height: isScrolled ? 0 : "auto",
                  opacity: isScrolled ? 0 : 1,
                  marginTop: isScrolled ? 0 : 4,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-xs text-muted-foreground md:mt-1 md:text-sm overflow-hidden md:!h-auto md:!opacity-100 md:!mt-1"
              >
                {description}
              </motion.p>
            )}
          </div>
          {children && <div className="shrink-0">{children}</div>}
        </div>
        {bottom}
      </div>
    </header>
  )
}
