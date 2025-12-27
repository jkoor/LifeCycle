"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ItemAvatarProps {
  /** 图片 URL */
  src?: string | null
  /** 物品名称 (用于 Fallback 显示和 alt 文本) */
  name: string
  /** 尺寸: sm(32px), md(40px), lg(48px) */
  size?: "sm" | "md" | "lg"
  /** 额外的 className */
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
}

/**
 * 物品头像组件
 *
 * 统一处理物品图片的展示逻辑：
 * - 有图片时：显示图片，圆角裁剪
 * - 无图片时：显示名称前两字的大写缩写，带背景色
 *
 * @example
 * ```tsx
 * <ItemAvatar src={item.image} name={item.name} />
 * <ItemAvatar src={item.image} name={item.name} size="lg" />
 * ```
 */
export function ItemAvatar({
  src,
  name,
  size = "md",
  className,
}: ItemAvatarProps) {
  const hasImage = !!src

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        "rounded-md shrink-0",
        hasImage
          ? "bg-transparent after:hidden"
          : "bg-muted after:rounded-md border-0",
        className
      )}
    >
      <AvatarImage
        src={src || ""}
        alt={name}
        className="object-cover rounded-md"
      />
      <AvatarFallback className="rounded-md text-xs font-medium">
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
