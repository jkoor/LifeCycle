"use client"

import { useState } from "react"
import { InventoryItem } from "@/types/inventory"
import { Category } from "@prisma/client"
import { cn } from "@/lib/utils"
import { ChevronRight, Pencil, AlertTriangle } from "lucide-react"

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useInventoryItem } from "../hooks/use-inventory-item"
import { ItemAvatar, ItemStockControl, ItemActionButtons } from "../atoms"
import { ItemStatusBadge } from "../atoms"
import { AddItemModal } from "../add-item-modal"

interface InventoryMobileRowProps {
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
 */
export function InventoryMobileRow({
  item,
  categories,
  className,
}: InventoryMobileRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    isUpdatingStock,
    isReplacing,
    isArchiving,
    isUpdatingNotification,
    isDeleting,
    handleUpdateStock,
    handleReplace,
    handleToggleArchive,
    handleToggleNotification,
    handleDelete,
    daysRemaining,
    status,
  } = useInventoryItem(item)

  return (
    <>
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
                <ItemStatusBadge item={item} />
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
              <ItemStatusBadge item={item} />
            </div>

            {/* 剩余天数 */}
            {status && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">剩余天数</span>
                <span className={cn("text-sm font-medium", status.color)}>
                  {status.label}
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
                isUpdating={isUpdatingStock}
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
            <ItemActionButtons
              variant="dropdown"
              size="md"
              isArchived={item.isArchived}
              isNotificationEnabled={(item.notifyAdvanceDays ?? 0) > 0}
              notifyAdvanceDays={item.notifyAdvanceDays}
              isReplacing={isReplacing}
              isArchiving={isArchiving}
              isUpdatingNotification={isUpdatingNotification}
              isDeleting={isDeleting}
              daysRemaining={daysRemaining}
              stock={item.stock ?? 0}
              onReplace={handleReplace}
              onToggleArchive={handleToggleArchive}
              onToggleNotification={handleToggleNotification}
              onDelete={() => setShowDeleteDialog(true)}
            />

            <DrawerClose asChild>
              <Button variant="secondary" className="flex-1">
                关闭
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <div className="space-y-2">
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                <AlertDialogDescription>
                  您确定要删除「{item.name}」吗？此操作无法撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
