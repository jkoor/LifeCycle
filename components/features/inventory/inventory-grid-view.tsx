import { InventoryItem } from "@/types/inventory"
import { InventoryCard } from "./inventory-card"

import { cn } from "@/lib/utils"
import { Category } from "@prisma/client"

interface InventoryGridViewProps {
  items: InventoryItem[]
  categories: Category[]
  className?: string
}

export function InventoryGridView({
  items,
  categories,
  className,
}: InventoryGridViewProps) {
  return (
    <div className={cn("space-y-4 block md:hidden", className)}>
      {items.map((item) => (
        <InventoryCard key={item.id} item={item} categories={categories} />
      ))}
    </div>
  )
}
