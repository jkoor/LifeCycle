"use client"

import { cn } from "@/lib/utils"
import {
  FieldGroup,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { ChevronRight } from "lucide-react"

interface SettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

/**
 * 设置区块组件
 *
 * 提供统一的设置区块布局：标题 + 描述 + 内容
 * 移动端采用 iOS 风格的分组列表样式
 */
export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <FieldGroup className={cn("gap-2 md:gap-6", className)}>
      <div className="px-1 md:px-0">
        <FieldLegend
          variant="label"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-base md:font-semibold md:normal-case md:tracking-normal md:text-foreground"
        >
          {title}
        </FieldLegend>
        {description && (
          <FieldDescription className="text-muted-foreground text-xs md:text-sm mt-0.5">
            {description}
          </FieldDescription>
        )}
      </div>
      <div className="space-y-0 md:space-y-6">{children}</div>
    </FieldGroup>
  )
}

interface SettingsCardProps {
  children: React.ReactNode
  className?: string
}

/**
 * 设置卡片容器
 *
 * 移动端：圆角卡片，无内边距（由子项控制）
 * 桌面端：带边框和内边距的卡片
 */
export function SettingsCard({ children, className }: SettingsCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-card",
        // 移动端样式
        "shadow-sm",
        // 桌面端样式
        "md:border md:p-6 md:shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}

interface SettingsRowProps {
  label: string
  description?: string
  children?: React.ReactNode
  className?: string
  onClick?: () => void
  showArrow?: boolean
}

/**
 * 设置行组件
 *
 * iOS 风格的列表项：
 * - 左侧：标签 + 描述
 * - 右侧：控件或箭头
 * - 分隔线使用 inset 样式
 */
export function SettingsRow({
  label,
  description,
  children,
  className,
  onClick,
  showArrow = false,
}: SettingsRowProps) {
  const Component = onClick ? "button" : "div"

  return (
    <Component
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 md:px-2 md:py-3",
        "transition-colors",
        onClick && "active:bg-muted/50 cursor-pointer",
        className,
      )}
    >
      <div className="flex-1 min-w-0 text-left">
        <div className="text-sm font-medium leading-tight">{label}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {showArrow && (
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        )}
      </div>
    </Component>
  )
}

/**
 * 设置分隔线
 *
 * iOS 风格的 inset 分隔线
 */
export function SettingsDivider() {
  return (
    <div className="px-4 md:px-0">
      <Separator className="bg-border/50" />
    </div>
  )
}

interface SettingsGroupProps {
  children: React.ReactNode
  className?: string
}

/**
 * 设置组
 *
 * 用于包装多个 SettingsRow，自动添加分隔线
 */
export function SettingsGroup({ children, className }: SettingsGroupProps) {
  return (
    <div className={cn("divide-y divide-border/50", className)}>{children}</div>
  )
}
