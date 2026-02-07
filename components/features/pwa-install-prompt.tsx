"use client"

import { useState, useEffect, useCallback } from "react"
import { IconDownload, IconX, IconDeviceMobile } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallBanner, setShowInstallBanner] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // 检查是否已经以 PWA 模式运行
        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as unknown as { standalone?: boolean }).standalone === true

        setIsStandalone(standalone)

        if (standalone) return

        // 检查是否为 iOS
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
        setIsIOS(isIOSDevice)

        // 检查是否已经dismiss过（24小时内不再显示）
        const dismissedAt = localStorage.getItem("pwa-install-dismissed")
        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt, 10)
            if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) return
        }

        // 监听 beforeinstallprompt 事件（仅限支持的浏览器）
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowInstallBanner(true)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        // iOS 设备显示手动安装提示
        if (isIOSDevice) {
            const timer = setTimeout(() => setShowInstallBanner(true), 3000)
            return () => {
                clearTimeout(timer)
                window.removeEventListener(
                    "beforeinstallprompt",
                    handleBeforeInstallPrompt
                )
            }
        }

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            )
        }
    }, [])

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
        localStorage.setItem("pwa-install-dismissed", Date.now().toString())
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
