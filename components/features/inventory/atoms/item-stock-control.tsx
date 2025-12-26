"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2, Minus, Plus } from "lucide-react"

interface ItemStockControlProps {
  /** 当前库存数量 */
  stock: number
  /** 是否正在更新 */
  isUpdating?: boolean
  /** 库存更新回调 */
  onUpdateStock: (delta: number) => Promise<void> | void
  /** 尺寸: sm(h-6), md(h-7), lg(h-8) */
  size?: "sm" | "md" | "lg"
  /** 额外的 className */
  className?: string
}

const sizeClasses = {
  sm: { button: "h-6 w-6", icon: "size-3" },
  md: { button: "h-7 w-7", icon: "size-4" },
  lg: { button: "h-8 w-8", icon: "size-4" },
}

/**
 * 库存控制组件
 *
 * 包含加减按钮和库存数字显示：
 * - 库存为 0 时：红色显示，减少按钮禁用
 * - 库存 <= 2 时：黄色警告
 * - 正常库存：默认颜色
 *
 * @example
 * ```tsx
 * const { isUpdatingStock, handleUpdateStock } = useInventoryItem(item)
 * <ItemStockControl
 *   stock={item.stock}
 *   isUpdating={isUpdatingStock}
 *   onUpdateStock={handleUpdateStock}
 * />
 * ```
 */
export function ItemStockControl({
  stock,
  isUpdating = false,
  onUpdateStock,
  size = "md",
  className,
}: ItemStockControlProps) {
  const { button: buttonSize, icon: iconSize } = sizeClasses[size]

  const stockColor =
    stock === 0
      ? "text-red-500"
      : stock <= 2
      ? "text-amber-500"
      : "text-foreground"

  return (
    <TooltipProvider>
      <div className={cn("flex items-center justify-center gap-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(buttonSize, "hover:bg-primary hover:text-white")}
              onClick={() => onUpdateStock(-1)}
              disabled={isUpdating || stock <= 0}
            >
              {isUpdating ? (
                <Loader2 className={cn(iconSize, "animate-spin")} />
              ) : (
                <Minus className={iconSize} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>减少库存</TooltipContent>
        </Tooltip>

        <span
          className={cn(
            "min-w-[24px] text-center text-sm font-medium",
            stockColor
          )}
        >
          {stock}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(buttonSize, "hover:bg-primary hover:text-white")}
              onClick={() => onUpdateStock(1)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className={cn(iconSize, "animate-spin")} />
              ) : (
                <Plus className={iconSize} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>增加库存</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
