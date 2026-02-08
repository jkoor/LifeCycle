"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Box,
  Compass,
  User,
  Plus,
  Pin,
  PinOff,
  LogOut,
} from "lucide-react"
import Image from "next/image"
import { motion } from "motion/react"

import { signOut } from "@/lib/auth-client"
import { useUser } from "@/lib/client-auth"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarBody } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { AddItemModal } from "@/components/modules/item/ui"
import type { Category } from "@prisma/client"

interface AppSidebarProps {
  categories?: Category[]
}

// Pin states: null = auto (hover), 'open' = always expanded, 'closed' = always collapsed
type PinState = null | "open" | "closed"

export function AppSidebar({ categories = [] }: AppSidebarProps) {
  const pathname = usePathname()
  const [hovered, setHovered] = useState(false)
  const [pinState, setPinState] = useState<PinState>(null)
  const user = useUser()

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
    <Sidebar open={isOpen} setOpen={() => { }}>
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
            <Image
              src="/logo.svg"
              alt="LifeCycle"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0"
              priority
            />
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
          <div
            className={cn(
              "flex items-center w-full py-2.5 rounded-xl transition-all duration-200",
              isOpen ? "px-3 gap-3 justify-start" : "justify-center px-0",
            )}
          >
            <Avatar className="h-7 w-7 shrink-0 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <AvatarImage
                src={user?.image || "https://github.com/shadcn.png"}
                alt={user?.name || "User"}
              />
              <AvatarFallback className="rounded-lg">
                {user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            {isOpen && (
              <>
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex flex-1 flex-col items-start overflow-hidden whitespace-nowrap"
                >
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate w-full text-left">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate w-full text-left">
                    {user?.email || "user@example.com"}
                  </span>
                </motion.div>

                <motion.button
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors overflow-hidden"
                  onClick={async () => {
                    await signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          window.location.href = "/login"
                        },
                      },
                    })
                  }}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  )
}
