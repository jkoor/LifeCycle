import { User } from "better-auth"

/**
 * 设置模块标识符
 */
export type SettingsTab = "account" | "appearance" | "general" | "notifications"

/**
 * 设置模块配置
 */
export interface SettingsTabConfig {
  id: SettingsTab
  label: string
  icon: React.ReactNode
  description?: string
}

/**
 * 设置页面通用 Props
 */
export interface SettingsPageProps {
  user: User
}

/**
 * 通知设置类型
 */
export interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  frequency: "immediate" | "daily" | "weekly"
}

/**
 * 外观设置类型
 */
export interface AppearanceSettings {
  theme: "light" | "dark" | "system"
  accentColor?: string
}

/**
 * 通用设置类型
 */
export interface GeneralSettings {
  language: "zh-CN" | "en-US"
  timezone: string
  dateFormat: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY"
}
