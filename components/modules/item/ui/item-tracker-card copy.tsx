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
import { Layers, Package } from "lucide-react"

import { Lock, Plus, RefreshCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { BorderBeam } from "@/components/ui/border-beam"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

  // Calculate progress percentage
  const totalDays = item.lifespanDays || item.shelfLifeDays || 30
  const daysRemaining = getRemainingDays(item) ?? 0
  const healthPercentage = Math.max(
    0,
    Math.min(100, (daysRemaining / totalDays) * 100),
  )

  // Color configuration based on global StatusBadgeVariant system
  const variantColorMap = {
    destructive: {
      borderColor: "border-red-500/20",
      bgGradient: "from-red-500/10 to-transparent",
      beamFrom: "#ef4444",
      beamTo: "#dc2626",
      gaugeColor: "#ef4444",
      gaugeSecondary: "rgba(239,68,68,0.15)",
    },
    warning: {
      borderColor: "border-amber-500/20",
      bgGradient: "from-amber-500/10 to-transparent",
      beamFrom: "#f59e0b",
      beamTo: "#d97706",
      gaugeColor: "#f59e0b",
      gaugeSecondary: "rgba(245,158,11,0.15)",
    },
    success: {
      borderColor: "border-green-500/20",
      bgGradient: "from-green-500/10 to-transparent",
      beamFrom: "#22c55e",
      beamTo: "#16a34a",
      gaugeColor: "#22c55e",
      gaugeSecondary: "rgba(34,197,94,0.15)",
    },
    info: {
      borderColor: "border-blue-500/20",
      bgGradient: "from-blue-500/10 to-transparent",
      beamFrom: "#3b82f6",
      beamTo: "#2563eb",
      gaugeColor: "#3b82f6",
      gaugeSecondary: "rgba(59,130,246,0.15)",
    },
    default: {
      borderColor: "border-zinc-500/20",
      bgGradient: "from-zinc-500/10 to-transparent",
      beamFrom: "#71717a",
      beamTo: "#52525b",
      gaugeColor: "#71717a",
      gaugeSecondary: "rgba(113,113,122,0.15)",
    },
  }

  const colorConfig = variantColorMap[statusState.variant]
  const isCritical = statusState.variant === "destructive"

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        "border bg-card/50 backdrop-blur-md",
        "gap-0 py-0",
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

      {/* Critical Animation */}
      {isCritical && (
        <BorderBeam
          size={150}
          duration={statusState.variant === "destructive" ? 8 : 12}
          delay={0}
          colorFrom={colorConfig.beamFrom}
          colorTo={colorConfig.beamTo}
        />
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-0 relative z-10">
        {/* Left: info */}
        <div className="flex flex-col gap-2.5 min-w-0">
          {/* Part 1: avatar + name/brand */}
          <div className="flex items-start gap-2.5 min-w-0">
            <ItemAvatar src={item.image} name={item.name} size="md" />
            <div className="min-w-0 pt-0.5">
              <h3 className="text-sm font-semibold leading-tight tracking-tight truncate">
                {item.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate h-4">
                {item.brand || "\u00A0"}
              </p>
            </div>
          </div>
          {/* Part 2: category + stock (two lines) */}
          <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 truncate">
              <Layers className="size-3 shrink-0" />
              {item.category.name}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Package className="size-3 shrink-0" />
              库存: {item.stock}
            </span>
          </div>
        </div>

        {/* Right: circular progress */}
        <AnimatedCircularProgressBar
          value={healthPercentage}
          min={0}
          max={100}
          gaugePrimaryColor={colorConfig.gaugeColor}
          gaugeSecondaryColor={colorConfig.gaugeSecondary}
          className="size-16 text-sl shrink-0"
        />
      </CardHeader>

      <CardFooter className="relative z-10 gap-1.5 px-4 pt-3 pb-3.5">
        {/* Add Stock */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex-1 flex">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-[11px] group transition-all active:scale-95"
                onClick={() => handleUpdateStock(1)}
                disabled={item.isStockFixed}
              >
                {item.isStockFixed ? (
                  <Lock className="mr-1 size-3" />
                ) : (
                  <Plus className="mr-1 size-3 transition-transform group-hover:scale-110 group-hover:rotate-90" />
                )}
                补货
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{item.isStockFixed ? "固定库存物品无需补货" : "增加库存"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Replace */}
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "group flex-1 h-7 text-[11px] shadow-sm transition-all active:scale-95",
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
              "mr-1 size-3 transition-transform duration-500",
              isReplacing ? "animate-spin" : "group-hover:rotate-180",
            )}
          />
          更换
        </Button>
      </CardFooter>
    </Card>
  )
}
