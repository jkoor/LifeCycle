"use client"

import { InventoryItem } from "@/types/inventory"
import { InventoryDesktopTable } from "./inventory-desktop-table"
import { InventoryMobileGrid } from "./inventory-mobile-grid"
import type { Category } from "@prisma/client"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Package, Plus } from "lucide-react"
import { AddItemModal } from "@/components/modules/item/ui"
import { SortByOption, SortDirOption } from "@/app/inventory/search-params"

interface InventoryContainerProps {
  items: InventoryItem[]
  searchQuery?: string | null
  categories: Category[]
  sortBy?: SortByOption
  sortDir?: SortDirOption
  isArchived?: boolean
}

/**
 * 库存视图容器
 *
 * 负责：
 * - 空状态处理
 * - 响应式视图切换（桌面端表格 / 移动端列表）
 */
export function InventoryContainer({
  items,
  searchQuery,
  categories,
  sortBy = "remainingDays",
  sortDir = "asc",
  isArchived = false,
}: InventoryContainerProps) {
  if (items.length === 0) {
    const isSearching = searchQuery && searchQuery.length > 0

    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package className="size-5" />
          </EmptyMedia>
          <EmptyTitle>
            {isSearching
              ? "未找到匹配的物品"
              : isArchived
                ? "没有归档的物品"
                : "还没有物品"}
          </EmptyTitle>
          <EmptyDescription>
            {isSearching
              ? `没有找到与 "${searchQuery}" 匹配的物品，请尝试其他关键词。`
              : isArchived
                ? "归档列表为空，归档后的物品将显示在这里。"
                : "开始添加你的第一个物品，追踪它的生命周期。"}
          </EmptyDescription>
        </EmptyHeader>
        {!isSearching && !isArchived && (
          <EmptyContent>
            <AddItemModal categories={categories}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                立即创建
              </Button>
            </AddItemModal>
          </EmptyContent>
        )}
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      {/* 桌面端表格视图 - 内置 hidden md:block */}
      <InventoryDesktopTable
        items={items}
        categories={categories}
        sortBy={sortBy}
        sortDir={sortDir}
      />

      {/* 移动端列表视图 - 内置 block md:hidden */}
      <InventoryMobileGrid
        items={items}
        categories={categories}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </div>
  )
}
