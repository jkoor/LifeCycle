"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { itemFormSchema, ItemFormValues } from "@/lib/schemas/item-schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createItem(data: ItemFormValues) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const result = itemFormSchema.safeParse(data)
  if (!result.success) {
    return { error: "Invalid data", issues: result.error.issues }
  }

  const { notifyEnabled, notifyAdvanceDays, ...dbData } = result.data

  try {
    await prisma.item.create({
      data: {
        ...dbData,
        userId: session.user.id,
        // Logic: If notification disabled (notifyEnabled=false), what do we do?
        // Schema default is 3. If user disabled it, maybe store -1 or 0?
        // For now, I'll store the value from slider but maybe we need a way to say "off".
        // If notifyEnabled is false, we can set notifyAdvanceDays to -1 as a convention "Disabled"
        notifyAdvanceDays: notifyEnabled ? notifyAdvanceDays : -1,

        // Handle tags: transform ["tag1", "tag2"] to connectOrCreate logic
        tags: {
          connectOrCreate: dbData.tags?.map((tag) => ({
            where: { userId_name: { userId: session.user.id!, name: tag } },
            create: { name: tag, userId: session.user.id! },
          })),
        },
      },
    })

    revalidatePath("/inventory")
    return { success: true }
  } catch (error) {
    console.error("Failed to create item:", error)
    return { error: "Failed to create item" }
  }
}

export async function updateItem(id: string, data: ItemFormValues) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const result = itemFormSchema.safeParse(data)
  if (!result.success) {
    return { error: "Invalid data", issues: result.error.issues }
  }

  const { notifyEnabled, notifyAdvanceDays, ...dbData } = result.data

  try {
    await prisma.item.update({
      where: { id, userId: session.user.id },
      data: {
        ...dbData,
        notifyAdvanceDays: notifyEnabled ? notifyAdvanceDays : -1,
        // Update tags: We might need to disconnect old ones or just set new ones.
        // Prisma 'set' might replace all relations? No, for implicit m-n 'set' works.
        tags: {
          set: [], // Clear existing
          connectOrCreate: dbData.tags?.map((tag) => ({
            where: { userId_name: { userId: session.user.id!, name: tag } },
            create: { name: tag, userId: session.user.id! },
          })),
        },
      },
    })

    revalidatePath("/inventory")
    return { success: true }
  } catch (error) {
    console.error("Failed to update item:", error)
    return { error: "Failed to update item" }
  }
}

export async function deleteItem(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.item.delete({
      where: { id, userId: session.user.id },
    })
    revalidatePath("/inventory")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete item" }
  }
}

export async function restoreItem(data: ItemFormValues) {
  return createItem(data)
}

export async function updateStock(id: string, delta: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // First get current stock
    const item = await prisma.item.findUnique({
      where: { id, userId: session.user.id },
      select: { stock: true },
    })

    if (!item) {
      return { error: "Item not found" }
    }

    const currentStock = item.stock ?? 0
    const newStock = Math.max(0, currentStock + delta)

    await prisma.item.update({
      where: { id, userId: session.user.id },
      data: { stock: newStock },
    })

    revalidatePath("/inventory")
    return { success: true, stock: newStock }
  } catch (error) {
    console.error("Failed to update stock:", error)
    return { error: "Failed to update stock" }
  }
}

export async function toggleNotification(id: string, enabled: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // Get current item to preserve notifyAdvanceDays when re-enabling
    const item = await prisma.item.findUnique({
      where: { id, userId: session.user.id },
      select: { notifyAdvanceDays: true },
    })

    if (!item) {
      return { error: "Item not found" }
    }

    // When enabling, use 3 days as default if previously disabled (-1)
    // When disabling, set to -1
    const newNotifyDays = enabled
      ? item.notifyAdvanceDays && item.notifyAdvanceDays > 0
        ? item.notifyAdvanceDays
        : 3
      : -1

    await prisma.item.update({
      where: { id, userId: session.user.id },
      data: { notifyAdvanceDays: newNotifyDays },
    })

    revalidatePath("/inventory")
    return { success: true, notifyAdvanceDays: newNotifyDays }
  } catch (error) {
    console.error("Failed to toggle notification:", error)
    return { error: "Failed to toggle notification" }
  }
}

export async function replaceItem(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // 1. 获取当前物品完整状态（用于快照）
    const item = await prisma.item.findUnique({
      where: { id, userId: session.user.id },
      select: {
        stock: true,
        lastOpenedAt: true,
        isStockFixed: true,
        // 快照所需字段
        name: true,
        brand: true,
        price: true,
        note: true,
        unit: true,
        quantity: true,
      },
    })

    if (!item) {
      return { error: "Item not found" }
    }

    // 如果不是固定库存模式，检查库存是否充足
    if (!item.isStockFixed && item.stock < 1) {
      return { error: "库存不足，无法更换" }
    }

    const previousStock = item.stock
    const previousDate = item.lastOpenedAt
    const replacedAt = new Date()

    // 2. 使用事务同时更新物品和创建快照日志
    const [updatedItem, newLog] = await prisma.$transaction([
      // 更新物品状态
      prisma.item.update({
        where: { id, userId: session.user.id },
        data: {
          // 固定库存模式下不扣减库存
          stock: item.isStockFixed ? item.stock : item.stock - 1,
          lastOpenedAt: replacedAt,
        },
      }),
      // 创建快照日志
      prisma.usageLog.create({
        data: {
          userId: session.user.id,
          itemId: id,
          itemName: item.name,
          itemBrand: item.brand,
          itemPrice: item.price,
          itemNote: item.note,
          itemUnit: item.unit,
          itemQuantity: item.quantity,
          replacedAt: replacedAt,
        },
      }),
    ])

    revalidatePath("/inventory")
    return {
      success: true,
      previousStock,
      previousDate: previousDate ? previousDate.toISOString() : null,
      usageLogId: newLog.id, // <--- 返回日志 ID 以支持撤销
    }
  } catch (error) {
    console.error("Failed to replace item:", error)
    return { error: "Failed to replace item" }
  }
}

// For Undo Replace - 撤销更换操作
export async function undoReplaceItem(
  id: string,
  previousStock: number,
  previousDate: string | null,
  usageLogId?: string, // <--- 新参数：快照日志 ID
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // 使用事务同时恢复物品状态和删除日志
    const operations = [
      // 恢复物品状态
      prisma.item.update({
        where: { id, userId: session.user.id },
        data: {
          stock: previousStock,
          lastOpenedAt: previousDate ? new Date(previousDate) : null,
        },
      }),
    ]

    // 如果提供了日志 ID，则删除对应的快照记录
    if (usageLogId) {
      operations.push(
        prisma.usageLog.delete({
          where: { id: usageLogId },
        }) as any, // Type assertion needed for transaction array
      )
    }

    await prisma.$transaction(operations)
    revalidatePath("/inventory")
    return { success: true }
  } catch (error) {
    console.error("Failed to undo replace:", error)
    return { error: "Undo failed" }
  }
}

export async function toggleArchive(id: string, isArchived: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.item.update({
      where: { id, userId: session.user.id },
      data: { isArchived },
    })
    revalidatePath("/inventory")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update archive status" }
  }
}

export async function togglePin(id: string, isPinned: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.item.update({
      where: { id, userId: session.user.id },
      data: { isPinned },
    })
    revalidatePath("/inventory")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update pin status" }
  }
}
