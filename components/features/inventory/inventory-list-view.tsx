"use client"

import { InventoryItem } from "@/types/inventory"
import { Archive, Pencil, Trash, Package, RefreshCwIcon } from "lucide-react"


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
}

export function InventoryListView({ items }: InventoryListViewProps) {
  return (
    <div className="hidden rounded-md border md:block">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
