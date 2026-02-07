"use client"

import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsGroup,
} from "@/components/modules/settings/ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronRight, Globe, Clock, Calendar } from "lucide-react"

/**
 * 通用设置模块
 *
 * iOS 风格分组列表
 */
export function GeneralSettings() {
  return (
    <div className="space-y-6">
      {/* 语言和区域 */}
      <SettingsSection title="语言和区域">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow label="显示语言" description="应用界面的显示语言">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">简体中文</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </SettingsRow>

            <SettingsRow label="时区" description="用于显示日期和时间">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                  UTC+8
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 日期和时间 */}
      <SettingsSection title="日期和时间">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow label="日期格式">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  2026-02-07
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </SettingsRow>

            <SettingsRow label="时间格式">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">24 小时制</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </SettingsRow>

            <SettingsRow label="每周开始于">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">周一</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 数据管理 */}
      <SettingsSection title="数据">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow
              label="导出数据"
              description="导出您的所有数据"
              showArrow
              onClick={() => {}}
            >
              <span className="text-xs text-muted-foreground">JSON</span>
            </SettingsRow>

            <SettingsRow
              label="导入数据"
              description="从备份文件恢复"
              showArrow
              onClick={() => {}}
            />

            <SettingsRow
              label="清除缓存"
              description="释放存储空间"
              showArrow
              onClick={() => {}}
            >
              <span className="text-xs text-muted-foreground">12.5 MB</span>
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 关于 */}
      <SettingsSection title="关于">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow label="版本">
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </SettingsRow>

            <SettingsRow label="使用条款" showArrow onClick={() => {}} />

            <SettingsRow label="隐私政策" showArrow onClick={() => {}} />

            <SettingsRow label="开源许可" showArrow onClick={() => {}} />
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
