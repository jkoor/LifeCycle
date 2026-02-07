"use client"

/**
 * TrackerCard Component
 *
 * 物品追踪卡片 - Item 实体的 UI 组件（Molecule 层）
 * 用于在仪表盘或 Demo 页面展示物品的生命周期状态、剩余天数和库存信息
 *
 * @see .agent/rules/rule.md - Section 2: Architecture & File Structure
 * @see .agent/rules/rule.md - Section 3.B: Composition Rules
 */

import * as React from "react"
import { motion } from "motion/react"
import { Package } from "lucide-react"

import { Lock, Plus, RefreshCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { BorderBeam } from "@/components/ui/border-beam"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ItemStatus } from "./item-status"
import { ItemAvatar } from "./item-avatar"
import { useItem } from "../hooks/use-item"
import { getRemainingDays } from "../utils"
import type { InventoryItem } from "../types"

interface TrackerCardProps {
  item: InventoryItem
  className?: string
}

export function TrackerCard({ item, className }: TrackerCardProps) {
  // Use the item hook for all operations
  const { handleUpdateStock, handleReplace, isReplacing, statusState } =
    useItem(item)

  // Calculate remaining days and progress
  const daysRemaining = getRemainingDays(item) ?? 0
  const totalDays = item.lifespanDays || item.shelfLifeDays || 30
  const healthPercentage = Math.max(
    0,
    Math.min(100, (daysRemaining / totalDays) * 100),
  )

  // Color configuration based on global StatusBadgeVariant system
  // This ensures consistency with the status badge colors
  const variantColorMap = {
    destructive: {
      // Red for critical states (expired, out of stock)
      color: "bg-red-500",
      borderColor: "border-red-500/20",
      bgGradient: "from-red-500/10 to-transparent",
      beamFrom: "#ef4444",
      beamTo: "#dc2626",
    },
    warning: {
      // Yellow/Amber for warning states (expiring soon, low stock)
      color: "bg-amber-500",
      borderColor: "border-amber-500/20",
      bgGradient: "from-amber-500/10 to-transparent",
      beamFrom: "#f59e0b",
      beamTo: "#d97706",
    },
    success: {
      // Green for healthy state
      color: "bg-green-500",
      borderColor: "border-green-500/20",
      bgGradient: "from-green-500/10 to-transparent",
      beamFrom: "#22c55e",
      beamTo: "#16a34a",
    },
    info: {
      // Blue for info state
      color: "bg-blue-500",
      borderColor: "border-blue-500/20",
      bgGradient: "from-blue-500/10 to-transparent",
      beamFrom: "#3b82f6",
      beamTo: "#2563eb",
    },
    default: {
      // Zinc for default state
      color: "bg-zinc-500",
      borderColor: "border-zinc-500/20",
      bgGradient: "from-zinc-500/10 to-transparent",
      beamFrom: "#71717a",
      beamTo: "#52525b",
    },
  }

  // Use the variant from statusState to get colors
  const colorConfig = variantColorMap[statusState.variant]

  // Critical states need visual emphasis (border beam animation)
  const isCritical = statusState.variant === "destructive"

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "border bg-card/50 backdrop-blur-md", // Glassmorphism base
        colorConfig.borderColor,
        className,
      )}
    >
      {/* Background Gradient Mesh */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none",
          colorConfig.bgGradient,
        )}
      />

      {/* Critical/Warning Animation */}
      {isCritical && (
        <BorderBeam
          size={200}
          duration={statusState.variant === "destructive" ? 8 : 12}
          delay={0}
          colorFrom={colorConfig.beamFrom}
          colorTo={colorConfig.beamTo}
        />
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <div className="flex items-center gap-3">
          {/* Use ItemAvatar component */}
          <ItemAvatar src={item.image} name={item.name} size="md" />
          <div>
            <h3 className="font-semibold leading-none tracking-tight">
              {item.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {item.category.name}
              {item.brand && (
                <>
                  <span className="mx-1 text-muted-foreground/50">/</span>
                  <span>{item.brand}</span>
                </>
              )}
            </p>
          </div>
        </div>
        {/* Use ItemStatus component */}
        <ItemStatus item={item} />
      </CardHeader>

      <CardContent className="relative z-10 pt-4 pb-2">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-3xl font-bold tracking-tighter tabular-nums">
              {daysRemaining}
            </span>
            <span className="text-xs text-muted-foreground ml-1">天剩余</span>
          </div>
          {/* Stock Display */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            <Package className="size-3.5" />
            <span>库存: {item.stock}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden mt-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full rounded-full", colorConfig.color)}
          />
        </div>
      </CardContent>

      <CardFooter className="relative z-10 gap-2 pt-4">
        {/* Left Button: Add Stock - Connected to real action */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex-1 flex">
              <Button
                variant="outline"
                className="w-full group transition-all hover:shadow-md active:scale-95"
                onClick={() => handleUpdateStock(1)}
                disabled={item.isStockFixed}
              >
                {item.isStockFixed ? (
                  <Lock className="mr-2 size-4" />
                ) : (
                  <Plus className="mr-2 size-4 transition-transform group-hover:scale-110 group-hover:rotate-90" />
                )}
                补货
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{item.isStockFixed ? "固定库存物品无需补货" : "增加库存"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Right Button: Replace - Connected to real action */}
        {/* Button variant matches the status severity */}
        <Button
          variant="secondary"
          className={cn(
            "group flex-1 shadow-sm transition-all hover:shadow-md active:scale-95",
            statusState.variant === "destructive" &&
              "bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 dark:border-red-800",
            statusState.variant === "warning" &&
              "bg-amber-100 text-amber-600 hover:bg-amber-200 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900 dark:border-amber-800",
            statusState.variant === "success" &&
              "bg-green-100 text-green-600 hover:bg-green-200 border border-green-200 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900 dark:border-green-800",
          )}
          onClick={handleReplace}
          disabled={isReplacing}
        >
          <RefreshCcw
            className={cn(
              "mr-2 size-4 transition-transform duration-500",
              isReplacing ? "animate-spin" : "group-hover:rotate-180",
            )}
          />
          立即更换
        </Button>
      </CardFooter>
    </Card>
  )
}
