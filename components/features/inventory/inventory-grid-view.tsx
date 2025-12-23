import { InventoryItem } from "@/types/inventory"
import { InventoryCard } from "./inventory-card"

interface InventoryGridViewProps {
  items: InventoryItem[]
}

export function InventoryGridView({ items }: InventoryGridViewProps) {
  return (
    <div className="space-y-4 block md:hidden">
      {items.map((item) => (
        <InventoryCard key={item.id} item={item} />
      ))}
    </div>
  )
}
