"use client"

import { usePathname } from "next/navigation"
import { DockNav, AppSidebar } from "@/components/navigation"
import type { Category } from "@prisma/client"

interface NavigationWrapperProps {
  categories?: Category[]
}

/**
 * 导航包装组件
 * 根据当前路由决定是否显示导航栏
 * 桌面端显示侧边栏，移动端显示底部 Dock
 */
export function NavigationWrapper({ categories = [] }: NavigationWrapperProps) {
  const pathname = usePathname()

  // 不显示导航的路由路径
  const hideNavPaths = ["/login", "/register"]

  // 检查是否应该隐藏导航
  const shouldHideNav = hideNavPaths.some((path) => pathname === path)

  if (shouldHideNav) {
    return null
  }

  return (
    <>
      {/* Desktop: Sidebar */}
      <div className="hidden md:block">
        <AppSidebar categories={categories} />
      </div>
      {/* Mobile: Dock bar */}
      <div className="md:hidden">
        <DockNav categories={categories} />
      </div>
    </>
  )
}
