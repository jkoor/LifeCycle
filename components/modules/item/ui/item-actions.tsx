"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Archive,
  Bell,
  BellOff,
  Loader2,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { RefreshCWIcon } from "@/components/ui/refresh-cw"
import { ItemStatusState } from "../types"

/**
 * 操作按钮组件属性
 */
export interface ItemActionsProps {
  /** 显示模式: icons(图标排列) | dropdown(下拉菜单) */
  variant?: "icons" | "dropdown"
  /** 尺寸 */
  size?: "sm" | "md"
  /** 额外的 className */
  className?: string

  // 状态
  /** 是否已归档 */
  isArchived?: boolean
  /** 是否已置顶 */
  isPinned?: boolean
  /** 通知是否开启 (notifyAdvanceDays > 0) */
  isNotificationEnabled?: boolean
  /** 通知提前天数 */
  notifyAdvanceDays?: number
  /** 库存数量 (用于更换按钮禁用状态) */
  stock?: number
  /** 物品状态 (用于更换按钮样式) */
  statusState?: ItemStatusState

  // Loading 状态
  isReplacing?: boolean
  isPinning?: boolean
  isArchiving?: boolean
  isUpdatingNotification?: boolean
  isDeleting?: boolean

  // 事件回调
  onEdit?: () => void
  onReplace?: () => void
  onTogglePin?: () => void
  onToggleArchive?: () => void
  onToggleNotification?: (enabled: boolean) => void
  onDelete?: () => void

  /** 编辑按钮的自定义渲染 (用于包装 Modal) */
  editButton?: ReactNode
}

const sizeClasses = {
  sm: { button: "h-6 w-6", icon: "size-3" },
  md: { button: "h-7 w-7", icon: "size-3.5" },
}

/**
 * 操作按钮组组件 (图标模式)
 */
function IconButtons({
  size = "md",
  className,
  isArchived,
  isPinned,
  isNotificationEnabled,
  notifyAdvanceDays,
  statusState,
  stock = 0,
  isReplacing,
  isPinning,
  isArchiving,
  isUpdatingNotification,
  isDeleting,
  onReplace,
  onTogglePin,
  onToggleArchive,
  onToggleNotification,
  onDelete,
  editButton,
}: ItemActionsProps) {
  const { button: buttonSize, icon: iconSize } = sizeClasses[size ?? "md"]
  const isExpired = statusState?.key === "expired"

  return (
    <TooltipProvider>
      <div
        className={cn("flex items-center justify-center gap-0.5", className)}
      >
        {/* 编辑按钮 (外部传入包裹 Modal) */}
        {editButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">{editButton}</div>
            </TooltipTrigger>
            <TooltipContent>编辑</TooltipContent>
          </Tooltip>
        )}

        {/* 更换按钮 */}
        {onReplace && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  buttonSize,
                  isExpired
                    ? "text-destructive hover:bg-destructive hover:text-white"
                    : "hover:bg-primary hover:text-white",
                  isReplacing && "opacity-50"
                )}
                onClick={onReplace}
                disabled={isReplacing || stock < 1}
              >
                {isReplacing ? (
                  <Loader2 className={cn(iconSize, "animate-spin")} />
                ) : (
                  <RefreshCWIcon size={14} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>更换 (库存-1, 重置日期)</TooltipContent>
          </Tooltip>
        )}

        {/* 置顶按钮 */}
        {onTogglePin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  buttonSize,
                  "transition-colors",
                  isPinned
                    ? "text-amber-500 hover:bg-amber-500 hover:text-white"
                    : "text-muted-foreground hover:bg-amber-500 hover:text-white",
                  isPinning && "opacity-50"
                )}
                onClick={onTogglePin}
                disabled={isPinning}
              >
                {isPinning ? (
                  <Loader2 className={cn(iconSize, "animate-spin")} />
                ) : isPinned ? (
                  <Pin className={iconSize} />
                ) : (
                  <PinOff className={iconSize} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPinned ? "取消置顶" : "置顶"}</TooltipContent>
          </Tooltip>
        )}

        {/* 通知按钮 */}
        {onToggleNotification && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  buttonSize,
                  "transition-colors",
                  isNotificationEnabled
                    ? "text-primary hover:bg-primary hover:text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isUpdatingNotification && "opacity-50"
                )}
                onClick={() => onToggleNotification(!isNotificationEnabled)}
                disabled={isUpdatingNotification}
              >
                {isUpdatingNotification ? (
                  <Loader2 className={cn(iconSize, "animate-spin")} />
                ) : isNotificationEnabled ? (
                  <Bell className={iconSize} />
                ) : (
                  <BellOff className={iconSize} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isNotificationEnabled
                ? `提前 ${notifyAdvanceDays} 天提醒 (点击关闭)`
                : "提醒已关闭 (点击开启)"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* 归档按钮 */}
        {onToggleArchive && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  buttonSize,
                  "hover:bg-indigo-500 hover:text-white",
                  isArchived && "text-indigo-500",
                  isArchiving && "opacity-50"
                )}
                onClick={onToggleArchive}
                disabled={isArchiving}
              >
                {isArchiving ? (
                  <Loader2 className={cn(iconSize, "animate-spin")} />
                ) : (
                  <Archive className={iconSize} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isArchived ? "取消归档" : "归档"}</TooltipContent>
          </Tooltip>
        )}

        {/* 删除按钮 */}
        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  buttonSize,
                  "text-destructive hover:bg-destructive hover:text-white"
                )}
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className={cn(iconSize, "animate-spin")} />
                ) : (
                  <Trash2 className={iconSize} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>删除</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * 操作按钮组组件 (下拉菜单模式)
 */
function DropdownButtons({
  size = "md",
  className,
  isArchived,
  isPinned,
  isNotificationEnabled,
  isReplacing,
  isPinning,
  isArchiving,
  isUpdatingNotification,
  isDeleting,
  stock = 0,
  onEdit,
  onReplace,
  onTogglePin,
  onToggleArchive,
  onToggleNotification,
  onDelete,
}: ItemActionsProps) {
  const { button: buttonSize, icon: iconSize } = sizeClasses[size ?? "md"]
  const isAnyLoading =
    isReplacing ||
    isPinning ||
    isArchiving ||
    isUpdatingNotification ||
    isDeleting

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(buttonSize, className)}
          disabled={isAnyLoading}
        >
          {isAnyLoading ? (
            <Loader2 className={cn(iconSize, "animate-spin")} />
          ) : (
            <MoreHorizontal className={iconSize} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
        )}
        {onReplace && (
          <DropdownMenuItem onClick={onReplace} disabled={stock < 1}>
            <RefreshCw className="mr-2 h-4 w-4" />
            更换
          </DropdownMenuItem>
        )}
        {onTogglePin && (
          <DropdownMenuItem onClick={onTogglePin}>
            {isPinned ? (
              <>
                <PinOff className="mr-2 h-4 w-4" />
                取消置顶
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" />
                置顶
              </>
            )}
          </DropdownMenuItem>
        )}
        {onToggleNotification && (
          <DropdownMenuItem
            onClick={() => onToggleNotification(!isNotificationEnabled)}
          >
            {isNotificationEnabled ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                关闭提醒
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                开启提醒
              </>
            )}
          </DropdownMenuItem>
        )}
        {onToggleArchive && (
          <DropdownMenuItem onClick={onToggleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            {isArchived ? "取消归档" : "归档"}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * 物品操作按钮组组件
 *
 * 支持两种显示模式：
 * - `icons`: 图标按钮排列（适合桌面端列表）
 * - `dropdown`: 下拉菜单（适合移动端或紧凑布局）
 *
 * @example
 * ```tsx
 * const { isArchiving, handleToggleArchive, ... } = useItem(item)
 *
 * // 图标模式
 * <ItemActions
 *   variant="icons"
 *   isArchived={item.isArchived}
 *   isArchiving={isArchiving}
 *   onToggleArchive={handleToggleArchive}
 *   onDelete={() => setItemToDelete(item.id)}
 *   editButton={
 *     <AddItemModal item={item} categories={categories}>
 *       <Button variant="ghost" size="icon">
 *         <Pencil className="size-3.5" />
 *       </Button>
 *     </AddItemModal>
 *   }
 * />
 *
 * // 下拉菜单模式
 * <ItemActions
 *   variant="dropdown"
 *   onEdit={() => openModal(item)}
 *   onDelete={() => setItemToDelete(item.id)}
 * />
 * ```
 */
export function ItemActions(props: ItemActionsProps) {
  if (props.variant === "dropdown") {
    return <DropdownButtons {...props} />
  }
  return <IconButtons {...props} />
}
