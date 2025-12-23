import { InventoryItem } from "@/types/inventory"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Archive, Pencil, Trash, Package, RefreshCwIcon } from "lucide-react"
import { ItemStatusBadge } from "./item-status-badge"

interface InventoryCardProps {
  item: InventoryItem
}

export function InventoryCard({ item }: InventoryCardProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-4 p-4 items-center">
          <div className="flex items-center gap-3">
            {/* Image Area */}
            <div className="h-12 w-12 min-w-12 rounded-lg bg-muted flex items-center justify-center text-xs overflow-hidden border border-border/50">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground/40" />
              )}
            </div>

            {/* Content Area */}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium truncate">{item.name}</div>

                {/* Actions & Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <ItemStatusBadge item={item} />
                  <div className="flex items-center -mr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-ghost hover:text-primary/80 hover:bg-primary/10"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-ghost hover:text-amber-500 hover:bg-amber-100"
                    >
                      <RefreshCwIcon className="h-4 w-4" />
                      <span className="sr-only">Replace</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-ghost hover:text-indigo-500 hover:bg-indigo-100"
                    >
                      <Archive className="h-4 w-4" />
                      <span className="sr-only">Archive</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate pr-2">
                  {item.category?.name || "Uncategorized"}
                </span>
                <span className="shrink-0 font-medium text-foreground/80">
                  Stock: {item.stock}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
