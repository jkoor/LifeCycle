"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { IconWifiOff } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

/**
 * 离线状态指示器
 * 当用户离线时在页面顶部显示提示条
 */
export function OfflineIndicator() {
    const isOnline = useOnlineStatus()

    if (isOnline) return null

    return (
        <div
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-destructive-foreground",
                "animate-in slide-in-from-top duration-300"
            )}
        >
            <IconWifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
                您当前处于离线状态，部分功能可能不可用
            </span>
        </div>
    )
}
