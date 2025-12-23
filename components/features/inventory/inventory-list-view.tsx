"use client"

import { InventoryItem } from "@/types/inventory"
import {
  Archive,
  Pencil,
  Trash,
  Package,
  RefreshCwIcon,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AddItemModal } from "./add-item-modal"
import { deleteItem } from "@/app/actions/item"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Category } from "@prisma/client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface InventoryListViewProps {
  items: InventoryItem[]
  categories: Category[]
  className?: string
}

export function InventoryListView({
  items,
  categories,
  className,
}: InventoryListViewProps) {
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
    <div className={cn("hidden rounded-md border md:block", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarImage src={item.image || ""} alt={item.name} />
                    <AvatarFallback>
                      {item.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.brand || "No brand"}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {item.category?.name || "Uncategorized"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={
                    item.stock <= 5 ? "font-medium text-destructive" : ""
                  }
                >
                  {item.stock} units
                </span>
              </TableCell>
              <TableCell>
                {/* TODO: Real status logic based on expiration */}
                <Badge variant={item.stock > 0 ? "outline" : "destructive"}>
                  {item.stock > 0 ? "In Stock" : "Out of Stock"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
