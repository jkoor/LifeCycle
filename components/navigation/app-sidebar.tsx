"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Box, Compass, User, Plus, Leaf, Pin, PinOff } from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { Sidebar, SidebarBody } from "@/components/ui/sidebar"
import { AddItemModal } from "@/components/modules/item/ui"
import { Category } from "@prisma/client"

interface AppSidebarProps {
  categories?: Category[]
}

// Pin states: null = auto (hover), 'open' = always expanded, 'closed' = always collapsed
type PinState = null | "open" | "closed"

export function AppSidebar({ categories = [] }: AppSidebarProps) {
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)
  const [pinState, setPinState] = useState<PinState>(null)

  // Check if path is active
  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  // Calculate effective open state based on pin state and hover
  const isOpen =
    pinState === "open" ? true : pinState === "closed" ? false : hovered

  // Cycle pin state: null -> open -> closed -> null
  const cyclePinState = () => {
    setPinState((prev) => {
      if (prev === null) return "open"
      if (prev === "open") return "closed"
      return null
    })
  }

  const links = [
    {
      label: "首页",
      href: "/dashboard",
      isActive: isPathActive("/dashboard"),
      icon: Home,
    },
    {
      label: "管理",
      href: "/inventory",
      isActive: isPathActive("/inventory"),
      icon: Box,
    },
    {
      label: "发现",
      href: "/analysis",
      isActive: isPathActive("/analysis"),
      icon: Compass,
    },
    {
      label: "我的",
      href: "/me",
      isActive: isPathActive("/me"),
      icon: User,
    },
  ]

  // Handle hover - only works in auto mode
  const handleMouseEnter = () => {
    if (pinState === null) setHovered(true)
  }
  const handleMouseLeave = () => {
    if (pinState === null) setHovered(false)
  }

  return (
    <Sidebar open={isOpen} setOpen={() => {}}>
      <SidebarBody
        className="justify-between gap-6"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo */}
          <Link
            href="/dashboard"
            className={cn(
              "relative z-20 flex items-center py-2.5 rounded-xl text-sm font-normal",
              isOpen ? "px-3 gap-3" : "justify-center",
            )}
          >
            <div className="h-7 w-7 shrink-0 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <motion.span
              animate={{
                width: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="font-semibold whitespace-nowrap overflow-hidden text-foreground text-base"
            >
              LifeCycle
            </motion.span>
          </Link>

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className={cn(
                  "flex items-center py-2.5 rounded-xl transition-colors",
                  isOpen ? "px-3 gap-3" : "justify-center",
                  link.isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-neutral-200 dark:hover:bg-neutral-700",
                )}
              >
                <link.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    link.isActive
                      ? "text-primary"
                      : "text-neutral-700 dark:text-neutral-200",
                  )}
                />
                <motion.span
                  animate={{
                    width: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className={cn(
                    "text-sm whitespace-nowrap overflow-hidden",
                    link.isActive
                      ? "text-primary font-medium"
                      : "text-neutral-700 dark:text-neutral-200",
                  )}
                >
                  {link.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* Add Item Button */}
          <div className="mt-4">
            <AddItemModal categories={categories}>
              <button
                className={cn(
                  "flex items-center w-full py-2.5 rounded-xl transition-colors",
                  isOpen ? "px-3 gap-3" : "justify-center",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <Plus className="h-5 w-5 shrink-0" />
                <motion.span
                  animate={{
                    width: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  添加物品
                </motion.span>
              </button>
            </AddItemModal>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-1">
          {/* Pin Button */}
          <button
            onClick={cyclePinState}
            className={cn(
              "flex items-center py-2.5 rounded-xl transition-colors",
              isOpen ? "px-3 gap-3" : "justify-center",
              pinState !== null
                ? "bg-primary/10 text-primary"
                : "hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400",
            )}
            title={
              pinState === null
                ? "点击固定侧栏"
                : pinState === "open"
                  ? "已固定展开"
                  : "已固定折叠"
            }
          >
            {pinState !== null ? (
              <Pin className="h-5 w-5 shrink-0" />
            ) : (
              <PinOff className="h-5 w-5 shrink-0" />
            )}
            <motion.span
              animate={{
                width: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-sm whitespace-nowrap overflow-hidden"
            >
              {pinState === null
                ? "固定侧栏"
                : pinState === "open"
                  ? "固定展开"
                  : "固定折叠"}
            </motion.span>
          </button>

          {/* User Section */}
          <Link
            href="/me"
            className={cn(
              "flex items-center py-2.5 rounded-xl transition-colors",
              isOpen ? "px-3 gap-3" : "justify-center",
              "hover:bg-neutral-200 dark:hover:bg-neutral-700",
            )}
          >
            <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <motion.span
              animate={{
                width: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-neutral-700 dark:text-neutral-200 text-sm whitespace-nowrap overflow-hidden"
            >
              个人中心
            </motion.span>
          </Link>
        </div>
      </SidebarBody>
    </Sidebar>
  )
}
