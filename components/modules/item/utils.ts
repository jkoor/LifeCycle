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
 * 新版计算逻辑 (v2):
 * 1. Use-by Date (开封失效点) = lastOpenedAt + lifespanDays
 * 2. Best-by Date (保质失效点) = lastOpenedAt + shelfLifeDays
 * 3. Legacy: expirationDate (绝对日期，兼容旧数据)
 * 4. 实际剩余天数 = Min(所有 deadline) - Today
 *
 * 支持负数返回值，表示已过期的天数
 */
export function getRemainingDays(item: InventoryItem): number | null {
  const now = new Date()
  const deadlines: Date[] = []

  // 软性使用寿命: lastOpenedAt + lifespanDays
  if (item.lifespanDays && item.lastOpenedAt) {
    deadlines.push(addDays(new Date(item.lastOpenedAt), item.lifespanDays))
  }

  // 硬性保质期: lastOpenedAt + shelfLifeDays
  if (item.shelfLifeDays && item.lastOpenedAt) {
    deadlines.push(addDays(new Date(item.lastOpenedAt), item.shelfLifeDays))
  }

  // 兼容旧数据：绝对过期日期 (deprecated)
  if (item.expirationDate) {
    deadlines.push(new Date(item.expirationDate))
  }

  if (deadlines.length === 0) return null

  // 取最早的 deadline
  const earliest = deadlines.reduce((a, b) => (a < b ? a : b))
  return differenceInDays(earliest, now)
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
