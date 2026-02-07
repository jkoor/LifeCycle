"use client"

import { IconWifiOff, IconRefresh } from "@tabler/icons-react"

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="mx-auto max-w-md text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <IconWifiOff className="h-10 w-10 text-muted-foreground" />
                </div>

                <h1 className="mb-2 text-2xl font-bold text-foreground">
                    您当前处于离线状态
                </h1>

                <p className="mb-8 text-muted-foreground">
                    无法连接到网络，请检查您的网络连接后重试。
                    <br />
                    部分已缓存的内容仍可正常使用。
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <IconRefresh className="h-4 w-4" />
                    重新连接
                </button>

                <div className="mt-12 text-xs text-muted-foreground/60">
                    LifeCycle - 智能生活管理平台
                </div>
            </div>
        </div>
    )
}
