/**
 * Session Management Component Examples
 * 
 * 这些组件展示了如何在服务端组件中使用 lib/auth.ts 中的辅助函数
 */

import {
    getServerSession,
    getCurrentUser,
    getCurrentUserId,
    isAuthenticated
} from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

/**
 * 示例 1: 显示简单的会话状态
 */
export async function SessionStatus() {
    const session = await getServerSession()
    const authenticated = await isAuthenticated()

    return (
        <Card>
            <CardHeader>
                <CardTitle>会话状态</CardTitle>
                <CardDescription>当前用户的登录状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">状态:</span>
                    <Badge variant={authenticated ? "default" : "secondary"}>
                        {authenticated ? "已登录" : "未登录"}
                    </Badge>
                </div>
                {session?.user && (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">邮箱:</span>
                            <span className="text-sm">{session.user.email}</span>
                        </div>
                        {session.user.name && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">姓名:</span>
                                <span className="text-sm">{session.user.name}</span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

/**
 * 示例 2: 显示完整的用户信息卡片
 */
export async function UserProfileCard() {
    const user = await getCurrentUser()

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>用户资料</CardTitle>
                    <CardDescription>请先登录以查看您的资料</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const initials = user.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
        : (user.email?.[0] || "U").toUpperCase()

    return (
        <Card>
            <CardHeader>
                <CardTitle>用户资料</CardTitle>
                <CardDescription>完整的数据库用户信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold">{user.name || "未设置姓名"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">用户 ID:</span>
                        <span className="font-mono text-xs">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">注册时间:</span>
                        <span>{format(new Date(user.createdAt), "yyyy-MM-dd", { locale: zhCN })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">最后更新:</span>
                        <span>{format(new Date(user.updatedAt), "yyyy-MM-dd", { locale: zhCN })}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * 示例 3: 条件渲染 - 仅登录用户可见
 */
export async function ProtectedContent() {
    const authenticated = await isAuthenticated()

    if (!authenticated) {
        return null // 或者返回登录提示
    }

    const userId = await getCurrentUserId()

    return (
        <Card>
            <CardHeader>
                <CardTitle>受保护的内容</CardTitle>
                <CardDescription>只有登录用户才能看到此内容</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm">
                    您的用户 ID: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{userId}</code>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    此内容仅对已认证的用户可见
                </p>
            </CardContent>
        </Card>
    )
}

/**
 * 示例 4: 欢迎消息 - 显示个性化问候
 */
export async function WelcomeMessage() {
    const user = await getCurrentUser()

    if (!user) {
        return (
            <div className="rounded-lg border bg-card p-6">
                <h2 className="text-2xl font-bold">欢迎访问</h2>
                <p className="mt-2 text-muted-foreground">
                    请登录以获取个性化体验
                </p>
            </div>
        )
    }

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好"

    return (
        <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-bold">
                {greeting}, {user.name || "用户"}!
            </h2>
            <p className="mt-2 text-muted-foreground">
                欢迎回来，{user.email}
            </p>
        </div>
    )
}
