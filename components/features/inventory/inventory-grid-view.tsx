import { InventoryItem } from "@/types/inventory"
import { InventoryCard } from "./inventory-card"

import { cn } from "@/lib/utils"

interface InventoryGridViewProps {
  items: InventoryItem[]
  className?: string
}

export function InventoryGridView({
  items,
  className,
}: InventoryGridViewProps) {
  return (
    <div className={cn("space-y-4 block md:hidden", className)}>
      {items.map((item) => (
        <InventoryCard key={item.id} item={item} />
      ))}
    </div>
  )
}
