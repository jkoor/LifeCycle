"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateNameSchema = z.object({
  name: z.string().min(1, "昵称不能为空").max(50, "昵称不能超过50个字符"),
})

const updateAvatarSchema = z.object({
  image: z.string().url("无效的头像链接").or(z.literal("")),
})

/**
 * 更新用户昵称
 */
export async function updateUserName(data: { name: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const result = updateNameSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: result.data.name },
    })

    revalidatePath("/me")
    return { success: true }
  } catch (error) {
    console.error("Failed to update user name:", error)
    return { error: "更新昵称失败" }
  }
}

/**
 * 更新用户头像
 */
export async function updateUserAvatar(data: { image: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const result = updateAvatarSchema.safeParse(data)
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid data" }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.data.image || null },
    })

    revalidatePath("/me")
    return { success: true }
  } catch (error) {
    console.error("Failed to update user avatar:", error)
    return { error: "更新头像失败" }
  }
}
