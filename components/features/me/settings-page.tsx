"use client"

import { User } from "next-auth"
import {
  User as UserIcon,
  Palette,
  Settings,
  Bell,
  ChevronRight,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountSettings } from "./modules/account-settings"
import { AppearanceSettings } from "./modules/appearance-settings"
import { GeneralSettings } from "./modules/general-settings"
import { NotificationsSettings } from "./modules/notifications-settings"
import type { SettingsTabConfig } from "@/components/modules/settings/types"
import { cn } from "@/lib/utils"

interface SettingsPageProps {
  user: User
}

const settingsTabs: SettingsTabConfig[] = [
  {
    id: "account",
    label: "账户",
    icon: <UserIcon className="h-4 w-4" />,
    description: "管理您的账户信息",
  },
  {
    id: "appearance",
    label: "外观",
    icon: <Palette className="h-4 w-4" />,
    description: "自定义应用外观",
  },
  {
    id: "general",
    label: "通用",
    icon: <Settings className="h-4 w-4" />,
    description: "应用常规设置",
  },
  {
    id: "notifications",
    label: "通知",
    icon: <Bell className="h-4 w-4" />,
    description: "管理通知偏好",
  },
]

/**
 * 设置页面主容器
 *
 * 响应式布局：
 * - 移动端：分段控制器风格 Tabs + 卡片式分组列表
 * - 桌面端：垂直侧边栏 Tabs
 */
export function SettingsPage({ user }: SettingsPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30 md:bg-transparent">
      {/* 页面标题 - 移动端更紧凑 */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-4 md:py-6 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl lg:text-3xl">
            设置
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground md:mt-1 md:text-sm">
            管理您的账户信息和偏好设置
          </p>
        </div>
      </header>

      {/* 设置内容 */}
      <Tabs
        defaultValue="account"
        orientation="vertical"
        className="flex flex-1 flex-col md:flex-row"
      >
        {/* 移动端 Tabs 导航 - 分段控制器风格 */}
        <div className="sticky top-[73px] z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 md:hidden">
          <TabsList className="grid h-12 w-full grid-cols-4 gap-1 rounded-xl bg-muted p-1">
            {settingsTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "rounded-lg px-1 py-1 text-xs font-medium transition-all",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  "data-[state=active]:text-foreground",
                  "data-[state=inactive]:text-muted-foreground",
                )}
              >
                <div className="flex flex-col items-center justify-center gap-0.5 w-full text-center">
                  {tab.icon}
                  <span className="text-[10px] leading-tight">{tab.label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* 桌面端侧边栏导航 */}
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <nav className="sticky top-0 p-4">
            <TabsList
              variant="line"
              className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0"
            >
              {settingsTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="justify-start gap-3 rounded-lg border-none px-3 py-2.5 text-left data-[state=active]:bg-muted"
                >
                  {tab.icon}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{tab.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {tab.description}
                    </span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </nav>
        </aside>

        {/* 设置内容区 */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-2xl px-4 py-4 md:py-6 sm:px-6 lg:px-8">
            <TabsContent
              value="account"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <AccountSettings user={user} />
            </TabsContent>

            <TabsContent
              value="appearance"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <AppearanceSettings />
            </TabsContent>

            <TabsContent
              value="general"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <GeneralSettings />
            </TabsContent>

            <TabsContent
              value="notifications"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <NotificationsSettings />
            </TabsContent>
          </div>
        </main>
      </Tabs>
    </div>
  )
}
