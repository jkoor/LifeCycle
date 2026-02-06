"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Plus, BarChart, User, Compass } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { AddItemModal } from "@/components/modules/item/ui"
import { Category } from "@prisma/client"

interface DockNavProps {
  categories?: Category[]
}

export function DockNav({ categories = [] }: DockNavProps) {
  const pathname = usePathname()

  // Check if path is active - special case for home page
  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // Define nav structure for cleaner mapping
  const navItems = [
    { href: "/dashboard", icon: Home, label: "首页" },
    { href: "/inventory", icon: LayoutGrid, label: "管理" },
    // Middle item is the Add button, handled separately
    { href: "/analysis", icon: Compass, label: "发现" }, // Using Compass for "Discovery/Analysis" to match reference vibe if needed, or stick to BarChart
    { href: "/me", icon: User, label: "我的" },
  ]

  // We'll split items around the add button
  const leftItems = navItems.slice(0, 2)
  const rightItems = navItems.slice(2)

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 mx-auto flex w-max justify-center">
      <div className="flex items-center gap-0.5 rounded-2xl border border-black/8 bg-background/85 px-2 py-1.5 shadow-lg shadow-black/10 dark:border-white/10 dark:bg-background/80">
        {/* Left Items */}
        {leftItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={isPathActive(item.href)}
          />
        ))}

        {/* Center Add Button - smaller with primary theme color */}
        <div className="mx-2">
          <AddItemModal categories={categories}>
            <button className="flex h-9 w-12 items-center justify-center rounded-full bg-primary/90 shadow-sm shadow-primary/20 ring-[3px] ring-primary/15 backdrop-blur-sm transition-all duration-200 hover:brightness-110 active:scale-95">
              <Plus className="h-4.5 w-4.5 text-primary-foreground stroke-[3px]" />
            </button>
          </AddItemModal>
        </div>

        {/* Right Items */}
        {rightItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={isPathActive(item.href)}
          />
        ))}
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center"
    >
      <div
        className={cn(
          "relative flex h-11 w-14 flex-col items-center justify-center gap-0.5 rounded-lg transition-all duration-300",
          isActive ? "" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {/* Active Pill Background - blur effect */}
        {isActive && (
          <motion.div
            layoutId="active-nav-pill"
            className="absolute inset-0 rounded-lg bg-primary/10 backdrop-blur-sm dark:bg-primary/15"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Icon & Label - elevated above background */}
        <div
          className={cn(
            "relative z-10 flex flex-col items-center gap-0.5",
            isActive && "text-primary",
          )}
        >
          <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
          <span className="text-[9px] font-medium leading-none">{label}</span>
        </div>
      </div>
    </Link>
  )
}
