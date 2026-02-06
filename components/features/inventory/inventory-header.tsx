import { Category } from "@prisma/client"
import { Box } from 'lucide-react';

interface InventoryHeaderProps {
  categories: Category[]
}

export function InventoryHeader({ categories }: InventoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Box className="h-8 w-8 text-primary" />
          库存管理
        </h1>
        <p className="text-muted-foreground mt-1">
          管理您的所有物品信息及状态
        </p>
      </div>
    </div>
  )
}

