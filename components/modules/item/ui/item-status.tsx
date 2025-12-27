"use client"

import { StatusBadge } from "@/components/common"
import { InventoryItem } from "../types"
import { getItemStatus } from "../utils"

interface ItemStatusProps {
  item: InventoryItem
  className?: string
}

/**
 * 物品状态徽章组件
 *
 * 纯展示组件，所有业务逻辑由 getItemStatus 处理。
 * 根据物品的综合状态（库存、过期时间等）显示对应的状态徽章。
 *
 * 状态优先级（由 utils.ts 统一管理）：
 * 1. 缺货 -> destructive
 * 2. 已过期 -> destructive
 * 3. 即将过期 -> warning
 * 4. 低库存 -> warning
 * 5. 正常 -> success
 *
 * @example
 * ```tsx
 * <ItemStatus item={item} />
 * ```
 */
export function ItemStatus({ item, className }: ItemStatusProps) {
  const status = getItemStatus(item)

  return (
    <StatusBadge
      variant={status.variant}
      icon={status.icon}
      label={status.label}
      className={className}
    />
  )
}
