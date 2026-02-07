/**
 * Webhook 发送服务
 *
 * 与触发逻辑解耦的纯 Webhook 发送工具。
 * 负责模板渲染、HTTP 请求发送、错误包装。
 */

// ==========================================
// 类型定义
// ==========================================

export interface WebhookConfig {
  id: string
  url: string
  enabled: boolean
  titleTemplate: string
  contentTemplate: string
  titleKey: string
  contentKey: string
}

export interface TemplateVariables {
  itemName: string
  expiryDate: string
  daysLeft: string
  categoryName: string
  brand?: string
  stock?: string
}

export interface WebhookSendResult {
  success: boolean
  webhookId: string
  error?: string
  httpStatus?: number
}

// ==========================================
// 模板渲染
// ==========================================

/**
 * 将模板中的 {{variable}} 占位符替换为实际值
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables,
): string {
  return template
    .replace(/\{\{itemName\}\}/g, variables.itemName)
    .replace(/\{\{expiryDate\}\}/g, variables.expiryDate)
    .replace(/\{\{daysLeft\}\}/g, variables.daysLeft)
    .replace(/\{\{categoryName\}\}/g, variables.categoryName)
    .replace(/\{\{brand\}\}/g, variables.brand ?? "")
    .replace(/\{\{stock\}\}/g, variables.stock ?? "")
}

// ==========================================
// 发送 Webhook
// ==========================================

const WEBHOOK_TIMEOUT_MS = 10_000 // 10 秒超时

/**
 * 向单个 Webhook 端点发送通知
 */
export async function sendWebhook(
  config: WebhookConfig,
  variables: TemplateVariables,
): Promise<WebhookSendResult> {
  if (!config.enabled) {
    return { success: false, webhookId: config.id, error: "Webhook 已禁用" }
  }

  const title = renderTemplate(config.titleTemplate, variables)
  const content = renderTemplate(config.contentTemplate, variables)

  const payload: Record<string, string> = {}
  payload[config.titleKey ?? "title"] = title
  payload[config.contentKey ?? "content"] = content

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

    const response = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: false,
        webhookId: config.id,
        error: `HTTP ${response.status}: ${response.statusText}`,
        httpStatus: response.status,
      }
    }

    return { success: true, webhookId: config.id, httpStatus: response.status }
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "AbortError"
        ? "请求超时"
        : error instanceof Error
          ? error.message
          : "Unknown error"

    return { success: false, webhookId: config.id, error: message }
  }
}

/**
 * 向用户的所有启用的 Webhook 端点发送通知
 *
 * @returns 每个 Webhook 的发送结果
 */
export async function sendToAllWebhooks(
  configs: WebhookConfig[],
  variables: TemplateVariables,
): Promise<WebhookSendResult[]> {
  const enabledConfigs = configs.filter((c) => c.enabled)
  if (enabledConfigs.length === 0) return []

  // 并发发送，互不阻塞
  const results = await Promise.allSettled(
    enabledConfigs.map((config) => sendWebhook(config, variables)),
  )

  return results.map((result, index) => {
    if (result.status === "fulfilled") return result.value
    return {
      success: false,
      webhookId: enabledConfigs[index].id,
      error: result.reason?.message ?? "Promise rejected",
    }
  })
}
