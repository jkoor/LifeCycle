"use client"

import { User } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsGroup,
} from "@/components/modules/settings/ui"
import { Camera, ChevronRight, KeyRound, Shield, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccountSettingsProps {
  user: User
}

/**
 * 账户设置模块
 *
 * iOS 风格设计：
 * - 顶部个人资料卡片
 * - 分组列表样式
 */
export function AccountSettings({ user }: AccountSettingsProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <div className="space-y-6">
      {/* 个人资料卡片 - iOS 风格 */}
      <SettingsCard className="!p-0 md:!p-0">
        <div className="flex items-center gap-4 p-4">
          {/* 头像 */}
          <button className="group relative shrink-0">
            <Avatar className="h-16 w-16 border-2 border-border transition-all group-active:scale-95">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </button>

          {/* 用户信息 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">
              {user.name || "未命名用户"}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            <button className="mt-1 text-xs text-primary font-medium hover:underline">
              更换头像
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* 个人信息 */}
      <SettingsSection title="个人信息">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow label="显示名称" description="您在应用中显示的名称">
              <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                {user.name || "未设置"}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            </SettingsRow>

            <SettingsRow label="邮箱地址" description="用于登录和接收通知">
              <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                {user.email || "未设置"}
              </span>
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 安全设置 */}
      <SettingsSection title="安全">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow
              label="修改密码"
              description="建议定期更换密码"
              showArrow
              onClick={() => {}}
            >
              <KeyRound className="h-4 w-4 text-muted-foreground" />
            </SettingsRow>

            <SettingsRow
              label="两步验证"
              description="增强账户安全性"
              showArrow
              onClick={() => {}}
            >
              <Shield className="h-4 w-4 text-muted-foreground" />
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 危险区域 */}
      <SettingsSection title="危险区域">
        <SettingsCard className="!p-0 md:!p-0 border-destructive/30">
          <SettingsRow
            label="删除账户"
            description="永久删除您的账户和所有数据"
            onClick={() => {}}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <ChevronRight className="h-4 w-4 text-destructive/50" />
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
