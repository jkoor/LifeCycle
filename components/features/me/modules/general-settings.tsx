"use client"

import { useRef, useState, useCallback, useTransition } from "react"
import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsGroup,
} from "@/components/modules/settings/ui"
import { ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { exportUserData, importUserData } from "@/app/actions/data"

/**
 * 计算浏览器缓存大小（localStorage + sessionStorage）
 */
function getCacheSize(): string {
  let total = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        total += (localStorage.getItem(key) || "").length * 2 // UTF-16
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key) {
        total += (sessionStorage.getItem(key) || "").length * 2
      }
    }
  } catch {
    // storage 可能不可用
  }

  if (total < 1024) return `${total} B`
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`
  return `${(total / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * 通用设置模块
 *
 * iOS 风格分组列表
 */
export function GeneralSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, startExportTransition] = useTransition()
  const [isImporting, startImportTransition] = useTransition()
  const [cacheSize, setCacheSize] = useState<string>(() => getCacheSize())

  // ── 导出数据 ──
  const handleExport = useCallback(() => {
    startExportTransition(async () => {
      const result = await exportUserData()

      if ("error" in result) {
        toast.error(result.error)
        return
      }

      // 生成 JSON 并触发下载
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lifecycle-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("数据导出成功")
    })
  }, [])

  // ── 导入数据 ──
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // 验证文件类型
      if (!file.name.endsWith(".json")) {
        toast.error("请选择 JSON 格式的备份文件")
        return
      }

      // 限制文件大小（10MB）
      if (file.size > 10 * 1024 * 1024) {
        toast.error("文件大小不能超过 10MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (!content) {
          toast.error("文件读取失败")
          return
        }

        startImportTransition(async () => {
          const result = await importUserData(content)

          if ("error" in result) {
            toast.error(result.error)
          } else {
            toast.success(result.message)
          }
        })
      }
      reader.onerror = () => {
        toast.error("文件读取失败")
      }
      reader.readAsText(file)

      // 重置 input，以允许重复选择同一文件
      e.target.value = ""
    },
    [],
  )

  // ── 清除缓存 ──
  const handleClearCache = useCallback(() => {
    try {
      localStorage.clear()
      sessionStorage.clear()

      // 清除 Service Worker 缓存
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name))
        })
      }

      setCacheSize(getCacheSize())
      toast.success("缓存已清除")
    } catch {
      toast.error("清除缓存失败")
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

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
              onClick={handleExport}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <span className="text-xs text-muted-foreground">JSON</span>
              )}
            </SettingsRow>

            <SettingsRow
              label="导入数据"
              description="从备份文件恢复"
              showArrow
              onClick={handleImportClick}
            >
              {isImporting && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </SettingsRow>

            <SettingsRow
              label="清除缓存"
              description="释放存储空间"
              showArrow
              onClick={handleClearCache}
            >
              <span className="text-xs text-muted-foreground">
                {cacheSize}
              </span>
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

            <SettingsRow label="使用条款" showArrow onClick={() => { }} />

            <SettingsRow label="隐私政策" showArrow onClick={() => { }} />

            <SettingsRow label="开源许可" showArrow onClick={() => { }} />
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
