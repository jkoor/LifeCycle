import { InventoryItem } from "@/types/inventory"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Archive,
  Pencil,
  Trash,
  Package,
  RefreshCwIcon,
  Loader2,
} from "lucide-react"
import { ItemStatusBadge } from "./item-status-badge"
import { AddItemModal } from "./add-item-modal"
import { deleteItem } from "@/app/actions/item"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Category } from "@prisma/client"

interface InventoryCardProps {
  item: InventoryItem
  categories: Category[]
}

export function InventoryCard({ item, categories }: InventoryCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return
    setDeletingId(id)
    try {
      const res = await deleteItem(id)
      if (res.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.error,
        })
      } else {
        toast({ title: "Deleted", description: "Item deleted successfully" })
        router.refresh()
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete",
      })
    } finally {
      setDeletingId(null)
    }
  }
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-4 p-4 items-center">
          <div className="flex items-center gap-3">
            {/* Image Area */}
            <div
              className={cn(
                "h-12 w-12 min-w-12 rounded-lg flex items-center justify-center text-xs overflow-hidden shrink-0",
                item.image
                  ? "bg-transparent"
                  : "bg-muted border border-border/50"
              )}
            >
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
                    <AddItemModal item={item} categories={categories}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-ghost hover:text-primary/80 hover:bg-primary/10"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </AddItemModal>
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
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
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
