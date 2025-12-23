import { InventoryItem } from "@/types/inventory"
import { Card, CardContent } from "@/components/ui/card"
import { InventoryListView } from "@/components/features/inventory/inventory-list-view"
import { InventoryGridView } from "@/components/features/inventory/inventory-grid-view"
import { Badge } from "@/components/ui/badge"

interface InventoryListProps {
  items: InventoryItem[]
}

export function InventoryList({ items }: InventoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/10 text-muted-foreground">
        No items found. Click "Add Item" to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop View */}
      <InventoryListView items={items} />

      {/* Mobile View - Card List */}
      <InventoryGridView items={items} />
    </div>
  )
}
