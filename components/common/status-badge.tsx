"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"

/**
 * 状态徽章变体类型
 */
export type StatusBadgeVariant =
  | "destructive"
  | "warning"
  | "success"
  | "info"
  | "default"

/**
 * 状态徽章属性
 */
interface StatusBadgeProps {
  variant?: StatusBadgeVariant
  icon?: LucideIcon
  label: string
  className?: string
}

/**
 * 变体样式映射
 */
const variantStyles: Record<StatusBadgeVariant, string> = {
  destructive: "text-red-600 bg-red-100 hover:bg-red-200 border-red-200",
  warning: "text-amber-600 bg-amber-100 hover:bg-amber-200 border-amber-200",
  success: "text-green-600 bg-green-100 hover:bg-green-200 border-green-200",
  info: "text-blue-600 bg-blue-100 hover:bg-blue-200 border-blue-200",
  default: "text-muted-foreground bg-muted hover:bg-muted/80",
}

/**
 * 通用状态徽章组件
 *
 * 纯 UI 组件，不包含业务逻辑。
 * 通过 variant、icon、label 控制显示。
 *
 * @example
 * ```tsx
 * <StatusBadge variant="warning" icon={Clock} label="7天后过期" />
 * <StatusBadge variant="destructive" icon={AlertTriangle} label="已过期" />
 * <StatusBadge variant="success" icon={CheckCircle} label="正常" />
 * ```
 */
export function StatusBadge({
  variant = "default",
  icon: Icon,
  label,
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1", variantStyles[variant], className)}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  )
}
