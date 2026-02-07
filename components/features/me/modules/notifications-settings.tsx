"use client"

import { useState } from "react"
import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsGroup,
} from "@/components/modules/settings/ui"
import { Switch } from "@/components/ui/switch"
import { ChevronRight, Bell, Mail, Smartphone, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 通知设置模块
 *
 * iOS 风格开关列表
 */
export function NotificationsSettings() {
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [expiryAlert, setExpiryAlert] = useState(true)
  const [stockAlert, setStockAlert] = useState(true)
  const [systemUpdate, setSystemUpdate] = useState(false)

  return (
    <div className="space-y-6">
      {/* 通知渠道 */}
      <SettingsSection title="通知渠道" description="选择接收通知的方式">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow label="推送通知" description="在设备上接收即时通知">
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </SettingsRow>

            <SettingsRow label="邮件通知" description="通过邮件接收重要更新">
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 通知频率 */}
      <SettingsSection title="通知频率">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsRow label="摘要邮件" description="定期汇总通知并发送邮件">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">每日</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      {/* 通知类型 */}
      <SettingsSection title="通知类型" description="选择要接收的通知类型">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow
              label="物品到期提醒"
              description="当物品即将到期时通知您"
            >
              <Switch checked={expiryAlert} onCheckedChange={setExpiryAlert} />
            </SettingsRow>

            <SettingsRow
              label="库存不足提醒"
              description="当物品库存低于阈值时通知"
            >
              <Switch checked={stockAlert} onCheckedChange={setStockAlert} />
            </SettingsRow>

            <SettingsRow
              label="系统更新"
              description="接收新功能和重要更新通知"
            >
              <Switch
                checked={systemUpdate}
                onCheckedChange={setSystemUpdate}
              />
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 提醒时间 */}
      <SettingsSection title="提醒时间">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow
              label="物品到期提前提醒"
              description="提前多少天开始提醒"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">7 天</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </SettingsRow>

            <SettingsRow label="每日提醒时间" description="发送每日摘要的时间">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">09:00</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      {/* 免打扰 */}
      <SettingsSection title="免打扰">
        <SettingsCard className="!p-0 md:!p-0">
          <SettingsGroup>
            <SettingsRow
              label="免打扰模式"
              description="在指定时间段内暂停通知"
            >
              <Switch />
            </SettingsRow>

            <SettingsRow
              label="免打扰时段"
              description="22:00 - 08:00"
              className="opacity-50"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </SettingsRow>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
