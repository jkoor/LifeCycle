import { ItemWithRelations } from "@/types/inventory"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface InventoryListProps {
  items: ItemWithRelations[]
}

export function InventoryList({ items }: InventoryListProps) {
  // Placeholder for the actual list/grid view
  // Initially showing a loading skeleton
  if (items.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/10 text-muted-foreground">
        No items found. Click "Add Item" to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table Header Skeleton - hidden on mobile */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
        <div className="col-span-12 md:col-span-5">Item</div>
        <div className="col-span-2 hidden md:block">Category</div>
        <div className="col-span-2 hidden md:block">Stock</div>
        <div className="col-span-2 hidden md:block">Status</div>
        <div className="col-span-1 hidden md:block"></div>
      </div>

      {/* List Items */}
      {items.map((item) => (
        <Card key={item.id} className="border-border/50 shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                {/* Temporary placeholder for image */}
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-xs">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    "Img"
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.brand || "No brand"}
                  </div>
                </div>
              </div>

              <div className="col-span-2 hidden md:block">
                {/* Category Placeholder */}
                <span className="text-sm">{item.category?.name || "-"}</span>
              </div>

              <div className="col-span-2 hidden md:block">
                <span className="text-sm font-medium">{item.stock}</span>
              </div>

              <div className="col-span-2 hidden md:block">
                {/* Status Placeholder */}
                <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                  {item.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="col-span-1 hidden md:flex justify-end">
                {/* Actions Placeholder */}
                <span className="text-muted-foreground">...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
