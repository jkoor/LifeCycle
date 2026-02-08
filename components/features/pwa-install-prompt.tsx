"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { IconDownload, IconX, IconDeviceMobile } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const STORAGE_KEY = "pwa-install-dismissed"
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 天
const FIRST_SHOW_DELAY_MS = 60 * 1000 // 首次访问 60 秒后才显示

/** 检查是否在 dismiss 冷却期内 */
function isInCooldown(): boolean {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return false
        const data = JSON.parse(raw) as { time: number; count: number }
        // 被 dismiss 次数越多，冷却时间越长（指数退避，最长 30 天）
        const multiplier = Math.min(data.count, 5) // 1x, 2x, 3x, 4x, 5x
        const cooldown = DISMISS_COOLDOWN_MS * multiplier
        return Date.now() - data.time < cooldown
    } catch {
        return false
    }
}

/** 记录一次 dismiss */
function recordDismiss(): void {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        let count = 1
        if (raw) {
            const data = JSON.parse(raw) as { count: number }
            count = (data.count || 0) + 1
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ time: Date.now(), count }))
    } catch {
        // ignore
    }
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallBanner, setShowInstallBanner] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)
    const hasShownRef = useRef(false)

    useEffect(() => {
        // 检查是否已经以 PWA 模式运行
        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone === true

        setIsStandalone(standalone)
        if (standalone) return

        // 冷却期内不显示
        if (isInCooldown()) return

        // 本次会话已展示过则不重复弹出
        if (hasShownRef.current) return

        // 检查是否为 iOS
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
        setIsIOS(isIOSDevice)

        // 监听 beforeinstallprompt 事件（仅限支持的浏览器）
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            // 延迟显示，避免刚进页面就弹提示
            setTimeout(() => {
                if (!hasShownRef.current) {
                    hasShownRef.current = true
                    setShowInstallBanner(true)
                }
            }, FIRST_SHOW_DELAY_MS)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        // iOS 设备显示手动安装提示（同样延迟）
        let iosTimer: ReturnType<typeof setTimeout> | undefined
        if (isIOSDevice) {
            iosTimer = setTimeout(() => {
                if (!hasShownRef.current) {
                    hasShownRef.current = true
                    setShowInstallBanner(true)
                }
            }, FIRST_SHOW_DELAY_MS)
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
            if (iosTimer) clearTimeout(iosTimer)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleInstall = useCallback(async () => {
        if (!deferredPrompt) return
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
            setShowInstallBanner(false)
        }
        setDeferredPrompt(null)
    }, [deferredPrompt])

    const handleDismiss = useCallback(() => {
        setShowInstallBanner(false)
        recordDismiss()
    }, [])

    if (isStandalone || !showInstallBanner) return null

    return (
        <div
            className={cn(
                "fixed bottom-28 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:w-96",
                "animate-in slide-in-from-bottom-4 fade-in duration-300"
            )}
        >
            <div className="rounded-2xl border border-border/50 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <IconDeviceMobile className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                            安装 LifeCycle 应用
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {isIOS
                                ? "点击底部分享按钮，然后选择「添加到主屏幕」"
                                : "将应用安装到桌面，获得更好的使用体验"}
                        </p>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="关闭安装提示"
                    >
                        <IconX className="h-4 w-4" />
                    </button>
                </div>

                {!isIOS && deferredPrompt && (
                    <div className="mt-3 flex justify-end">
                        <Button size="sm" onClick={handleInstall}>
                            <IconDownload className="h-4 w-4" data-icon="inline-start" />
                            立即安装
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
