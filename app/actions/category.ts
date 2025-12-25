"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function createCategory(name: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  if (!name || name.trim().length === 0) {
    return { error: "Category name is required" }
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
      },
    })

    return { success: true, category }
  } catch (error) {
    console.error("Failed to create category:", error)
    return { error: "Failed to create category" }
  }
}
