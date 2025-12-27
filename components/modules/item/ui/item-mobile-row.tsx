"use client"

import { Category } from "@prisma/client"
import { cn } from "@/lib/utils"
import { ChevronRight, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { InventoryItem } from "../types"
import { useItem } from "../hooks/use-item"
import { ItemAvatar } from "./item-avatar"
import { ItemStockControl } from "./item-stock-control"
import { ItemStatus } from "./item-status"
import { ItemActions } from "./item-actions"
import { AddItemModal } from "@/components/features/inventory/add-item-modal"
import { useDeleteDialog } from "@/components/common/delete-dialog-provider"

interface ItemMobileRowProps {
  item: InventoryItem
  categories: Category[]
  className?: string
}

/**
 * 移动端物品行组件
 *
 * 设计原则：
 * - 极其精简：Avatar + Name + StatusBadge
 * - 点击触发 Drawer 展示详情
 * - 触摸友好的点击区域
 * - 删除确认由外层 DeleteDialogProvider 处理
 */
export function ItemMobileRow({
  item,
  categories,
  className,
}: ItemMobileRowProps) {
  const { requestDelete } = useDeleteDialog()

  const {
    isReplacing,
    isArchiving,
    isUpdatingNotification,
    isDeleting,
    handleUpdateStock,
    handleReplace,
    handleToggleArchive,
    handleToggleNotification,
    statusState,
  } = useItem(item)

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg",
            "hover:bg-muted/50 active:bg-muted transition-colors",
            "text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
        >
          {/* 头像 */}
          <ItemAvatar src={item.image} name={item.name} size="md" />

          {/* 内容区 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{item.name}</span>
              <ItemStatus item={item} />
            </div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {item.category?.name || "未分类"}
              {item.brand && ` · ${item.brand}`}
            </div>
          </div>

          {/* 箭头指示 */}
          <ChevronRight className="size-5 text-muted-foreground shrink-0" />
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="flex items-start gap-3">
            <ItemAvatar src={item.image} name={item.name} size="lg" />
            <div className="flex-1 min-w-0">
              <DrawerTitle className="truncate">{item.name}</DrawerTitle>
              <DrawerDescription className="truncate">
                {item.brand || "无品牌"} · {item.category?.name || "未分类"}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        {/* 详情内容 */}
        <div className="px-4 py-2 space-y-4">
          {/* 状态信息 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">状态</span>
            <ItemStatus item={item} />
          </div>

          {/* 剩余天数 */}
          {(statusState.key === "expired" ||
            statusState.key === "expiring_soon") && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">剩余天数</span>
              <span
                className={cn(
                  "text-sm font-medium",
                  statusState.variant === "destructive" && "text-red-500",
                  statusState.variant === "warning" && "text-amber-500"
                )}
              >
                {statusState.label}
              </span>
            </div>
          )}

          {/* 价格 */}
          {item.price !== undefined && item.price !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">价格</span>
              <span className="text-sm font-medium">
                ¥{Number(item.price).toFixed(2)}
              </span>
            </div>
          )}

          {/* 库存控制 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">库存</span>
            <ItemStockControl
              stock={item.stock ?? 0}
              onUpdateStock={handleUpdateStock}
              size="md"
            />
          </div>
        </div>

        <DrawerFooter className="flex-row gap-2">
          {/* 编辑按钮 */}
          <AddItemModal item={item} categories={categories}>
            <Button variant="outline" className="flex-1">
              <Pencil className="size-4 mr-2" />
              编辑
            </Button>
          </AddItemModal>

          {/* 操作下拉 */}
          <ItemActions
            variant="dropdown"
            size="md"
            isArchived={item.isArchived}
            isNotificationEnabled={(item.notifyAdvanceDays ?? 0) > 0}
            notifyAdvanceDays={item.notifyAdvanceDays}
            isReplacing={isReplacing}
            isArchiving={isArchiving}
            isUpdatingNotification={isUpdatingNotification}
            isDeleting={isDeleting}
            statusState={statusState}
            stock={item.stock ?? 0}
            onReplace={handleReplace}
            onToggleArchive={handleToggleArchive}
            onToggleNotification={handleToggleNotification}
            onDelete={() => requestDelete({ id: item.id, name: item.name })}
          />

          <DrawerClose asChild>
            <Button variant="secondary" className="flex-1">
              关闭
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
