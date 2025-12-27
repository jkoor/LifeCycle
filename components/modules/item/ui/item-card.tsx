"use client"

import { Category } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Pencil } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { InventoryItem } from "../types"
import { useItem } from "../hooks/use-item"
import { ItemAvatar } from "./item-avatar"
import { ItemTags } from "./item-tags"
import { ItemStockControl } from "./item-stock-control"
import { ItemStatus } from "./item-status"
import { ItemActions } from "./item-actions"
import { AddItemModal } from "@/components/features/inventory/add-item-modal"
import { useDeleteDialog } from "@/components/common/delete-dialog-provider"

interface ItemCardProps {
  item: InventoryItem
  categories: Category[]
  className?: string
}

/**
 * 物品卡片组件 (Grid View)
 *
 * 使用原子组件和 useItem Hook 实现，
 * 逻辑统一，Loading 状态一致。
 * 删除确认由外层 DeleteDialogProvider 处理。
 */
export function ItemCard({ item, categories, className }: ItemCardProps) {
  const { requestDelete } = useDeleteDialog()

  const {
    isReplacing,
    isArchiving,
    isDeleting,
    handleUpdateStock,
    handleReplace,
    handleToggleArchive,
    statusState,
  } = useItem(item)

  return (
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
              <ItemStatus item={item} />
            </div>

            {/* 第二行: 分类 + 标签 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">
                {item.category?.name || "未分类"}
              </span>
              <ItemTags tags={item.tags} maxDisplay={2} size="sm" />
            </div>

            {/* 第三行: 库存控制 + 操作按钮 */}
            <div className="flex items-center justify-between pt-1">
              <ItemStockControl
                stock={item.stock ?? 0}
                onUpdateStock={handleUpdateStock}
                size="sm"
              />

              <ItemActions
                variant="icons"
                size="sm"
                isArchived={item.isArchived}
                isReplacing={isReplacing}
                isArchiving={isArchiving}
                isDeleting={isDeleting}
                statusState={statusState}
                stock={item.stock ?? 0}
                onReplace={handleReplace}
                onToggleArchive={handleToggleArchive}
                onDelete={() => requestDelete({ id: item.id, name: item.name })}
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
  )
}
