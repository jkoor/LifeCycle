"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@prisma/client"

interface ItemTagsProps {
  /** 标签列表 */
  tags?: Tag[] | null
  /** 最大显示数量 */
  maxDisplay?: number
  /** 尺寸: sm(text-[10px]), md(text-xs) */
  size?: "sm" | "md"
  /** 额外的 className */
  className?: string
}

const sizeClasses = {
  sm: "px-1.5 py-0 text-[10px]",
  md: "px-2 py-0.5 text-xs",
}

/**
 * 标签列表组件
 *
 * 展示物品标签，超过指定数量后显示 `+N`：
 *
 * @example
 * ```tsx
 * <ItemTags tags={item.tags} maxDisplay={2} />
 * ```
 */
export function ItemTags({
  tags,
  maxDisplay = 2,
  size = "sm",
  className,
}: ItemTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  const visibleTags = tags.slice(0, maxDisplay)
  const remainingCount = tags.length - maxDisplay

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visibleTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className={cn(sizeClasses[size], "font-normal")}
        >
          {tag.name}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge
          variant="secondary"
          className={cn(sizeClasses[size], "font-normal")}
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  )
}
