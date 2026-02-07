"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Box, Plus, Compass, User } from "lucide-react"
import { motion, useMotionValue, useTransform, useSpring } from "motion/react"

import { cn } from "@/lib/utils"
import { AddItemModal } from "@/components/modules/item/ui"
import { Category } from "@prisma/client"

interface DockNavProps {
  categories?: Category[]
}

export function DockNav({ categories = [] }: DockNavProps) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const scrollThreshold = 10 // Minimum scroll distance to trigger hide/show

  // Scroll detection for hide/show behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollY.current

      // Only trigger if scroll delta exceeds threshold
      if (Math.abs(scrollDelta) > scrollThreshold) {
        if (scrollDelta > 0 && currentScrollY > 100) {
          // Scrolling down & past initial content
          setIsVisible(false)
        } else {
          // Scrolling up
          setIsVisible(true)
        }
        lastScrollY.current = currentScrollY
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check if path is active
  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "首页" },
    { href: "/inventory", icon: Box, label: "管理" },
    { href: "/analysis", icon: Compass, label: "发现" },
    { href: "/me", icon: User, label: "我的" },
  ]

  const leftItems = navItems.slice(0, 2)
  const rightItems = navItems.slice(2)

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isVisible ? 0 : 100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 35,
      }}
      className="fixed bottom-4 left-0 right-0 z-50 mx-auto flex w-max justify-center px-4 pb-[env(safe-area-inset-bottom)]"
    >
      {/* Premium Glassmorphism Container */}
      <div
        className={cn(
          "relative flex items-center gap-1 rounded-[22px] px-2.5 py-2",
          // Enhanced glassmorphism
          "bg-white/70 dark:bg-black/60",
          "backdrop-blur-xl backdrop-saturate-[1.8]",
          // Subtle multi-layer border effect
          "border border-white/50 dark:border-white/10",
          "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.4)]",
          "dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.05)]",
        )}
      >
        {/* Subtle inner glow overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/20 to-transparent dark:from-white/5" />

        {/* Left Items */}
        {leftItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={isPathActive(item.href)}
          />
        ))}

        {/* Center Add Button - matching dock bar rounded style */}
        <div className="mx-1">
          <AddItemModal categories={categories}>
            <button
              className={cn(
                "flex h-11 w-12 items-center justify-center rounded-xl",
                "bg-gradient-to-b from-primary to-primary/90",
                "shadow-[0_4px_12px_rgba(var(--primary-rgb,234,88,12),0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]",
                "transition-all duration-200",
                "hover:brightness-110 hover:shadow-[0_6px_16px_rgba(var(--primary-rgb,234,88,12),0.45)]",
                "active:scale-95",
              )}
            >
              <Plus className="h-5 w-5 text-primary-foreground stroke-[2.5px]" />
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
    </motion.div>
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
          "relative flex h-12 w-14 flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-300",
          isActive ? "" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {/* Active Background - refined glassmorphism pill */}
        {isActive && (
          <motion.div
            layoutId="active-nav-pill"
            className={cn(
              "absolute inset-0.5 rounded-xl",
              "bg-gradient-to-b from-primary/15 to-primary/8",
              "dark:from-primary/25 dark:to-primary/12",
              "border border-primary/20 dark:border-primary/30",
              "shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]",
            )}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          />
        )}

        {/* Icon & Label */}
        <div
          className={cn(
            "relative z-10 flex flex-col items-center gap-0.5",
            isActive && "text-primary",
          )}
        >
          <Icon
            className={cn("h-[22px] w-[22px]", isActive && "stroke-[2.2px]")}
          />
          <span className="text-[10px] font-medium leading-none">{label}</span>
        </div>
      </div>
    </Link>
  )
}
