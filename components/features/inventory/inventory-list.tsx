import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function InventoryList() {
  // Placeholder for the actual list/grid view
  // Initially showing a loading skeleton
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

      {/* List Items Skeletons */}
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50 shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
