"use client"

import { StatusBadge } from "@/components/common"
import { InventoryItem } from "../types"
import { getItemStatus, getRemainingDays } from "../utils"

interface ItemRemainingDaysProps {
  item: InventoryItem
  className?: string
}

/**
 * 物品剩余天数徽章组件
 *
 * 纯展示组件，使用 StatusBadge 显示剩余天数。
 * 颜色状态与 ItemStatus 组件保持同步，由 getItemStatus 统一管理。
 *
 * 显示逻辑：
 * - 缺货状态：不显示天数（返回 null）
 * - 无时间数据：返回 null
 * - 其他状态：显示 "X 天" 格式，颜色与状态对应
 *
 * @example
 * ```tsx
 * <ItemRemainingDays item={item} />
 * ```
 */
export function ItemRemainingDays({ item, className }: ItemRemainingDaysProps) {
  const status = getItemStatus(item)
  const daysRemaining = getRemainingDays(item)

  // 缺货状态或无时间数据时不显示
  if (status.key === "out_of_stock" || daysRemaining === null) {
    return null
  }

  return (
    <StatusBadge
      variant={status.variant}
      label={`${daysRemaining} 天`}
      className={className}
    />
  )
}
