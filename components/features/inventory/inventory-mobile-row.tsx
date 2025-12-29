"use client"

import { Category } from "@prisma/client"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  Pencil,
  Bell,
  BellOff,
  PinOff,
  Loader2,
} from "lucide-react"
import { RefreshCWIcon } from "@/components/ui/refresh-cw"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

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

import {
  InventoryItem,
  useItem,
  ItemAvatar,
  ItemStockControl,
  ItemStatus,
  ItemRemainingDays,
  ItemActions,
} from "@/components/modules/item"
import { AddItemModal } from "@/components/modules/item/ui"
import { useDeleteDialog } from "@/components/common/delete-dialog-provider"

interface ItemMobileRowProps {
  item: InventoryItem
  categories: Category[]
  className?: string
}

/**
 * 移动端物品行组件（Drawer 模式）
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

  const isNotificationEnabled = (item.notifyAdvanceDays ?? 0) > 0

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
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">剩余天数</span>
            <ItemRemainingDays item={item} />
          </div>

          {/* 规格 */}
          {item.quantity && item.unit && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">规格</span>
              <span className="text-sm font-medium">
                {item.quantity} {item.unit}
              </span>
            </div>
          )}

          {/* 上次更换 */}
          {item.lastOpenedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">上次更换</span>
              <span className="text-sm font-medium">
                {format(new Date(item.lastOpenedAt), "yyyy/MM/dd", {
                  locale: zhCN,
                })}
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
              isStockFixed={item.isStockFixed}
              onUpdateStock={handleUpdateStock}
              size="md"
            />
          </div>
        </div>

        {/* 操作按钮区域: 更换/Pin/通知 + 菜单(归档/删除) */}
        <div className="px-4 py-3 border-t">
          <div className="grid grid-cols-4 gap-2">
            {/* 更换按钮 */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                statusState?.key === "expired"
                  ? "border-destructive text-destructive hover:bg-destructive hover:text-white"
                  : "hover:bg-primary hover:text-white"
              )}
              onClick={handleReplace}
              disabled={isReplacing || (item.stock ?? 0) < 1}
            >
              {isReplacing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCWIcon size={16} />
              )}
              <span className="text-xs">更换</span>
            </Button>

            {/* 置顶按钮 (功能预留) */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                // TODO: 接入 isPinned 状态
                // isPinned
                //   ? "border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white"
                //   :
                "text-muted-foreground hover:bg-amber-500 hover:text-white"
              )}
              // TODO: 接入 handleTogglePin
              disabled
            >
              <PinOff className="size-4" />
              <span className="text-xs">置顶</span>
            </Button>

            {/* 通知按钮 */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                isNotificationEnabled
                  ? "border-primary text-primary hover:bg-primary hover:text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
              onClick={() => handleToggleNotification(!isNotificationEnabled)}
              disabled={isUpdatingNotification}
            >
              {isUpdatingNotification ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isNotificationEnabled ? (
                <Bell className="size-4" />
              ) : (
                <BellOff className="size-4" />
              )}
              <span className="text-xs">
                {isNotificationEnabled ? "通知" : "静音"}
              </span>
            </Button>

            {/* 更多菜单 (归档/删除) */}
            <div className="flex items-center justify-center">
              <ItemActions
                variant="dropdown"
                size="md"
                isArchived={item.isArchived}
                isArchiving={isArchiving}
                isDeleting={isDeleting}
                onToggleArchive={handleToggleArchive}
                onDelete={() => requestDelete({ id: item.id, name: item.name })}
              />
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-row gap-2 pt-2">
          {/* 编辑按钮 */}
          <AddItemModal item={item} categories={categories}>
            <Button variant="outline" className="flex-1">
              <Pencil className="size-4 mr-2" />
              编辑
            </Button>
          </AddItemModal>

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
