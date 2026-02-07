"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ==========================================
// Schema 校验
// ==========================================

const webhookConfigSchema = z.object({
  name: z.string().min(1, "配置名称不能为空").max(50, "名称不能超过50个字符"),
  url: z.string().url("请输入有效的 Webhook URL"),
  enabled: z.boolean().default(true),
  titleTemplate: z.string().min(1, "通知标题不能为空").max(200, "标题不能超过200个字符"),
  contentTemplate: z.string().min(1, "通知内容不能为空").max(1000, "内容不能超过1000个字符"),
  titleKey: z.string().min(1, "标题参数名不能为空").max(50).default("title"),
  contentKey: z.string().min(1, "内容参数名不能为空").max(50).default("content"),
})

const updateWebhookSchema = webhookConfigSchema.partial().extend({
  id: z.string(),
})

// ==========================================
// 获取当前用户的 Webhook 配置列表
// ==========================================

export async function getWebhookConfigs() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized", data: [] }
  }

  try {
    const configs = await prisma.webhookConfig.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })
    return { data: configs }
  } catch (error) {
    console.error("Failed to fetch webhook configs:", error)
    return { error: "获取 Webhook 配置失败", data: [] }
  }
}

// ==========================================
// 创建 Webhook 配置
// ==========================================

export async function createWebhookConfig(data: {
  name: string
  url: string
  enabled?: boolean
  titleTemplate: string
  contentTemplate: string
  titleKey?: string
  contentKey?: string
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const result = webhookConfigSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" }
  }

  try {
    const config = await prisma.webhookConfig.create({
      data: {
        ...result.data,
        userId: session.user.id,
      },
    })

    revalidatePath("/me")
    return { success: true, data: config }
  } catch (error) {
    console.error("Failed to create webhook config:", error)
    return { error: "创建 Webhook 配置失败" }
  }
}

// ==========================================
// 更新 Webhook 配置
// ==========================================

export async function updateWebhookConfig(data: {
  id: string
  name?: string
  url?: string
  enabled?: boolean
  titleTemplate?: string
  contentTemplate?: string
  titleKey?: string
  contentKey?: string
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const result = updateWebhookSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" }
  }

  const { id, ...updateData } = result.data

  try {
    // 确保只能更新自己的配置
    const existing = await prisma.webhookConfig.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return { error: "配置不存在" }
    }

    const config = await prisma.webhookConfig.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/me")
    return { success: true, data: config }
  } catch (error) {
    console.error("Failed to update webhook config:", error)
    return { error: "更新 Webhook 配置失败" }
  }
}

// ==========================================
// 删除 Webhook 配置
// ==========================================

export async function deleteWebhookConfig(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const existing = await prisma.webhookConfig.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return { error: "配置不存在" }
    }

    await prisma.webhookConfig.delete({ where: { id } })

    revalidatePath("/me")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete webhook config:", error)
    return { error: "删除 Webhook 配置失败" }
  }
}

// ==========================================
// 测试 Webhook
// ==========================================

export async function testWebhookConfig(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const config = await prisma.webhookConfig.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!config) {
      return { error: "配置不存在" }
    }

    // 构造测试数据
    const title = config.titleTemplate
      .replace("{{itemName}}", "测试物品")
      .replace("{{expiryDate}}", "2026-02-14")
      .replace("{{daysLeft}}", "7")

    const content = config.contentTemplate
      .replace("{{itemName}}", "测试物品")
      .replace("{{expiryDate}}", "2026-02-14")
      .replace("{{daysLeft}}", "7")
      .replace("{{categoryName}}", "日用品")

    const payload: Record<string, string> = {}
    payload[config.titleKey ?? "title"] = title
    payload[config.contentKey ?? "content"] = content

    const response = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return { error: `Webhook 请求失败: HTTP ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to test webhook:", error)
    return { error: "Webhook 测试失败，请检查 URL 是否可用" }
  }
}
