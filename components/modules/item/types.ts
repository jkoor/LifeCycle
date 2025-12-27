import { Prisma } from "@prisma/client"

/**
 * Item 基础类型 (带关联数据)
 */
export type ItemWithRelations = Prisma.ItemGetPayload<{
  include: {
    category: true
    tags: true
  }
}>

/**
 * Item 完整类型 (价格转为 number)
 */
export type InventoryItem = Omit<ItemWithRelations, "price"> & {
  price: number
}

/**
 * 剩余天数状态信息
 */
export interface RemainingStatus {
  label: string
  color: string
  bg: string
}

/**
 * useItem Hook 返回类型
 */
export interface UseItemReturn {
  // Loading 状态
  isUpdatingStock: boolean
  isReplacing: boolean
  isArchiving: boolean
  isUpdatingNotification: boolean
  isDeleting: boolean

  // 操作函数
  handleUpdateStock: (delta: number) => Promise<void>
  handleReplace: () => Promise<void>
  handleToggleArchive: () => Promise<void>
  handleToggleNotification: (enabled: boolean) => Promise<void>
  handleDelete: () => Promise<void>

  // 计算属性
  daysRemaining: number | null
  status: RemainingStatus | null
  isExpired: boolean
  isExpiringSoon: boolean
  isLowStock: boolean
  isOutOfStock: boolean
}
