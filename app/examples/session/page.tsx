/**
 * Session Management Examples Page
 * 
 * 展示所有会话管理功能的完整示例
 */

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
    SessionStatus,
    UserProfileCard,
    ProtectedContent,
    WelcomeMessage,
} from "@/components/examples/session-examples"
import {
    ClientSessionStatus,
    ClientUserInfo,
    ClientProtectedContent,
    ClientUserIdDisplay,
    ClientAuthButton,
} from "@/components/examples/client-session-examples"

export default function SessionExamplesPage() {
    return (
        <div className="container mx-auto max-w-6xl space-y-8 py-8">
            {/* 页面标题 */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Session Management Examples</h1>
                <p className="text-muted-foreground">
                    完整的会话管理示例，展示服务端和客户端的使用方式
                </p>
            </div>

            <Separator />

            {/* 服务端组件示例 */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">服务端组件示例</h2>
                    <p className="text-sm text-muted-foreground">
                        使用 lib/auth.ts 中的辅助函数，在服务端组件中访问会话
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* 欢迎消息 - 全宽 */}
                    <div className="md:col-span-2">
                        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                            <WelcomeMessage />
                        </Suspense>
                    </div>

                    {/* 会话状态 */}
                    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                        <SessionStatus />
                    </Suspense>

                    {/* 用户资料卡片 */}
                    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                        <UserProfileCard />
                    </Suspense>

                    {/* 受保护的内容 */}
                    <div className="md:col-span-2">
                        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                            <ProtectedContent />
                        </Suspense>
                    </div>
                </div>
            </div>

            <Separator />

            {/* 客户端组件示例 */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">客户端组件示例</h2>
                    <p className="text-sm text-muted-foreground">
                        使用 lib/client-auth.ts 中的钩子，在客户端组件中访问会话
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* 客户端会话状态 */}
                    <ClientSessionStatus />

                    {/* 客户端用户信息 */}
                    <ClientUserInfo />

                    {/* 用户 ID 显示 */}
                    <ClientUserIdDisplay />

                    {/* 认证按钮 */}
                    <div className="flex items-center justify-center rounded-lg border bg-card p-6">
                        <ClientAuthButton />
                    </div>

                    {/* 受保护的客户端内容 */}
                    <div className="md:col-span-2">
                        <ClientProtectedContent />
                    </div>
                </div>
            </div>

            <Separator />

            {/* API 示例说明 */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">API 路由示例</h2>
                    <p className="text-sm text-muted-foreground">
                        在 API 路由中使用会话验证
                    </p>
                </div>

                <div className="rounded-lg border bg-muted/50 p-6">
                    <h3 className="mb-4 font-semibold">可用的 API 端点:</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                            <code className="rounded bg-background px-2 py-1 font-mono text-xs">
                                GET
                            </code>
                            <div className="flex-1">
                                <code className="text-xs">/api/examples/session</code>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    获取当前用户会话信息
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <code className="rounded bg-background px-2 py-1 font-mono text-xs">
                                POST
                            </code>
                            <div className="flex-1">
                                <code className="text-xs">/api/examples/session</code>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    获取完整的用户数据（从数据库）
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <code className="rounded bg-background px-2 py-1 font-mono text-xs">
                                PUT
                            </code>
                            <div className="flex-1">
                                <code className="text-xs">/api/examples/session</code>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    验证资源所有权 (需要 JSON body: {`{ "resourceUserId": "..." }`})
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* 使用说明 */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">使用指南</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="mb-2 font-semibold">服务端组件</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• 使用 <code className="text-xs">getServerSession()</code></li>
                            <li>• 使用 <code className="text-xs">getCurrentUser()</code></li>
                            <li>• 使用 <code className="text-xs">isAuthenticated()</code></li>
                            <li>• 无需 "use client" 指令</li>
                        </ul>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="mb-2 font-semibold">客户端组件</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• 使用 <code className="text-xs">useSession()</code> hook</li>
                            <li>• 使用 <code className="text-xs">useUser()</code> hook</li>
                            <li>• 使用 <code className="text-xs">useRequireAuth()</code> hook</li>
                            <li>• 需要 "use client" 指令</li>
                        </ul>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="mb-2 font-semibold">API 路由</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• 使用 <code className="text-xs">requireAuth()</code></li>
                            <li>• 使用 <code className="text-xs">requireUser()</code></li>
                            <li>• 使用 <code className="text-xs">verifyResourceOwnership()</code></li>
                            <li>• 处理未授权错误 (401/403)</li>
                        </ul>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="mb-2 font-semibold">最佳实践</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• 服务端优先（性能更好）</li>
                            <li>• 使用 Suspense 处理加载状态</li>
                            <li>• API 路由始终验证会话</li>
                            <li>• 敏感操作验证资源所有权</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
