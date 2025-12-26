import { InventoryItem } from "@/types/inventory"
import { InventoryCard, InventoryMobileRow } from "./cards"

import { cn } from "@/lib/utils"
import { Category } from "@prisma/client"

interface InventoryGridViewProps {
  items: InventoryItem[]
  categories: Category[]
  /** 显示模式: card(卡片) | row(紧凑行) */
  variant?: "card" | "row"
  className?: string
}

/**
 * 移动端物品视图
 *
 * - `card` 模式：显示完整卡片，含库存控制和操作按钮
 * - `row` 模式：紧凑行显示，点击展开 Drawer 详情
 */
export function InventoryGridView({
  items,
  categories,
  variant = "row",
  className,
}: InventoryGridViewProps) {
  return (
    <div className={cn("space-y-2 block md:hidden", className)}>
      {items.map((item) =>
        variant === "card" ? (
          <InventoryCard key={item.id} item={item} categories={categories} />
        ) : (
          <InventoryMobileRow
            key={item.id}
            item={item}
            categories={categories}
          />
        )
      )}
    </div>
  )
}
