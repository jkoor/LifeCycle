import { InventoryItem } from "@/types/inventory"
import { Card, CardContent } from "@/components/ui/card"
import { InventoryListView } from "@/components/features/inventory/inventory-list-view"
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
      <div className="space-y-4 md:hidden">
        {items.map((item) => (
          <Card key={item.id} className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-4 p-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-xs overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "Img"
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{item.name}</div>
                      <Badge
                        variant={item.stock > 0 ? "outline" : "destructive"}
                      >
                        {item.stock > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.category?.name || "Uncategorized"}</span>
                      <span>Stock: {item.stock}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
