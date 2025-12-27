"use client"

import { useState } from "react"
import { Category } from "@prisma/client"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Pencil, AlertTriangle } from "lucide-react"

import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

import { InventoryItem } from "../types"
import { useItem } from "../hooks/use-item"
import { ItemAvatar } from "./item-avatar"
import { ItemTags } from "./item-tags"
import { ItemStockControl } from "./item-stock-control"
import { ItemActions } from "./item-actions"
import { AddItemModal } from "@/components/features/inventory/add-item-modal"

interface ItemRowProps {
  item: InventoryItem
  categories: Category[]
}

/**
 * 物品列表行组件 (Table View)
 *
 * 使用 useItem Hook 和原子组件。
 */
export function ItemRow({ item, categories }: ItemRowProps) {
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
  } = useItem(item)

  return (
    <>
      <TableRow className="hover:bg-muted/50 group border-b-0 last:border-b">
        {/* 物品信息列 */}
        <TableCell className="h-16 pl-4 pr-2">
          <div className="flex items-center gap-3">
            <ItemAvatar src={item.image} name={item.name} size="md" />
            <div className="flex flex-col min-w-0">
              <span className="font-medium truncate" title={item.name}>
                {item.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground truncate">
                  {item.brand || "无品牌"}
                </span>
                <ItemTags tags={item.tags} maxDisplay={2} size="sm" />
              </div>
            </div>
          </div>
        </TableCell>

        {/* 价格列 */}
        <TableCell className="h-16 px-2 text-sm font-medium text-right">
          {item.price !== undefined && item.price !== null
            ? `¥${Number(item.price).toFixed(2)}`
            : "-"}
        </TableCell>

        {/* 间隔列 */}
        <TableCell></TableCell>

        {/* 库存列 */}
        <TableCell className="h-16 px-2 text-center">
          <ItemStockControl
            stock={item.stock ?? 0}
            isUpdating={isUpdatingStock}
            onUpdateStock={handleUpdateStock}
          />
        </TableCell>

        {/* 上次更换列 */}
        <TableCell className="h-16 px-2 text-sm text-muted-foreground text-center">
          {item.lastOpenedAt
            ? format(new Date(item.lastOpenedAt), "yyyy-MM-dd", {
                locale: zhCN,
              })
            : "-"}
        </TableCell>

        {/* 剩余天数列 */}
        <TableCell className="h-16 px-2 text-center">
          <div className="flex items-center justify-center gap-1">
            {status ? (
              <Badge
                variant="ghost"
                className={cn(
                  "border-0 font-medium min-w-[56px] justify-center",
                  status.bg,
                  status.color
                )}
              >
                {status.label}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground min-w-[56px] text-center">
                -
              </span>
            )}

            <ItemActions
              variant="icons"
              size="md"
              isNotificationEnabled={(item.notifyAdvanceDays ?? 0) > 0}
              notifyAdvanceDays={item.notifyAdvanceDays}
              isReplacing={isReplacing}
              isUpdatingNotification={isUpdatingNotification}
              daysRemaining={daysRemaining}
              stock={item.stock ?? 0}
              onReplace={handleReplace}
              onToggleNotification={handleToggleNotification}
            />
          </div>
        </TableCell>

        {/* 操作列 */}
        <TableCell className="h-16 pl-2 pr-4 text-center">
          <ItemActions
            variant="icons"
            size="md"
            isArchived={item.isArchived}
            isArchiving={isArchiving}
            isDeleting={isDeleting}
            onToggleArchive={handleToggleArchive}
            onDelete={() => setShowDeleteDialog(true)}
            editButton={
              <AddItemModal item={item} categories={categories}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-primary hover:text-white"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </AddItemModal>
            }
          />
        </TableCell>
      </TableRow>

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
