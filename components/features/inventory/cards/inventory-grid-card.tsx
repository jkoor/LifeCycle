"use client"

import { useState } from "react"
import { InventoryItem } from "@/types/inventory"
import { Category } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
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
import { AlertTriangle } from "lucide-react"

import { useInventoryItem } from "../hooks/use-inventory-item"
import {
  ItemAvatar,
  ItemStockControl,
  ItemTagsList,
  ItemActionButtons,
} from "../atoms"
import { ItemStatusBadge } from "../atoms"
import { AddItemModal } from "../add-item-modal"

interface InventoryCardProps {
  item: InventoryItem
  categories: Category[]
  className?: string
}

/**
 * 物品卡片组件 (Grid View)
 *
 * 使用原子组件和 useInventoryItem Hook 实现，
 * 逻辑统一，Loading 状态一致。
 */
export function InventoryCard({
  item,
  categories,
  className,
}: InventoryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    isUpdatingStock,
    isReplacing,
    isArchiving,
    isDeleting,
    handleUpdateStock,
    handleReplace,
    handleToggleArchive,
    handleDelete,
    daysRemaining,
  } = useInventoryItem(item)

  return (
    <>
      <Card className={cn("border-border/50 shadow-sm", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* 左侧: 头像 */}
            <ItemAvatar src={item.image} name={item.name} size="lg" />

            {/* 右侧: 内容区 */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* 第一行: 名称 + 状态徽章 */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate" title={item.name}>
                  {item.name}
                </span>
                <ItemStatusBadge item={item} />
              </div>

              {/* 第二行: 分类 + 标签 */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">
                  {item.category?.name || "未分类"}
                </span>
                <ItemTagsList tags={item.tags} maxDisplay={2} size="sm" />
              </div>

              {/* 第三行: 库存控制 + 操作按钮 */}
              <div className="flex items-center justify-between pt-1">
                <ItemStockControl
                  stock={item.stock ?? 0}
                  isUpdating={isUpdatingStock}
                  onUpdateStock={handleUpdateStock}
                  size="sm"
                />

                <ItemActionButtons
                  variant="icons"
                  size="sm"
                  isArchived={item.isArchived}
                  isReplacing={isReplacing}
                  isArchiving={isArchiving}
                  isDeleting={isDeleting}
                  daysRemaining={daysRemaining}
                  stock={item.stock ?? 0}
                  onReplace={handleReplace}
                  onToggleArchive={handleToggleArchive}
                  onDelete={() => setShowDeleteDialog(true)}
                  editButton={
                    <AddItemModal item={item} categories={categories}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-primary hover:text-white"
                      >
                        <Pencil className="size-3" />
                      </Button>
                    </AddItemModal>
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
