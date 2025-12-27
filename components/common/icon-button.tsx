"use client"

import { forwardRef, ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2, LucideIcon } from "lucide-react"

/**
 * 图标按钮尺寸配置
 */
const sizeClasses = {
  sm: { button: "h-6 w-6", icon: "size-3" },
  md: { button: "h-7 w-7", icon: "size-3.5" },
  lg: { button: "h-8 w-8", icon: "size-4" },
} as const

type IconButtonSize = keyof typeof sizeClasses

/**
 * 图标按钮属性
 */
interface IconButtonProps extends Omit<ComponentProps<typeof Button>, "size"> {
  icon: LucideIcon
  size?: IconButtonSize
  tooltip?: string
  isLoading?: boolean
  loadingIcon?: LucideIcon
}

/**
 * 统一风格的图标按钮
 *
 * 支持 Tooltip 和 loading 状态。
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={Pencil}
 *   tooltip="编辑"
 *   onClick={handleEdit}
 * />
 *
 * <IconButton
 *   icon={Trash2}
 *   tooltip="删除"
 *   isLoading={isDeleting}
 *   onClick={handleDelete}
 *   className="hover:bg-destructive hover:text-destructive-foreground"
 * />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      size = "md",
      tooltip,
      isLoading = false,
      loadingIcon: LoadingIcon = Loader2,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizes = sizeClasses[size]
    const isDisabled = disabled || isLoading

    const button = (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        disabled={isDisabled}
        className={cn(
          sizes.button,
          "hover:bg-primary hover:text-white",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <LoadingIcon className={cn(sizes.icon, "animate-spin")} />
        ) : (
          <Icon className={sizes.icon} />
        )}
      </Button>
    )

    if (!tooltip) {
      return button
    }

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
)

IconButton.displayName = "IconButton"
