"use client"

import { InventoryItem } from "@/types/inventory"
import { InventoryListView } from "@/components/features/inventory/inventory-list-view"
import { InventoryGridView } from "@/components/features/inventory/inventory-grid-view"
import { Category } from "@prisma/client"
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
import { AddItemModal } from "./add-item-modal"

interface InventoryListProps {
  items: InventoryItem[]
  view?: string | null
  searchQuery?: string | null
  categories: Category[]
}

export function InventoryList({
  items,
  view,
  searchQuery,
  categories,
}: InventoryListProps) {
  if (items.length === 0) {
    const isSearching = searchQuery && searchQuery.length > 0

    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package className="size-5" />
          </EmptyMedia>
          <EmptyTitle>
            {isSearching ? "未找到匹配的物品" : "还没有物品"}
          </EmptyTitle>
          <EmptyDescription>
            {isSearching
              ? `没有找到与 "${searchQuery}" 匹配的物品，请尝试其他关键词。`
              : "开始添加你的第一个物品，追踪它的生命周期。"}
          </EmptyDescription>
        </EmptyHeader>
        {!isSearching && (
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
      {/* Desktop View / Table View */}
      {/* 
        Show ListView if:
        1. view is 'table' (explicit) -> force show on all screens
        2. view is null (responsive default) -> handled by built-in classes (hidden on mobile, show on desktop)
        3. view is 'grid' (explicit) -> force hide on all screens
      */}
      <InventoryListView
        items={items}
        categories={categories}
        className={
          view === "table"
            ? "block" // force table: show on all screens
            : view === "grid"
            ? "hidden md:hidden" // force grid: completely hide list view
            : undefined // default: use built-in responsive classes
        }
      />

      {/* Mobile View / Grid View */}
      {/*
        Show GridView if:
        1. view is 'grid' (explicit) -> force show on all screens
        2. view is null (responsive default) -> handled by built-in classes (show on mobile, hidden on desktop)
        3. view is 'table' (explicit) -> force hide on all screens
      */}
      <InventoryGridView
        items={items}
        categories={categories}
        className={
          view === "grid"
            ? "block md:block" // force grid: show on all screens
            : view === "table"
            ? "hidden md:hidden" // force table: completely hide grid view
            : undefined // default: use built-in responsive classes
        }
      />
    </div>
  )
}
