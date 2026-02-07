"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, Check } from "lucide-react"
import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsGroup,
} from "@/components/modules/settings/ui"
import { cn } from "@/lib/utils"

/**
 * 外观设置模块
 *
 * iOS 风格：大图标选择卡片
 */
export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    {
      value: "light",
      label: "浅色",
      icon: Sun,
    },
    {
      value: "dark",
      label: "深色",
      icon: Moon,
    },
    {
      value: "system",
      label: "自动",
      icon: Monitor,
    },
  ] as const

  const accentColors = [
    { value: "blue", color: "#3b82f6", label: "蓝色" },
    { value: "green", color: "#10b981", label: "绿色" },
    { value: "purple", color: "#8b5cf6", label: "紫色" },
    { value: "orange", color: "#f59e0b", label: "橙色" },
    { value: "pink", color: "#ec4899", label: "粉色" },
  ]

  return (
    <div className="space-y-6">
      {/* 主题设置 */}
      <SettingsSection title="主题">
        <div className="grid grid-cols-3 gap-3 px-1 md:px-0">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isActive = theme === option.value

            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all",
                  "border-2 bg-card",
                  "active:scale-[0.98]",
                  isActive
                    ? "border-primary shadow-sm"
                    : "border-transparent hover:border-border",
                )}
              >
                {/* 选中指示器 */}
                {isActive && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                {/* 主题预览 */}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    option.value === "light" && "bg-amber-100 text-amber-600",
                    option.value === "dark" && "bg-slate-800 text-slate-200",
                    option.value === "system" &&
                      "bg-gradient-to-br from-amber-100 to-slate-800 text-foreground",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <span className="text-sm font-medium">{option.label}</span>
              </button>
            )
          })}
        </div>
      </SettingsSection>

      {/* 配色方案 */}
      <SettingsSection title="主题色" description="选择您喜欢的强调色">
        <SettingsCard className="!p-0 md:!p-0">
          <div className="flex items-center justify-between gap-2 p-4">
            {accentColors.map((color) => (
              <button
                key={color.value}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full transition-transform",
                  "hover:scale-110 active:scale-95",
                  "ring-2 ring-offset-2 ring-offset-background",
                  color.value === "blue" ? "ring-primary" : "ring-transparent",
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              >
                {color.value === "blue" && (
                  <Check className="h-4 w-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </SettingsCard>
        <p className="px-1 text-xs text-muted-foreground md:px-0">
          更多配色方案即将推出
        </p>
      </SettingsSection>

      {/* 显示选项 */}
      <SettingsSection title="显示">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow label="紧凑模式" description="减少界面元素间距">
              <div className="h-6 w-10 rounded-full bg-muted relative cursor-pointer">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-muted-foreground/30 transition-all" />
              </div>
            </SettingsRow>

            <SettingsRow label="动画效果" description="启用界面过渡动画">
              <div className="h-6 w-10 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary-foreground transition-all" />
              </div>
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
