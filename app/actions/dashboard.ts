"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getItemStatus } from "@/components/modules/item/utils"
import type { InventoryItem } from "@/components/modules/item/types"

/**
 * Dashboard Statistics Interface
 */
export interface DashboardStats {
  totalItems: number
  expiringSoon: number
  lowStock: number
  notificationsEnabled: number
}

/**
 * Get Dashboard Statistics
 *
 * Returns aggregated statistics for the dashboard:
 * - Total non-archived items
 * - Items expiring soon
 * - Items with low stock
 * - Items with notifications enabled
 */
export async function getDashboardStats(): Promise<
  DashboardStats | { error: string }
> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // Fetch all non-archived items to calculate statuses
    const items = await prisma.item.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      include: {
        category: true,
        tags: true,
      },
    })

    // Convert Prisma items to InventoryItem format
    const inventoryItems: InventoryItem[] = items.map((item) => ({
      ...item,
      price: item.price ? Number(item.price) : 0,
    }))

    // Calculate statistics
    let expiringSoon = 0
    let lowStock = 0

    inventoryItems.forEach((item) => {
      const status = getItemStatus(item)

      // Count expiring soon items
      if (status.key === "expiring_soon" || status.key === "expired") {
        expiringSoon++
      }

      // Count low stock items (including out of stock)
      if (status.key === "low_stock" || status.key === "out_of_stock") {
        lowStock++
      }
    })

    // Count notifications enabled (notifyAdvanceDays >= 0)
    const notificationsEnabled = inventoryItems.filter(
      (item) => item.notifyAdvanceDays >= 0,
    ).length

    return {
      totalItems: inventoryItems.length,
      expiringSoon,
      lowStock,
      notificationsEnabled,
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return { error: "Failed to fetch dashboard statistics" }
  }
}

/**
 * Get Pinned Items for Dashboard Tracking
 *
 * Returns items that are:
 * - Pinned (isPinned = true)
 * - Not archived (isArchived = false)
 * - Belongs to current user
 */
export async function getPinnedItems() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const items = await prisma.item.findMany({
      where: {
        userId: session.user.id,
        isPinned: true,
        isArchived: false,
      },
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Convert to InventoryItem format
    const inventoryItems: InventoryItem[] = items.map((item) => ({
      ...item,
      price: item.price ? Number(item.price) : 0,
    }))

    return { items: inventoryItems }
  } catch (error) {
    console.error("Failed to fetch pinned items:", error)
    return { error: "Failed to fetch pinned items" }
  }
}
