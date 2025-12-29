"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  deleteItem,
  updateStock,
  toggleNotification,
  replaceItem,
  undoReplaceItem,
  toggleArchive,
  togglePin,
} from "@/app/actions/item"
import { InventoryItem, UseItemReturn } from "../types"
import { getRemainingDays, getItemStatus } from "../utils"

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
 * const { isUpdatingStock, handleUpdateStock, statusState } = useItem(item)
 *
 * <Button onClick={() => handleUpdateStock(1)} disabled={isUpdatingStock}>
 *   {isUpdatingStock ? <Loader2 /> : <Plus />}
 * </Button>
 * ```
 */
export function useItem(item: InventoryItem): UseItemReturn {
  const router = useRouter()

  // Loading 状态
  const [isReplacing, setIsReplacing] = useState(false)
  const [isPinning, setIsPinning] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isUpdatingNotification, setIsUpdatingNotification] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 计算属性
  const daysRemaining = useMemo(() => getRemainingDays(item), [item])
  const statusState = useMemo(() => getItemStatus(item), [item])

  /**
   * 更新库存
   * 返回 { error?: string } 用于乐观更新的回滚判断
   */
  const handleUpdateStock = useCallback(
    async (delta: number): Promise<{ error?: string }> => {
      try {
        const res = await updateStock(item.id, delta)
        if (res.error) {
          return { error: res.error }
        }
        router.refresh()
        return {}
      } catch {
        return { error: "网络错误" }
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
   * 切换置顶状态
   */
  const handleTogglePin = useCallback(async () => {
    setIsPinning(true)
    const currentStatus = item.isPinned
    try {
      const newStatus = !currentStatus
      const res = await togglePin(item.id, newStatus)
      if (res.error) {
        toast.error("置顶失败", { description: res.error })
      } else {
        toast.success(newStatus ? "已置顶" : "已取消置顶", {
          action: {
            label: "撤销",
            onClick: async () => {
              await togglePin(item.id, currentStatus)
              router.refresh()
            },
          },
        })
        router.refresh()
      }
    } catch {
      toast.error("操作失败")
    } finally {
      setIsPinning(false)
    }
  }, [item.id, item.isPinned, router])

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
    isReplacing,
    isPinning,
    isArchiving,
    isUpdatingNotification,
    isDeleting,

    // 操作函数
    handleUpdateStock,
    handleReplace,
    handleTogglePin,
    handleToggleArchive,
    handleToggleNotification,
    handleDelete,

    // 计算属性
    daysRemaining,
    statusState,
  }
}
