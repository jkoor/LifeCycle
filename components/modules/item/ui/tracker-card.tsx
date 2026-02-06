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
import {
  CheckCircle2,
  Package,
  Timer,
  XCircle,
  AlertOctagon,
} from "lucide-react"
// Animated icons for interactive elements (per design guidelines)
import { Plus, RefreshCcw } from "lucide-react" // TODO: Replace with lucide-animated when available

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { BorderBeam } from "@/components/ui/border-beam"
import { Badge } from "@/components/ui/badge"
import type { ItemLifecycleStatus, TrackerItemMock } from "../types"

interface TrackerCardProps {
  item: TrackerItemMock
  className?: string
}

export function TrackerCard({ item, className }: TrackerCardProps) {
  // Calculate progress percentage
  const healthPercentage = Math.max(
    0,
    Math.min(100, (item.daysRemaining / item.totalDays) * 100),
  )

  // Configuration map based on ItemLifecycleStatus
  const statusConfig: Record<
    ItemLifecycleStatus,
    {
      color: string
      textColor: string
      borderColor: string
      bgGradient: string
      icon: React.ElementType
      label: string
      buttonVariant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "ghost"
        | "link"
    }
  > = {
    healthy: {
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
      bgGradient: "from-emerald-500/10 to-transparent",
      icon: CheckCircle2,
      label: "状态良好",
      buttonVariant: "secondary",
    },
    expiring_soon: {
      color: "bg-amber-500",
      textColor: "text-amber-500",
      borderColor: "border-amber-500/20",
      bgGradient: "from-amber-500/10 to-transparent",
      icon: Timer,
      label: "即将过期",
      buttonVariant: "default",
    },
    expired: {
      color: "bg-slate-500",
      textColor: "text-slate-500",
      borderColor: "border-slate-500/20",
      bgGradient: "from-slate-500/10 to-transparent",
      icon: XCircle,
      label: "已过期",
      buttonVariant: "outline",
    },
    low_stock: {
      color: "bg-orange-500",
      textColor: "text-orange-500",
      borderColor: "border-orange-500/20",
      bgGradient: "from-orange-500/10 to-transparent",
      icon: Package,
      label: "库存不足",
      buttonVariant: "default",
    },
    out_of_stock: {
      color: "bg-rose-500",
      textColor: "text-rose-500",
      borderColor: "border-rose-500/20",
      bgGradient: "from-rose-500/10 to-transparent",
      icon: AlertOctagon,
      label: "已缺货",
      buttonVariant: "destructive",
    },
  }

  const config = statusConfig[item.status]
  // const Icon = config.icon // Unused for now

  const isCritical =
    item.status === "expiring_soon" ||
    item.status === "low_stock" ||
    item.status === "out_of_stock"

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "border bg-card/50 backdrop-blur-md", // Glassmorphism base
        config.borderColor,
        className,
      )}
    >
      {/* Background Gradient Mesh */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none",
          config.bgGradient,
        )}
      />

      {/* Critical/Warning Animation */}
      {isCritical && (
        <BorderBeam
          size={200}
          duration={item.status === "out_of_stock" ? 8 : 12}
          delay={0}
          colorFrom={item.status === "out_of_stock" ? "#f43f5e" : "#f59e0b"}
          colorTo={item.status === "out_of_stock" ? "#e11d48" : "#d97706"}
        />
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <div className="flex items-center gap-3">
          {/* Avatar Placeholder */}
          <div
            className={cn(
              "size-10 rounded-xl flex items-center justify-center bg-background/50 border shadow-inner",
              config.borderColor,
            )}
          >
            <span className="text-xl">🧴</span>
          </div>
          <div>
            <h3 className="font-semibold leading-none tracking-tight">
              {item.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {item.category}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "bg-background/50 backdrop-blur-sm",
            config.textColor,
            config.borderColor,
          )}
        >
          {config.label}
        </Badge>
      </CardHeader>

      <CardContent className="relative z-10 pt-4 pb-2">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-3xl font-bold tracking-tighter tabular-nums">
              {item.daysRemaining}
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
            className={cn("h-full rounded-full", config.color)}
          />
        </div>
      </CardContent>

      <CardFooter className="relative z-10 gap-2 pt-4">
        {/* Left Button: Add Stock */}
        <Button
          variant="outline"
          className="group flex-1 transition-all hover:shadow-md active:scale-95"
          title="增加库存"
        >
          <Plus className="mr-2 size-4 transition-transform group-hover:scale-110 group-hover:rotate-90" />
          补货
        </Button>

        {/* Right Button: Replace / Action */}
        {/* Note: Per design guidelines, primary action buttons should use lucide-animated */}
        <Button
          className={cn(
            "group flex-1 shadow-md transition-all hover:shadow-lg active:scale-95",
          )}
          variant={config.buttonVariant}
        >
          <RefreshCcw className="mr-2 size-4 transition-transform group-hover:rotate-180 duration-500" />
          {item.status === "expired" ? "重置" : "立即更换"}
        </Button>
      </CardFooter>
    </Card>
  )
}
