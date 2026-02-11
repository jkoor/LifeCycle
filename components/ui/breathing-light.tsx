"use client"

import { cn } from "@/lib/utils"

/**
 * 呼吸灯变体类型，与 StatusBadgeVariant 保持一致
 */
export type BreathingLightVariant =
    | "destructive"
    | "warning"
    | "success"
    | "info"
    | "default"

/**
 * 呼吸灯尺寸
 */
export type BreathingLightSize = "sm" | "md" | "lg"

interface BreathingLightProps {
    /** 状态变体 */
    variant?: BreathingLightVariant
    /** 尺寸 */
    size?: BreathingLightSize
    /** 额外的 className */
    className?: string
}

/**
 * 变体颜色映射
 */
const variantColors: Record<BreathingLightVariant, { dot: string; glow: string }> = {
    destructive: {
        dot: "bg-red-500 dark:bg-red-400",
        glow: "bg-red-400/40 dark:bg-red-400/30",
    },
    warning: {
        dot: "bg-amber-500 dark:bg-amber-400",
        glow: "bg-amber-400/40 dark:bg-amber-400/30",
    },
    success: {
        dot: "bg-green-500 dark:bg-green-400",
        glow: "bg-green-400/40 dark:bg-green-400/30",
    },
    info: {
        dot: "bg-blue-500 dark:bg-blue-400",
        glow: "bg-blue-400/40 dark:bg-blue-400/30",
    },
    default: {
        dot: "bg-zinc-400 dark:bg-zinc-500",
        glow: "bg-zinc-400/40 dark:bg-zinc-500/30",
    },
}

/**
 * 尺寸映射
 */
const sizeClasses: Record<BreathingLightSize, { dot: string; glow: string }> = {
    sm: { dot: "size-1.5", glow: "size-3" },
    md: { dot: "size-2", glow: "size-4" },
    lg: { dot: "size-2.5", glow: "size-5" },
}

/**
 * 呼吸灯组件
 *
 * 通过柔和的呼吸动画展示状态信息。
 * 适用于需要简洁状态指示的场景（如卡片、列表项等）。
 *
 * @example
 * ```tsx
 * <BreathingLight variant="success" />
 * <BreathingLight variant="warning" size="lg" />
 * <BreathingLight variant="destructive" size="sm" />
 * ```
 */
export function BreathingLight({
    variant = "default",
    size = "md",
    className,
}: BreathingLightProps) {
    const colors = variantColors[variant]
    const sizes = sizeClasses[size]

    return (
        <span
            className={cn("relative inline-flex items-center justify-center", sizes.glow, className)}
            role="status"
            aria-label={variant}
        >
            {/* 呼吸光晕 */}
            <span
                className={cn(
                    "absolute inset-0 rounded-full animate-breathing-light",
                    colors.glow,
                )}
            />
            {/* 核心圆点 */}
            <span
                className={cn(
                    "relative rounded-full",
                    sizes.dot,
                    colors.dot,
                )}
            />
        </span>
    )
}
