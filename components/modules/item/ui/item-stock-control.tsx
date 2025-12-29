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
import { Lock, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

interface ItemStockControlProps {
  /** 当前库存数量 */
  stock: number
  /** 库存更新回调，返回 { error?: string } 用于回滚判断 */
  onUpdateStock: (delta: number) => Promise<{ error?: string } | void> | void
  /** 是否为固定库存模式 */
  isStockFixed?: boolean
  /** 规格信息（如 "500 ml"），可选显示 */
  spec?: string
  /** 尺寸: sm(h-6), md(h-7), lg(h-8) */
  size?: "sm" | "md" | "lg"
  /** 额外的 className */
  className?: string
  /** 是否禁用加减按钮（仅灰色禁用，不显示锁定图标） */
  disabled?: boolean
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
 * - 固定库存模式：显示锁定图标，禁用加减按钮
 *
 * 视觉表现：
 * - 固定库存：显示锁定图标
 * - 库存为 0 时：统一颜色
 * - 正常库存：默认颜色
 *
 * @example
 * ```tsx
 * <ItemStockControl
 *   stock={item.stock}
 *   isStockFixed={item.isStockFixed}
 *   spec={`${item.quantity} ${item.unit}`}
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
  isStockFixed = false,
  spec,
  size = "md",
  className,
  disabled = false,
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

  // 固定库存模式：显示锁定状态
  if (isStockFixed) {
    return (
      <TooltipProvider>
        <div
          className={cn("flex items-center justify-center gap-1", className)}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
                <Lock className="size-3.5 text-primary" />
                <span className="text-sm font-medium">{stock}</span>
                {spec && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({spec})
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>固定库存模式（库存不随使用减少）</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

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
              disabled={disabled || isPending || optimisticStock <= 0}
            >
              <Minus className={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>减少库存</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-0.5">
          <span
            className={cn(
              "min-w-[24px] text-center text-sm font-medium transition-colors text-foreground"
            )}
          >
            {optimisticStock}
          </span>
          {spec && (
            <span className="text-xs text-muted-foreground">{spec}</span>
          )}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(buttonSize, "hover:bg-primary hover:text-white")}
              onClick={() => handleClick(1)}
              disabled={disabled || isPending}
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
