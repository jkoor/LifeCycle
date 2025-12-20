"use client"

/**
 * 客户端会话组件示例
 * 
 * 这些组件展示了如何在客户端组件中使用 lib/client-auth.ts 中的钩子
 */

import { useSession, useUser, useUserId, useRequireAuth } from "@/lib/client-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { signOut } from "next-auth/react"

/**
 * 示例 1: 简单的登录状态显示
 */
export function ClientSessionStatus() {
    const { session, status, isLoading, isAuthenticated } = useSession()

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>客户端会话状态</CardTitle>
                <CardDescription>实时会话信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">状态:</span>
                    <Badge variant={isAuthenticated ? "default" : "secondary"}>
                        {status}
                    </Badge>
                </div>
                {session?.user && (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">邮箱:</span>
                            <span className="text-sm">{session.user.email}</span>
                        </div>
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            >
                                登出
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

/**
 * 示例 2: 用户信息显示
 */
export function ClientUserInfo() {
    const user = useUser()

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>用户信息</CardTitle>
                    <CardDescription>未登录</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        请先登录以查看用户信息
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>用户信息</CardTitle>
                <CardDescription>当前登录用户</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">姓名:</span>
                    <span className="text-sm font-medium">{user.name || "未设置"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">邮箱:</span>
                    <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">ID:</span>
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                        {user.id}
                    </code>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * 示例 3: 受保护的组件 - 自动重定向
 */
export function ClientProtectedContent() {
    const router = useRouter()
    const user = useRequireAuth(() => {
        router.push("/auth/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
    })

    if (!user) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">重定向到登录页面...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>受保护的内容</CardTitle>
                <CardDescription>只有登录用户可见</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm">
                    欢迎, <strong>{user.name || user.email}</strong>!
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    此内容仅对已认证的用户可见。
                </p>
            </CardContent>
        </Card>
    )
}

/**
 * 示例 4: 用户 ID 显示
 */
export function ClientUserIdDisplay() {
    const userId = useUserId()
    const { isLoading } = useSession()

    if (isLoading) {
        return <Skeleton className="h-8 w-full" />
    }

    if (!userId) {
        return (
            <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">未登录</p>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">当前用户 ID</p>
            <code className="mt-1 block font-mono text-sm">{userId}</code>
        </div>
    )
}

/**
 * 示例 5: 条件导航按钮
 */
export function ClientAuthButton() {
    const { isAuthenticated, isLoading } = useSession()
    const router = useRouter()

    if (isLoading) {
        return <Skeleton className="h-10 w-24" />
    }

    if (isAuthenticated) {
        return (
            <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
                登出
            </Button>
        )
    }

    return (
        <Button onClick={() => router.push("/auth/login")}>
            登录
        </Button>
    )
}
