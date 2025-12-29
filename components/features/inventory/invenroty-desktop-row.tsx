"use client"

import { useState } from "react"
import { Category } from "@prisma/client"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

import { TableCell, TableRow } from "@/components/ui/table"

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

        {/* 操作列: 更换/Pin/通知 + 菜单(归档/删除) */}
        <TableCell className="h-16 pl-2 pr-4 text-center">
          <div className="flex items-center justify-center gap-0.5">
            {/* 更换/Pin/通知 三个图标按钮 */}
            <ItemActions
              variant="icons"
              size="md"
              isReplacing={isReplacing}
              statusState={statusState}
              stock={item.stock ?? 0}
              onReplace={handleReplace}
              // Pin 功能预留（暂无后端实现）
              isPinned={false}
              isPinning={false}
              onTogglePin={() => {
                // TODO: 实现 handleTogglePin
                console.log("Pin toggle clicked - not yet implemented")
              }}
              isNotificationEnabled={(item.notifyAdvanceDays ?? 0) > 0}
              notifyAdvanceDays={item.notifyAdvanceDays}
              isUpdatingNotification={isUpdatingNotification}
              onToggleNotification={handleToggleNotification}
            />

            {/* 下拉菜单: 编辑/归档/删除 */}
            <ItemActions
              variant="dropdown"
              size="md"
              onEdit={() => setIsEditModalOpen(true)}
              isArchived={item.isArchived}
              isArchiving={isArchiving}
              isDeleting={isDeleting}
              onToggleArchive={handleToggleArchive}
              onDelete={() => requestDelete({ id: item.id, name: item.name })}
            />
          </div>
        </TableCell>
      </TableRow>
    </>
  )
}
