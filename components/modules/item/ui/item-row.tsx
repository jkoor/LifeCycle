"use client"

import { Category } from "@prisma/client"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Pencil } from "lucide-react"

import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { InventoryItem } from "../types"
import { useItem } from "../hooks/use-item"
import { ItemAvatar } from "./item-avatar"
import { ItemTags } from "./item-tags"
import { ItemStockControl } from "./item-stock-control"
import { ItemActions } from "./item-actions"
import { AddItemModal } from "@/components/features/inventory/add-item-modal"
import { useDeleteDialog } from "@/components/common/delete-dialog-provider"

interface ItemRowProps {
  item: InventoryItem
  categories: Category[]
}

/**
 * 物品列表行组件 (Table View)
 *
 * 使用 useItem Hook 和原子组件。
 * 删除确认由外层 DeleteDialogProvider 处理。
 */
export function ItemRow({ item, categories }: ItemRowProps) {
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
          {statusState.key !== "healthy" && statusState.key !== "low_stock" ? (
            <Badge
              variant="ghost"
              className={cn(
                "border-0 font-medium min-w-[56px] justify-center",
                statusState.variant === "destructive" &&
                  "bg-red-500/10 text-red-500",
                statusState.variant === "warning" &&
                  "bg-amber-500/10 text-amber-500"
              )}
            >
              {statusState.label}
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
            statusState={statusState}
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
          onDelete={() => requestDelete({ id: item.id, name: item.name })}
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
  )
}
