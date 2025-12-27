import { differenceInDays, addDays } from "date-fns"
import { InventoryItem, RemainingStatus } from "./types"

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
 * 获取剩余天数的状态样式
 *
 * @param days - 剩余天数
 * @returns 状态信息 (label, color, bg) 或 null
 */
export function getRemainingStatus(
  days: number | null
): RemainingStatus | null {
  if (days === null) return null
  if (days < 0) {
    return { label: "已过期", color: "text-red-500", bg: "bg-red-500/10" }
  }
  if (days <= 7) {
    return {
      label: `${days} 天`,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    }
  }
  return { label: `${days} 天`, color: "text-green-500", bg: "bg-green-500/10" }
}

/**
 * 判断物品是否过期
 */
export function isItemExpired(item: InventoryItem): boolean {
  const days = getRemainingDays(item)
  return days !== null && days < 0
}

/**
 * 判断物品是否即将过期 (7天内)
 */
export function isItemExpiringSoon(item: InventoryItem): boolean {
  const days = getRemainingDays(item)
  return days !== null && days >= 0 && days <= 7
}

/**
 * 判断物品是否库存不足 (低于2)
 */
export function isItemLowStock(item: InventoryItem): boolean {
  return (item.stock ?? 0) > 0 && (item.stock ?? 0) < 2
}

/**
 * 判断物品是否缺货
 */
export function isItemOutOfStock(item: InventoryItem): boolean {
  return (item.stock ?? 0) <= 0
}
