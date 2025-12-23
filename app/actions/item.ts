"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { itemFormSchema, ItemFormValues } from "@/lib/schemas/item-schema"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createItem(data: ItemFormValues) {
  const session = await auth()
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
  const session = await auth()
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
  const session = await auth()
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
