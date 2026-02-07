"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * 导出用户数据
 *
 * 导出当前用户的所有业务数据（分类、标签、物品、使用记录）为 JSON 格式。
 * 不导出认证相关数据（session、account 等）。
 */
export async function exportUserData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const userId = session.user.id

    // 并行查询所有业务数据
    const [categories, tags, items, usageLogs, user] = await Promise.all([
      prisma.category.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
      prisma.tag.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
      prisma.item.findMany({
        where: { userId },
        include: {
          tags: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.usageLog.findMany({
        where: { userId },
        orderBy: { replacedAt: "asc" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, image: true },
      }),
    ])

    // 格式化导出数据
    const exportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      user: {
        name: user?.name,
        email: user?.email,
        image: user?.image,
      },
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        createdAt: c.createdAt.toISOString(),
      })),
      tags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        createdAt: t.createdAt.toISOString(),
      })),
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        brand: item.brand,
        price: item.price ? Number(item.price) : null,
        note: item.note,
        stock: item.stock,
        isArchived: item.isArchived,
        isPinned: item.isPinned,
        lastOpenedAt: item.lastOpenedAt?.toISOString() ?? null,
        lifespanDays: item.lifespanDays,
        shelfLifeDays: item.shelfLifeDays,
        unit: item.unit,
        quantity: item.quantity,
        isStockFixed: item.isStockFixed,
        expirationDate: item.expirationDate?.toISOString() ?? null,
        notifyAdvanceDays: item.notifyAdvanceDays,
        categoryName: item.category.name,
        tags: item.tags.map((t) => t.name),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      usageLogs: usageLogs.map((log) => ({
        id: log.id,
        itemId: log.itemId,
        itemName: log.itemName,
        itemBrand: log.itemBrand,
        itemPrice: log.itemPrice ? Number(log.itemPrice) : null,
        itemNote: log.itemNote,
        itemUnit: log.itemUnit,
        itemQuantity: log.itemQuantity,
        replacedAt: log.replacedAt.toISOString(),
      })),
    }

    return { success: true, data: exportData }
  } catch (error) {
    console.error("Failed to export user data:", error)
    return { error: "导出数据失败，请稍后重试" }
  }
}

/**
 * 导入用户数据的类型定义
 */
interface ImportData {
  version: string
  categories?: Array<{
    name: string
    icon?: string | null
    color?: string | null
  }>
  tags?: Array<{
    name: string
  }>
  items?: Array<{
    name: string
    image?: string | null
    brand?: string | null
    price?: number | null
    note?: string | null
    stock?: number
    isArchived?: boolean
    isPinned?: boolean
    lastOpenedAt?: string | null
    lifespanDays?: number | null
    shelfLifeDays?: number | null
    unit?: string
    quantity?: number
    isStockFixed?: boolean
    expirationDate?: string | null
    notifyAdvanceDays?: number
    categoryName: string
    tags?: string[]
  }>
  usageLogs?: Array<{
    itemName: string
    itemBrand?: string | null
    itemPrice?: number | null
    itemNote?: string | null
    itemUnit: string
    itemQuantity: number
    replacedAt: string
    itemId?: string
  }>
}

/**
 * 导入用户数据
 *
 * 从 JSON 数据中导入业务数据。采用合并策略：
 * - 分类/标签：同名则跳过，不同名则创建
 * - 物品：全部创建为新物品
 * - 使用记录：关联到对应物品
 */
export async function importUserData(jsonString: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  let importData: ImportData
  try {
    importData = JSON.parse(jsonString)
  } catch {
    return { error: "无效的 JSON 文件格式" }
  }

  // 基础验证
  if (!importData.version) {
    return { error: "无效的备份文件：缺少版本信息" }
  }

  const userId = session.user.id

  try {
    const stats = {
      categories: 0,
      tags: 0,
      items: 0,
      usageLogs: 0,
    }

    // 1. 导入分类（connectOrCreate 策略）
    const categoryMap = new Map<string, string>() // name -> id
    if (importData.categories?.length) {
      for (const cat of importData.categories) {
        const existing = await prisma.category.findUnique({
          where: { userId_name: { userId, name: cat.name } },
        })
        if (existing) {
          categoryMap.set(cat.name, existing.id)
        } else {
          const created = await prisma.category.create({
            data: {
              name: cat.name,
              icon: cat.icon,
              color: cat.color,
              userId,
            },
          })
          categoryMap.set(cat.name, created.id)
          stats.categories++
        }
      }
    }

    // 2. 导入标签（connectOrCreate 策略）
    const tagMap = new Map<string, string>() // name -> id
    if (importData.tags?.length) {
      for (const tag of importData.tags) {
        const existing = await prisma.tag.findUnique({
          where: { userId_name: { userId, name: tag.name } },
        })
        if (existing) {
          tagMap.set(tag.name, existing.id)
        } else {
          const created = await prisma.tag.create({
            data: {
              name: tag.name,
              userId,
            },
          })
          tagMap.set(tag.name, created.id)
          stats.tags++
        }
      }
    }

    // 3. 导入物品
    const itemIdMap = new Map<string, string>() // old itemId -> new itemId (for usage logs)
    if (importData.items?.length) {
      for (const item of importData.items) {
        // 确保分类存在
        let categoryId = categoryMap.get(item.categoryName)
        if (!categoryId) {
          // 如果分类不在映射中，创建它
          const cat = await prisma.category.upsert({
            where: { userId_name: { userId, name: item.categoryName } },
            create: { name: item.categoryName, userId },
            update: {},
          })
          categoryId = cat.id
          categoryMap.set(item.categoryName, categoryId)
        }

        const created = await prisma.item.create({
          data: {
            name: item.name,
            image: item.image,
            brand: item.brand,
            price: item.price,
            note: item.note,
            stock: item.stock ?? 1,
            isArchived: item.isArchived ?? false,
            isPinned: item.isPinned ?? false,
            lastOpenedAt: item.lastOpenedAt
              ? new Date(item.lastOpenedAt)
              : null,
            lifespanDays: item.lifespanDays,
            shelfLifeDays: item.shelfLifeDays,
            unit: item.unit ?? "个",
            quantity: item.quantity ?? 1,
            isStockFixed: item.isStockFixed ?? false,
            expirationDate: item.expirationDate
              ? new Date(item.expirationDate)
              : null,
            notifyAdvanceDays: item.notifyAdvanceDays ?? 3,
            categoryId,
            userId,
            tags: {
              connectOrCreate:
                item.tags?.map((tagName) => ({
                  where: { userId_name: { userId, name: tagName } },
                  create: { name: tagName, userId },
                })) ?? [],
            },
          },
        })

        // 用物品名来映射，用于后续关联 usageLogs
        itemIdMap.set(item.name, created.id)
        stats.items++
      }
    }

    // 4. 导入使用记录
    if (importData.usageLogs?.length) {
      for (const log of importData.usageLogs) {
        // 尝试找到对应的物品
        const itemId = itemIdMap.get(log.itemName)
        if (itemId) {
          await prisma.usageLog.create({
            data: {
              itemName: log.itemName,
              itemBrand: log.itemBrand,
              itemPrice: log.itemPrice,
              itemNote: log.itemNote,
              itemUnit: log.itemUnit,
              itemQuantity: log.itemQuantity,
              replacedAt: new Date(log.replacedAt),
              itemId,
              userId,
            },
          })
          stats.usageLogs++
        }
      }
    }

    revalidatePath("/inventory")
    revalidatePath("/dashboard")
    revalidatePath("/analysis")

    return {
      success: true,
      stats,
      message: `导入完成：${stats.categories} 个分类、${stats.tags} 个标签、${stats.items} 个物品、${stats.usageLogs} 条使用记录`,
    }
  } catch (error) {
    console.error("Failed to import user data:", error)
    return { error: "导入数据失败，请检查文件格式是否正确" }
  }
}
