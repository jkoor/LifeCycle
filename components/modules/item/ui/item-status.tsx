"use client"

import { StatusBadge, StatusBadgeVariant } from "@/components/common"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { InventoryItem } from "../types"
import { getRemainingDays } from "../utils"

interface ItemStatusProps {
  item: InventoryItem
  className?: string
}

/**
 * 物品状态徽章组件
 *
 * 根据物品状态（库存、过期时间等）显示对应的状态徽章。
 * 使用 common/status-badge 作为基础 UI 组件。
 *
 * 状态优先级：
 * 1. 缺货 (stock <= 0) -> destructive
 * 2. 已过期 (daysLeft <= 0) -> destructive
 * 3. 即将过期 (daysLeft <= 7) -> warning
 * 4. 低库存 (stock < 2) -> warning
 * 5. 正常 -> success
 *
 * @example
 * ```tsx
 * <ItemStatus item={item} />
 * ```
 */
export function ItemStatus({ item, className }: ItemStatusProps) {
  // Logic 1: Out of Stock
  if (item.stock <= 0) {
    return (
      <StatusBadge
        variant="destructive"
        icon={AlertTriangle}
        label="缺货"
        className={className}
      />
    )
  }

  // Logic 2: Expiration Warning
  const daysLeft = getRemainingDays(item)

  if (daysLeft !== null) {
    // Expired
    if (daysLeft <= 0) {
      return (
        <StatusBadge
          variant="destructive"
          icon={Clock}
          label="已过期"
          className={className}
        />
      )
    }

    // Expiring soon (within 7 days)
    if (daysLeft <= 7) {
      return (
        <StatusBadge
          variant="warning"
          icon={Clock}
          label={`${daysLeft}天后过期`}
          className={className}
        />
      )
    }
  }

  // Logic 3: Low Stock (< 2)
  if (item.stock < 2) {
    return (
      <StatusBadge variant="warning" label="库存不足" className={className} />
    )
  }

  // Default: OK
  return (
    <StatusBadge
      variant="success"
      icon={CheckCircle}
      label="正常"
      className={className}
    />
  )
}
