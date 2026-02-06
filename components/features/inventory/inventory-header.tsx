import { Category } from "@prisma/client"

interface InventoryHeaderProps {
  categories: Category[]
}

export function InventoryHeader({ categories }: InventoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Manage your food items and track expiration dates.
        </p>
      </div>
    </div>
  )
}
