"use client"

import { StatusBadge } from "@/components/common"
import { BreathingLight } from "@/components/ui/breathing-light"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InventoryItem } from "../types"
import { getItemStatus } from "../utils"

interface ItemStatusProps {
  item: InventoryItem
  /** 显示模式: full = 颜色+文字徽章, compact = 仅呼吸灯 */
  mode?: "full" | "compact"
  className?: string
}

/**
 * 物品状态组件
 *
 * 支持两种显示模式：
 * - `full`（默认）：完整的状态徽章（颜色 + 图标 + 文字）
 * - `compact`：仅显示呼吸灯指示器，鼠标悬停时显示状态文字
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
 * <ItemStatus item={item} mode="compact" />
 * ```
 */
export function ItemStatus({ item, mode = "full", className }: ItemStatusProps) {
  const status = getItemStatus(item)

  if (mode === "compact") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>
            <BreathingLight variant={status.variant} size="md" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status.label}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <StatusBadge
      variant={status.variant}
      icon={status.icon}
      label={status.label}
      className={className}
    />
  )
}
