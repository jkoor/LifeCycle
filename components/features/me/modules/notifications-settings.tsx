"use client"

import { useState, useEffect, useCallback } from "react"
import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsGroup,
} from "@/components/modules/settings/ui"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import {
  Webhook,
  Plus,
  Pencil,
  Trash2,
  Send,
  Loader2,
  Info,
  X,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  getWebhookConfigs,
  createWebhookConfig,
  updateWebhookConfig,
  deleteWebhookConfig,
  testWebhookConfig,
} from "@/app/actions/webhook"

interface WebhookConfig {
  id: string
  name: string
  url: string
  enabled: boolean
  titleTemplate: string
  contentTemplate: string
  titleKey: string
  contentKey: string
  createdAt: Date
  updatedAt: Date
}

const DEFAULT_TITLE_TEMPLATE = "【物品到期提醒】"
const DEFAULT_CONTENT_TEMPLATE =
  "您的物品 {{itemName}} 将于 {{expiryDate}} 到期（剩余 {{daysLeft}} 天），请及时处理。"

const TEMPLATE_VARIABLES = [
  { key: "{{itemName}}", label: "物品名称" },
  { key: "{{expiryDate}}", label: "到期日期" },
  { key: "{{daysLeft}}", label: "剩余天数" },
  { key: "{{categoryName}}", label: "分类名称" },
]

/**
 * 通知设置模块
 *
 * Webhook 通知配置，支持自定义标题和内容模板
 */
export function NotificationsSettings() {
  const [configs, setConfigs] = useState<WebhookConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    titleTemplate: DEFAULT_TITLE_TEMPLATE,
    contentTemplate: DEFAULT_CONTENT_TEMPLATE,
    titleKey: "title",
    contentKey: "content",
  })

  const loadConfigs = useCallback(async () => {
    setLoading(true)
    const result = await getWebhookConfigs()
    if (result.data) {
      setConfigs(result.data as WebhookConfig[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadConfigs()
  }, [loadConfigs])

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      titleTemplate: DEFAULT_TITLE_TEMPLATE,
      contentTemplate: DEFAULT_CONTENT_TEMPLATE,
      titleKey: "title",
      contentKey: "content",
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (config: WebhookConfig) => {
    setFormData({
      name: config.name,
      url: config.url,
      titleTemplate: config.titleTemplate,
      contentTemplate: config.contentTemplate,
      titleKey: config.titleKey,
      contentKey: config.contentKey,
    })
    setEditingId(config.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("请输入配置名称")
      return
    }
    if (!formData.url.trim()) {
      toast.error("请输入 Webhook URL")
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const result = await updateWebhookConfig({
          id: editingId,
          ...formData,
        })
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success("Webhook 配置已更新")
      } else {
        const result = await createWebhookConfig({
          ...formData,
          enabled: true,
        })
        if (result.error) {
          toast.error(result.error)
          return
        }
        toast.success("Webhook 配置已创建")
      }
      resetForm()
      await loadConfigs()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await deleteWebhookConfig(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Webhook 配置已删除")
      await loadConfigs()
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    const result = await updateWebhookConfig({ id, enabled })
    if (result.error) {
      toast.error(result.error)
      return
    }
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled } : c))
    )
  }

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const result = await testWebhookConfig(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("测试通知已发送")
      }
    } finally {
      setTestingId(null)
    }
  }

  const insertVariable = (
    field: "titleTemplate" | "contentTemplate",
    variable: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] + variable,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Webhook 列表 */}
      <SettingsSection
        title="Webhook 通知"
        description="配置 Webhook 以接收物品到期提醒通知"
      >
        {configs.length === 0 && !showForm ? (
          <Empty className="border rounded-xl py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Webhook />
              </EmptyMedia>
              <EmptyTitle>暂无 Webhook 配置</EmptyTitle>
              <EmptyDescription>
                添加 Webhook 地址，当物品即将到期时自动发送通知
              </EmptyDescription>
            </EmptyHeader>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="size-4" data-icon="inline-start" />
              添加 Webhook
            </Button>
          </Empty>
        ) : (
          <>
            {/* 已有配置列表 */}
            {configs.length > 0 && (
              <SettingsCard className="!p-0 md:!p-0">
                <SettingsGroup>
                  {configs.map((config) => (
                    <div key={config.id} className="px-4 py-3.5 md:px-2 md:py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {config.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {config.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleTest(config.id)}
                            disabled={testingId === config.id}
                            title="测试"
                          >
                            {testingId === config.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Send className="size-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleEdit(config)}
                            title="编辑"
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(config.id)}
                            disabled={deletingId === config.id}
                            title="删除"
                          >
                            {deletingId === config.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Trash2 className="size-3" />
                            )}
                          </Button>
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) =>
                              handleToggle(config.id, checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </SettingsGroup>
              </SettingsCard>
            )}

            {/* 添加按钮 */}
            {!showForm && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowForm(true)}
              >
                <Plus className="size-4" data-icon="inline-start" />
                添加 Webhook
              </Button>
            )}
          </>
        )}
      </SettingsSection>

      {/* 表单 */}
      {showForm && (
        <SettingsSection
          title={editingId ? "编辑 Webhook" : "新建 Webhook"}
        >
          <SettingsCard>
            <div className="space-y-4">
              {/* 配置名称 */}
              <div className="space-y-2">
                <Label htmlFor="webhook-name">配置名称</Label>
                <Input
                  id="webhook-name"
                  placeholder="如：企业微信通知、飞书机器人"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://example.com/webhook"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, url: e.target.value }))
                  }
                />
              </div>

              {/* 请求参数名配置 */}
              <div className="space-y-2">
                <Label>请求参数名</Label>
                <p className="text-xs text-muted-foreground">
                  不同渠道要求的 JSON 字段名可能不同，请按目标渠道文档填写
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="webhook-title-key" className="text-xs text-muted-foreground font-normal">
                      标题参数名
                    </Label>
                    <Input
                      id="webhook-title-key"
                      placeholder="title"
                      value={formData.titleKey}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, titleKey: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="webhook-content-key" className="text-xs text-muted-foreground font-normal">
                      内容参数名
                    </Label>
                    <Input
                      id="webhook-content-key"
                      placeholder="content"
                      value={formData.contentKey}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, contentKey: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 通知标题模板 */}
              <div className="space-y-2">
                <Label htmlFor="webhook-title">通知标题</Label>
                <Input
                  id="webhook-title"
                  placeholder="通知标题模板"
                  value={formData.titleTemplate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      titleTemplate: e.target.value,
                    }))
                  }
                />
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
                      onClick={() => insertVariable("titleTemplate", v.key)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 通知内容模板 */}
              <div className="space-y-2">
                <Label htmlFor="webhook-content">通知内容</Label>
                <Textarea
                  id="webhook-content"
                  placeholder="通知内容模板，支持使用变量"
                  rows={3}
                  value={formData.contentTemplate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contentTemplate: e.target.value,
                    }))
                  }
                />
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted/80 transition-colors"
                      onClick={() => insertVariable("contentTemplate", v.key)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 模板变量说明 */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Info className="size-3.5" />
                  模板变量说明
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <div key={v.key}>
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                        {v.key}
                      </code>{" "}
                      {v.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving ? (
                    <Loader2
                      className="size-4 animate-spin"
                      data-icon="inline-start"
                    />
                  ) : (
                    <Check className="size-4" data-icon="inline-start" />
                  )}
                  {editingId ? "保存修改" : "创建配置"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  disabled={saving}
                >
                  <X className="size-4" data-icon="inline-start" />
                  取消
                </Button>
              </div>
            </div>
          </SettingsCard>
        </SettingsSection>
      )}

      {/* 发送格式说明 */}
      <SettingsSection title="请求格式" description="Webhook 将以 POST 方式发送 JSON 请求，参数名可在每个配置中自定义">
        <SettingsCard>
          <pre className="text-xs text-muted-foreground overflow-x-auto font-mono leading-relaxed">
            {`POST <your-webhook-url>
Content-Type: application/json

{
  "${showForm ? formData.titleKey || 'title' : 'title'}": "【物品到期提醒】",
  "${showForm ? formData.contentKey || 'content' : 'content'}": "您的物品 牙刷 将于 2026-02-14 到期..."
}`}
          </pre>
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
