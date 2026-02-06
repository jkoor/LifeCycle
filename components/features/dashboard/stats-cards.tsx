"use client"

/**
 * StatsCards Component
 *
 * 仪表盘统计卡片 - Feature Layer (Dashboard)
 * 显示4个统计卡片：总物品数、即将过期、库存不足、启用通知
 *
 * @see .agent/rules/rule.md - Section 2: Architecture & File Structure
 */

import * as React from "react"
import { Package, Clock, AlertTriangle, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DashboardStats } from "@/app/actions/dashboard"

interface StatsCardsProps {
  stats: DashboardStats
  className?: string
}

interface StatCardConfig {
  label: string
  value: number
  icon: React.ElementType
  colorClass: string
  bgGradient: string
}

export function StatsCards({ stats, className }: StatsCardsProps) {
  const cards: StatCardConfig[] = [
    {
      label: "物品数量",
      value: stats.totalItems,
      icon: Package,
      colorClass: "text-blue-500",
      bgGradient: "from-blue-500/10 to-transparent",
    },
    {
      label: "即将过期",
      value: stats.expiringSoon,
      icon: Clock,
      colorClass: "text-amber-500",
      bgGradient: "from-amber-500/10 to-transparent",
    },
    {
      label: "急需补货",
      value: stats.lowStock,
      icon: AlertTriangle,
      colorClass: "text-orange-500",
      bgGradient: "from-orange-500/10 to-transparent",
    },
    {
      label: "启用通知",
      value: stats.notificationsEnabled,
      icon: Bell,
      colorClass: "text-emerald-500",
      bgGradient: "from-emerald-500/10 to-transparent",
    },
  ]

  return (
    <div className={cn("grid gap-4 grid-cols-2 md:grid-cols-4", className)}>
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.label}
            className="relative overflow-hidden transition-all hover:shadow-md"
          >
            {/* Background Gradient */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-30 pointer-events-none",
                card.bgGradient,
              )}
            />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <Icon className={cn("size-4", card.colorClass)} />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold tabular-nums">
                {card.value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
