"use client"

import { useState } from "react"
import type { Category } from "@/generated/prisma/client"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

import { TableCell, TableRow } from "@/components/ui/table"

import { Pencil, Archive, ArchiveRestore, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  InventoryItem,
  useItem,
  ItemAvatar,
  ItemTags,
  ItemStockControl,
  ItemActions,
  ItemStatus,
  ItemRemainingDays,
} from "@/components/modules/item"
import { AddItemModal } from "@/components/modules/item/ui"
import { useDeleteDialog } from "@/components/common/delete-dialog-provider"
import { cn } from "@/lib/utils"

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const {
    isReplacing,
    isPinning,
    isArchiving,
    isUpdatingNotification,
    isDeleting,
    handleUpdateStock,
    handleReplace,
    handleTogglePin,
    handleToggleArchive,
    handleToggleNotification,
    statusState,
  } = useItem(item)

  const isItemArchived = item.isArchived

  return (
    <>
      {/* 编辑弹窗 */}
      <AddItemModal
        item={item}
        categories={categories}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

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

        {/* 状态列 */}
        <TableCell className="h-16 px-2">
          <div className="flex items-center justify-center">
            <ItemStatus item={item} />
          </div>
        </TableCell>

        {/* 价格列 */}
        <TableCell className="h-16 px-2 text-sm font-medium text-right">
          {item.price !== undefined && item.price !== null
            ? `¥${Number(item.price).toFixed(2)}`
            : "-"}
        </TableCell>

        {/* 规格列 */}
        <TableCell className="h-16 px-2 text-sm text-muted-foreground text-center">
          {item.quantity && item.unit ? `${item.quantity}${item.unit}` : "-"}
        </TableCell>

        {/* 间隔列 */}
        <TableCell></TableCell>

        {/* 库存列 */}
        <TableCell className="h-16 px-2 text-center">
          <ItemStockControl
            stock={item.stock ?? 0}
            isStockFixed={item.isStockFixed}
            onUpdateStock={handleUpdateStock}
            disabled={isItemArchived}
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
          <ItemRemainingDays item={item} />
        </TableCell>

        {/* 操作列 */}
        <TableCell className="h-16 pl-2 pr-4 text-center">
          <TooltipProvider>
            <div className="flex items-center justify-center gap-0.5">
              {isItemArchived ? (
                /* 归档物品：编辑、取消归档、删除 */
                <>
                  {/* 编辑按钮 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>编辑</TooltipContent>
                  </Tooltip>

                  {/* 取消归档按钮 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 text-indigo-500 hover:bg-indigo-500 hover:text-white",
                          isArchiving && "opacity-50"
                        )}
                        onClick={handleToggleArchive}
                        disabled={isArchiving}
                      >
                        {isArchiving ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <ArchiveRestore className="size-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>取消归档</TooltipContent>
                  </Tooltip>

                  {/* 删除按钮 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive hover:text-white"
                        onClick={() =>
                          requestDelete({ id: item.id, name: item.name })
                        }
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>删除</TooltipContent>
                  </Tooltip>
                </>
              ) : (
                /* 未归档物品：更换、置顶、通知、编辑、归档 */
                <>
                  {/* 更换/Pin/通知 */}
                  <ItemActions
                    variant="icons"
                    size="md"
                    isReplacing={isReplacing}
                    statusState={statusState}
                    stock={item.stock ?? 0}
                    onReplace={handleReplace}
                    isPinned={item.isPinned}
                    isPinning={isPinning}
                    onTogglePin={handleTogglePin}
                    isNotificationEnabled={(item.notifyAdvanceDays ?? 0) > 0}
                    notifyAdvanceDays={item.notifyAdvanceDays}
                    isUpdatingNotification={isUpdatingNotification}
                    onToggleNotification={handleToggleNotification}
                  />

                  {/* 编辑按钮 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>编辑</TooltipContent>
                  </Tooltip>

                  {/* 归档按钮 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 hover:bg-indigo-500 hover:text-white",
                          isArchiving && "opacity-50"
                        )}
                        onClick={handleToggleArchive}
                        disabled={isArchiving}
                      >
                        {isArchiving ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Archive className="size-3.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>归档</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </TooltipProvider>
        </TableCell>
      </TableRow>
    </>
  )
}
