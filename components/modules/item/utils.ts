import { differenceInDays, addDays } from "date-fns"
import { AlertTriangle, CheckCircle, Clock, Package } from "lucide-react"
import { InventoryItem, ItemStatusState } from "./types"

// ============================================================================
// 阈值常量
// ============================================================================

/** 即将过期警告天数阈值 */
export const THRESHOLD_EXPIRING_SOON_DAYS = 7

/** 低库存警告阈值 */
export const THRESHOLD_LOW_STOCK = 2

// ============================================================================
// 核心状态逻辑 (Single Source of Truth)
// ============================================================================

/**
 * 计算物品的剩余天数
 *
 * 优先使用 expirationDate，否则使用 lifespanDays + lastOpenedAt 计算
 */
export function getRemainingDays(item: InventoryItem): number | null {
  if (item.expirationDate) {
    return differenceInDays(new Date(item.expirationDate), new Date())
  }
  if (item.lifespanDays && item.lastOpenedAt) {
    const expiresAt = addDays(new Date(item.lastOpenedAt), item.lifespanDays)
    return differenceInDays(expiresAt, new Date())
  }
  return null
}

/**
 * 获取物品的统一状态对象
 *
 * 这是状态逻辑的唯一入口点 (Single Source of Truth)。
 * 所有 UI 组件和 Hooks 都应通过此函数获取状态。
 *
 * 优先级顺序：
 * 1. 缺货 (stock <= 0)
 * 2. 已过期 (daysLeft < 0)
 * 3. 即将过期 (daysLeft <= 7)
 * 4. 库存不足 (stock < 2)
 * 5. 正常
 *
 * @param item - 物品对象
 * @returns ItemStatusState - 标准化状态对象
 */
export function getItemStatus(item: InventoryItem): ItemStatusState {
  const stock = item.stock ?? 0
  const daysLeft = getRemainingDays(item)

  // Priority 1: 缺货
  if (stock <= 0) {
    return {
      key: "out_of_stock",
      label: "缺货",
      variant: "destructive",
      description: "库存已用完",
      icon: Package,
    }
  }

  // Priority 2: 已过期
  if (daysLeft !== null && daysLeft < 0) {
    const daysOverdue = Math.abs(daysLeft)
    return {
      key: "expired",
      label: "已过期",
      variant: "destructive",
      description: `已过期 ${daysOverdue} 天`,
      icon: Clock,
    }
  }

  // Priority 3: 即将过期
  if (daysLeft !== null && daysLeft <= THRESHOLD_EXPIRING_SOON_DAYS) {
    return {
      key: "expiring_soon",
      label: `${daysLeft}天后过期`,
      variant: "warning",
      description: `距离过期还有 ${daysLeft} 天`,
      icon: Clock,
    }
  }

  // Priority 4: 库存不足
  if (stock < THRESHOLD_LOW_STOCK) {
    return {
      key: "low_stock",
      label: "库存不足",
      variant: "warning",
      description: `仅剩 ${stock} 件`,
      icon: AlertTriangle,
    }
  }

  // Default: 正常
  return {
    key: "healthy",
    label: "正常",
    variant: "success",
    description: daysLeft !== null ? `还有 ${daysLeft} 天` : "状态良好",
    icon: CheckCircle,
  }
}
