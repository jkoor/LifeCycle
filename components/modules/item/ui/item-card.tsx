"use client"

import { Category } from "@prisma/client"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Pencil } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common"

import {
  InventoryItem,
  useItem,
  ItemAvatar,
  ItemTags,
  ItemStockControl,
  ItemStatus,
  ItemActions,
} from "@/components/modules/item"
import { AddItemModal } from "@/components/modules/item/ui"
import { useDeleteDialog } from "@/components/common/delete-dialog-provider"

interface ItemCardProps {
  item: InventoryItem
  categories: Category[]
  className?: string
}

/**
 * 物品卡片组件 (Grid View - 移动端)
 *
 * 显示与列表视图一致的信息：
 * - 物品基本信息（名称、品牌、分类、标签）
 * - 状态信息
 * - 价格
 * - 库存控制（支持锁定模式）
 * - 上次更换日期
 * - 剩余天数
 *
 * 删除确认由外层 DeleteDialogProvider 处理。
 */
export function ItemCard({ item, categories, className }: ItemCardProps) {
  const { requestDelete } = useDeleteDialog()

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
    daysRemaining,
    statusState,
  } = useItem(item)

  return (
    <Card className={cn("border-border/50 shadow-sm relative", className)}>
      {/* 右上角操作菜单 */}
      <div className="absolute top-2 right-2">
        <ItemActions
          variant="dropdown"
          size="md"
          isArchived={item.isArchived}
          isPinned={item.isPinned}
          isNotificationEnabled={(item.notifyAdvanceDays ?? 0) > 0}
          notifyAdvanceDays={item.notifyAdvanceDays}
          isReplacing={isReplacing}
          isPinning={isPinning}
          isArchiving={isArchiving}
          isUpdatingNotification={isUpdatingNotification}
          isDeleting={isDeleting}
          statusState={statusState}
          stock={item.stock ?? 0}
          onReplace={handleReplace}
          onTogglePin={handleTogglePin}
          onToggleArchive={handleToggleArchive}
          onToggleNotification={handleToggleNotification}
          onDelete={() => requestDelete({ id: item.id, name: item.name })}
        />
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* 左侧: 头像 */}
          <ItemAvatar src={item.image} name={item.name} size="lg" />

          {/* 右侧: 内容区 */}
          <div className="flex-1 min-w-0 space-y-2 pr-8">
            {/* 第一行: 名称 + 状态徽章 */}
            <div className="flex items-center gap-2">
              <span className="font-medium truncate" title={item.name}>
                {item.name}
              </span>
              <ItemStatus item={item} />
            </div>

            {/* 第二行: 品牌 + 分类 + 标签 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">
                {item.brand || "无品牌"} · {item.category?.name || "未分类"}
              </span>
              <ItemTags tags={item.tags} maxDisplay={2} size="sm" />
            </div>

            {/* 第三行: 价格 + 上次更换 + 剩余天数 */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {item.price !== undefined && item.price !== null && (
                <span className="font-medium text-foreground">
                  ¥{Number(item.price).toFixed(2)}
                </span>
              )}
              {item.lastOpenedAt && (
                <span>
                  上次:{" "}
                  {format(new Date(item.lastOpenedAt), "MM-dd", {
                    locale: zhCN,
                  })}
                </span>
              )}
              {statusState.key !== "out_of_stock" && daysRemaining !== null && (
                <StatusBadge
                  variant={statusState.variant}
                  label={`${daysRemaining} 天`}
                  className="text-xs"
                />
              )}
            </div>

            {/* 第四行: 库存控制 + 编辑/更换按钮 */}
            <div className="flex items-center justify-between pt-1">
              <ItemStockControl
                stock={item.stock ?? 0}
                isStockFixed={item.isStockFixed}
                spec={
                  item.quantity && item.unit
                    ? `${item.quantity}${item.unit}`
                    : undefined
                }
                onUpdateStock={handleUpdateStock}
                size="sm"
              />

              {/* 快捷操作按钮：编辑 + 更换 */}
              <div className="flex items-center gap-0.5">
                <AddItemModal item={item} categories={categories}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-primary hover:text-white"
                  >
                    <Pencil className="size-3" />
                  </Button>
                </AddItemModal>
                <ItemActions
                  variant="icons"
                  size="sm"
                  isReplacing={isReplacing}
                  statusState={statusState}
                  stock={item.stock ?? 0}
                  onReplace={handleReplace}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
