import { Prisma } from "@prisma/client"
import { LucideIcon } from "lucide-react"
import { StatusBadgeVariant } from "@/components/common"

/**
 * 物品生命周期状态枚举
 *
 * 定义物品的所有可能状态，按优先级排序：
 * 1. out_of_stock - 缺货（最高优先级）
 * 2. expired - 已过期
 * 3. expiring_soon - 即将过期
 * 4. low_stock - 库存不足
 * 5. healthy - 正常状态
 */
export type ItemLifecycleStatus =
  | "out_of_stock"
  | "expired"
  | "expiring_soon"
  | "low_stock"
  | "healthy"

/**
 * 物品状态对象
 *
 * 作为 Utils 和 UI 层之间的标准化数据结构
 */
export interface ItemStatusState {
  /** 状态键 */
  key: ItemLifecycleStatus
  /** 显示文本 (e.g., "已过期", "缺货") */
  label: string
  /** StatusBadge 变体 */
  variant: StatusBadgeVariant
  /** 辅助描述文本 (e.g., "已过期 3 天") */
  description?: string
  /** 可选的语义图标 */
  icon?: LucideIcon
}

/**
 * Category DTO 类型
 *
 * 用于 UI 组件的分类数据结构，避免直接依赖 @prisma/client
 */
export interface Category {
  id: string
  name: string
  description?: string | null
  createdAt?: Date
  updatedAt?: Date
}

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
 * useItem Hook 返回类型
 */
export interface UseItemReturn {
  // Loading 状态
  isReplacing: boolean
  isPinning: boolean
  isArchiving: boolean
  isUpdatingNotification: boolean
  isDeleting: boolean

  // 操作函数
  handleUpdateStock: (delta: number) => Promise<{ error?: string }>
  handleReplace: () => Promise<void>
  handleTogglePin: () => Promise<void>
  handleToggleArchive: () => Promise<void>
  handleToggleNotification: (enabled: boolean) => Promise<void>
  handleDelete: () => Promise<void>

  // 计算属性
  /** 剩余天数（原始数值，用于特殊场景） */
  daysRemaining: number | null
  /** 统一状态对象（推荐使用） */
  statusState: ItemStatusState
}

/**
 * Mock Item 类型（用于 Demo 和测试）
 *
 * 简化版的 Item 数据结构，包含 TrackerCard 所需的最小字段集
 */
export interface TrackerItemMock {
  id: string
  name: string
  image?: string
  status: ItemLifecycleStatus
  stock: number
  totalDays: number
  daysRemaining: number
  category: string
}
