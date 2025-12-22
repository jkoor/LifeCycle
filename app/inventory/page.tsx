import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InventoryHeader } from "@/components/features/inventory/inventory-header"
import { InventoryToolbar } from "@/components/features/inventory/inventory-toolbar"
import { InventoryList } from "@/components/features/inventory/inventory-list"

export default async function InventoryPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const items = await prisma.item.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: true,
      tags: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header: Title + Add Button */}
      <InventoryHeader />

      {/* Toolbar: Search + Filters */}
      <Suspense
        fallback={
          <div className="h-14 w-full bg-muted/20 animate-pulse rounded-lg" />
        }
      >
        <InventoryToolbar />
      </Suspense>

      {/* Data View: Table / Grid */}
      <Suspense
        fallback={
          <div className="h-64 w-full bg-muted/20 animate-pulse rounded-lg" />
        }
      >
        <InventoryList items={items} />
      </Suspense>
    </div>
  )
}
