"use client"

import { Suspense } from "react"
import { PageContainer } from "@/components/common"
import { InventoryToolbar } from "@/components/features/inventory/inventory-toolbar"
import { InventoryContainer } from "@/components/features/inventory/inventory-container"
import type { Category } from "@prisma/client"
import { InventoryItem } from "@/components/modules/item/types"
import { SortByOption, SortDirOption } from "@/app/inventory/search-params"

interface InventoryContentProps {
  items: InventoryItem[]
  categories: Category[]
  searchQuery: string
  sortBy: SortByOption
  sortDir: SortDirOption
  isArchived: boolean
}

export function InventoryContent({
  items,
  categories,
  searchQuery,
  sortBy,
  sortDir,
  isArchived,
}: InventoryContentProps) {
  return (
    <PageContainer title="库存管理" description="管理您的所有物品信息及状态">
      <div className="space-y-6">
        {/* Toolbar: Search + Filters */}
        <Suspense
          fallback={
            <div className="h-14 w-full bg-muted/20 animate-pulse rounded-lg" />
          }
        >
          <InventoryToolbar />
        </Suspense>

        {/* Data View: Table (Desktop) / Grid (Mobile) */}
        <Suspense
          key={JSON.stringify({ searchQuery, sortBy, sortDir, isArchived })}
          fallback={
            <div className="h-64 w-full bg-muted/20 animate-pulse rounded-lg" />
          }
        >
          <InventoryContainer
            items={items}
            searchQuery={searchQuery}
            categories={categories}
            sortBy={sortBy}
            sortDir={sortDir}
            isArchived={isArchived}
          />
        </Suspense>
      </div>
    </PageContainer>
  )
}
