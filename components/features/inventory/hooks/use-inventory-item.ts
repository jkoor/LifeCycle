"use client"

import { useState, useMemo, useCallback } from "react"
import { InventoryItem } from "@/types/inventory"
import {
  deleteItem,
  updateStock,
  toggleNotification,
  replaceItem,
  undoReplaceItem,
  toggleArchive,
} from "@/app/actions/item"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { differenceInDays, addDays } from "date-fns"

/**
 * 剩余天数状态信息
 */
export interface RemainingStatus {
  label: string
  color: string
  bg: string
}

/**
 * useInventoryItem Hook 返回类型
 */
export interface UseInventoryItemReturn {
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

/**
 * 计算物品的剩余天数
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
 * 物品操作 Hook
 *
 * 封装所有物品操作逻辑，包括：
 * - 库存管理 (增加/减少)
 * - 生命周期操作 (一键更换)
 * - 状态管理 (归档、通知)
 * - 删除操作
 * - 辅助计算 (剩余天数、状态)
 *
 * @example
 * ```tsx
 * const { isUpdatingStock, handleUpdateStock, daysRemaining, status } = useInventoryItem(item)
 *
 * <Button onClick={() => handleUpdateStock(1)} disabled={isUpdatingStock}>
 *   {isUpdatingStock ? <Loader2 /> : <Plus />}
 * </Button>
 * ```
 */
export function useInventoryItem(item: InventoryItem): UseInventoryItemReturn {
  const router = useRouter()

  // Loading 状态
  const [isUpdatingStock, setIsUpdatingStock] = useState(false)
  const [isReplacing, setIsReplacing] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isUpdatingNotification, setIsUpdatingNotification] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 计算属性
  const daysRemaining = useMemo(() => getRemainingDays(item), [item])
  const status = useMemo(
    () => getRemainingStatus(daysRemaining),
    [daysRemaining]
  )
  const isExpired = daysRemaining !== null && daysRemaining < 0
  const isExpiringSoon =
    daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7
  const isLowStock = (item.stock ?? 0) > 0 && (item.stock ?? 0) < 2
  const isOutOfStock = (item.stock ?? 0) <= 0

  /**
   * 更新库存
   */
  const handleUpdateStock = useCallback(
    async (delta: number) => {
      setIsUpdatingStock(true)
      try {
        const res = await updateStock(item.id, delta)
        if (res.error) {
          toast.error("更新库存失败", { description: res.error })
        } else {
          router.refresh()
        }
      } catch {
        toast.error("更新库存失败")
      } finally {
        setIsUpdatingStock(false)
      }
    },
    [item.id, router]
  )

  /**
   * 一键更换物品
   * - 库存 -1
   * - 重置上次更换日期
   * - 支持撤销
   */
  const handleReplace = useCallback(async () => {
    setIsReplacing(true)
    try {
      const res = await replaceItem(item.id)
      if (res.error) {
        toast.error("更换失败", { description: res.error })
      } else {
        toast.success("已完成更换", {
          description: "库存 -1，日期已重置",
          action: {
            label: "撤销",
            onClick: async () => {
              if (res.previousStock !== undefined) {
                await undoReplaceItem(
                  item.id,
                  res.previousStock,
                  res.previousDate || null
                )
                router.refresh()
              }
            },
          },
        })
        router.refresh()
      }
    } catch {
      toast.error("更换失败")
    } finally {
      setIsReplacing(false)
    }
  }, [item.id, router])

  /**
   * 切换归档状态
   */
  const handleToggleArchive = useCallback(async () => {
    setIsArchiving(true)
    const currentStatus = item.isArchived
    try {
      const newStatus = !currentStatus
      const res = await toggleArchive(item.id, newStatus)
      if (res.error) {
        toast.error("归档失败", { description: res.error })
      } else {
        toast.success(newStatus ? "已归档" : "已取消归档", {
          action: {
            label: "撤销",
            onClick: async () => {
              await toggleArchive(item.id, currentStatus)
              router.refresh()
            },
          },
        })
        router.refresh()
      }
    } catch {
      toast.error("操作失败")
    } finally {
      setIsArchiving(false)
    }
  }, [item.id, item.isArchived, router])

  /**
   * 切换通知状态
   */
  const handleToggleNotification = useCallback(
    async (enabled: boolean) => {
      setIsUpdatingNotification(true)
      try {
        const res = await toggleNotification(item.id, enabled)
        if (res.error) {
          toast.error("切换提醒失败", { description: res.error })
        } else {
          toast.success(enabled ? "已开启提醒" : "已关闭提醒", {
            description: enabled
              ? `将在过期前 ${res.notifyAdvanceDays} 天提醒`
              : "不再提醒",
            action: {
              label: "撤销",
              onClick: async () => {
                await toggleNotification(item.id, !enabled)
                router.refresh()
              },
            },
          })
          router.refresh()
        }
      } catch {
        toast.error("切换提醒失败")
      } finally {
        setIsUpdatingNotification(false)
      }
    },
    [item.id, router]
  )

  /**
   * 删除物品
   * 注意：调用方应在调用此函数前先进行确认
   */
  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      const res = await deleteItem(item.id)
      if (res.error) {
        toast.error("删除失败", { description: res.error })
      } else {
        toast.success("物品已删除")
        router.refresh()
      }
    } catch {
      toast.error("删除失败")
    } finally {
      setIsDeleting(false)
    }
  }, [item.id, router])

  return {
    // Loading 状态
    isUpdatingStock,
    isReplacing,
    isArchiving,
    isUpdatingNotification,
    isDeleting,

    // 操作函数
    handleUpdateStock,
    handleReplace,
    handleToggleArchive,
    handleToggleNotification,
    handleDelete,

    // 计算属性
    daysRemaining,
    status,
    isExpired,
    isExpiringSoon,
    isLowStock,
    isOutOfStock,
  }
}
