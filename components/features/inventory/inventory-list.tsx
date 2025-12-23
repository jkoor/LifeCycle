"use client"

import { InventoryItem } from "@/types/inventory"
import { InventoryListView } from "@/components/features/inventory/inventory-list-view"
import { InventoryGridView } from "@/components/features/inventory/inventory-grid-view"

interface InventoryListProps {
  items: InventoryItem[]
  view?: string | null
}

export function InventoryList({ items, view }: InventoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/10 text-muted-foreground">
        No items found. Click "Add Item" to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop View / Table View */}
      {/* 
        Show ListView if:
        1. view is 'table' (explicit)
        2. view is null (responsive default) -> handled by built-in classes
      */}
      <InventoryListView
        items={items}
        className={
          view === "table" ? "block" : view === "grid" ? "hidden" : undefined
        }
      />

      {/* Mobile View / Grid View */}
      {/*
        Show GridView if:
        1. view is 'grid' (explicit)
        2. view is null (responsive default) -> handled by built-in classes
      */}
      <InventoryGridView
        items={items}
        className={
          view === "grid"
            ? "block md:block"
            : view === "table"
            ? "hidden"
            : undefined
        }
      />
    </div>
  )
}
