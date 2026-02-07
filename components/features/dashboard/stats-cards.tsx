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
import {
  Package,
  Clock,
  AlertTriangle,
  BadgeJapaneseYen,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NumberTicker } from "@/components/ui/number-ticker"
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
  iconBg: string
  isCurrency?: boolean
  trend?: number
  trendLabel?: string
  inverseTrend?: boolean // If true, lower is better (e.g. expiring soon count)
}

export function StatsCards({ stats, className }: StatsCardsProps) {
  const cards: StatCardConfig[] = [
    {
      label: "物品总数",
      value: stats.totalItems,
      icon: Package,
      colorClass: "text-primary",
      iconBg: "bg-primary/15",
      trend: stats.trends?.totalItems || 0,
      // trendLabel: "较上月",
    },
    {
      label: "资产总值",
      value: stats.totalValue,
      icon: BadgeJapaneseYen,
      colorClass: "text-blue-500",
      iconBg: "bg-blue-500/15",
      isCurrency: true,
      trend: stats.trends?.totalValue || 0,
      // trendLabel: "较上月",
    },
    {
      label: "即将过期",
      value: stats.expiringSoon,
      icon: Clock,
      colorClass: "text-amber-500",
      iconBg: "bg-amber-500/15",
      trend: stats.trends?.expiringSoon || 0,
      // trendLabel: "较上月",
      inverseTrend: true, // Lower is better
    },
    {
      label: "急需补货",
      value: stats.lowStock,
      icon: AlertTriangle,
      colorClass: "text-destructive",
      iconBg: "bg-destructive/15",
      trend: stats.trends?.lowStock || 0,
      // trendLabel: "较上月",
      inverseTrend: true, // Lower is better
    },
  ]

  return (
    <div className={cn("grid gap-4 grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map((card) => {
        const Icon = card.icon
        // Determine trend color and icon
        const trendValue = card.trend || 0
        const isPositive = trendValue > 0
        const isNeutral = trendValue === 0
        const isGood = card.inverseTrend ? !isPositive : isPositive

        // Choose arrow icon
        const ArrowIcon = isPositive ? TrendingUp : TrendingDown

        // Dynamic classes for the badge
        // Success (Green): bg-emerald-500/10 text-emerald-500
        // Error/Warning (Red): bg-red-500/10 text-red-500
        // Neutral: bg-muted text-muted-foreground
        let badgeClass = "bg-muted text-muted-foreground"
        if (!isNeutral) {
          badgeClass = isGood
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/15 text-red-600 dark:text-red-400"
        }

        return (
          <Card
            key={card.label}
            className="relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border-border/50 bg-card/50 backdrop-blur-sm group"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200",
                  card.iconBg,
                )}
              >
                <Icon className={cn("w-5 h-5", card.colorClass)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  {card.isCurrency && (
                    <span className="text-xl font-semibold text-muted-foreground/80">
                      ¥
                    </span>
                  )}
                  <NumberTicker
                    value={card.value}
                    decimalPlaces={card.isCurrency ? 2 : 0}
                    className="text-2xl font-bold tracking-tight"
                  />
                </div>

                {!isNeutral && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs text-muted-foreground opacity-70 whitespace-nowrap">
                      {card.trendLabel}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 h-auto font-normal text-xs",
                        badgeClass,
                      )}
                    >
                      <ArrowIcon className="w-3 h-3" />
                      <span>{Math.abs(trendValue).toFixed(1)}%</span>
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
