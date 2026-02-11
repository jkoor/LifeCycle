"use client"

/**
 * TrackedItems Component
 *
 * 物品追踪区域 - Feature Layer (Dashboard)
 * 显示已置顶且未归档的物品追踪卡片
 *
 * @see .agent/rules/rule.md - Section 2: Architecture & File Structure
 */

import * as React from "react"
import { Pin } from "lucide-react"
import { TrackerCard } from "@/components/modules/item/ui/item-tracker-card"
import type { InventoryItem } from "@/components/modules/item/types"
import { getRemainingDays } from "@/components/modules/item/utils"
import { cn } from "@/lib/utils"

interface TrackedItemsProps {
  items: InventoryItem[]
  className?: string
}

export function TrackedItems({ items, className }: TrackedItemsProps) {
  // Sort items by remaining days (ascending: expired/soonest first)
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const daysA = getRemainingDays(a) ?? Number.MAX_SAFE_INTEGER
      const daysB = getRemainingDays(b) ?? Number.MAX_SAFE_INTEGER
      return daysA - daysB
    })
  }, [items])

  if (items.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
          <Pin className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">暂无追踪物品</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          在库存页面点击置顶按钮，将物品添加到仪表盘追踪
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {sortedItems.map((item) => (
        <TrackerCard key={item.id} item={item} />
      ))}
    </div>
  )
}
