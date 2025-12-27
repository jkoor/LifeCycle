"use client"

import { useOptimistic, useTransition } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"

interface ItemStockControlProps {
  /** 当前库存数量 */
  stock: number
  /** 库存更新回调，返回 { error?: string } 用于回滚判断 */
  onUpdateStock: (delta: number) => Promise<{ error?: string } | void> | void
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
 * 库存控制组件（带乐观更新）
 *
 * 特性：
 * - 点击立即更新数字（Optimistic UI）
 * - 后台静默发送请求
 * - 失败时自动回滚 + 显示错误通知
 *
 * 视觉表现：
 * - 库存为 0 时：红色显示，减少按钮禁用
 * - 库存 <= 2 时：黄色警告
 * - 正常库存：默认颜色
 *
 * @example
 * ```tsx
 * <ItemStockControl
 *   stock={item.stock}
 *   onUpdateStock={async (delta) => {
 *     const res = await updateStock(item.id, delta)
 *     return res // { error?: string }
 *   }}
 * />
 * ```
 */
export function ItemStockControl({
  stock,
  onUpdateStock,
  size = "md",
  className,
}: ItemStockControlProps) {
  const { button: buttonSize, icon: iconSize } = sizeClasses[size]

  // React 19 Optimistic Update
  const [optimisticStock, addOptimisticStock] = useOptimistic(
    stock,
    (currentStock, delta: number) => Math.max(0, currentStock + delta)
  )

  // 用于触发 optimistic update 的 transition
  const [isPending, startTransition] = useTransition()

  const handleClick = (delta: number) => {
    // 预检查：减少时库存不能为负
    if (delta < 0 && optimisticStock <= 0) return

    startTransition(async () => {
      // 1. 立即乐观更新 UI
      addOptimisticStock(delta)

      // 2. 后台发送请求
      try {
        const result = await onUpdateStock(delta)

        // 3. 如果返回错误，显示 toast（回滚由 React 自动处理）
        if (
          result &&
          typeof result === "object" &&
          "error" in result &&
          result.error
        ) {
          toast.error("更新库存失败", { description: result.error })
        }
      } catch {
        toast.error("更新库存失败", { description: "网络错误，请重试" })
      }
    })
  }

  const stockColor =
    optimisticStock === 0
      ? "text-red-500"
      : optimisticStock <= 2
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
              onClick={() => handleClick(-1)}
              disabled={isPending || optimisticStock <= 0}
            >
              <Minus className={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>减少库存</TooltipContent>
        </Tooltip>

        <span
          className={cn(
            "min-w-[24px] text-center text-sm font-medium transition-colors",
            stockColor
          )}
        >
          {optimisticStock}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(buttonSize, "hover:bg-primary hover:text-white")}
              onClick={() => handleClick(1)}
              disabled={isPending}
            >
              <Plus className={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>增加库存</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
