import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InventoryHeader } from "@/components/features/inventory/inventory-header"
import { InventoryToolbar } from "@/components/features/inventory/inventory-toolbar"
import { InventoryList } from "@/components/features/inventory/inventory-list"
import { searchParamsCache } from "./search-params"
import { SearchParams } from "nuqs/server"

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const { q, sort, view } = await searchParamsCache.parse(searchParams)
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Basic sorting logic map
  const orderBy: any = {}
  if (sort === "updatedAt") {
    orderBy.updatedAt = "desc"
  } else if (sort === "name") {
    orderBy.name = "asc"
  } else if (sort === "stock") {
    orderBy.stock = "asc" // or desc depending on need, assuming low stock first? or high? keeping simple.
  } else {
    orderBy.updatedAt = "desc"
  }

  const rawItems = await prisma.item.findMany({
    where: {
      userId: session.user.id,
      name: {
        contains: q,
      },
    },
    include: {
      category: true,
      tags: true,
    },
    orderBy,
  })

  // Format items (decimal to number)
  const items = rawItems.map((item) => ({
    ...item,
    price: item.price ? item.price.toNumber() : 0,
  }))

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
        key={JSON.stringify({ q, sort, view })} // Force re-render on params change
        fallback={
          <div className="h-64 w-full bg-muted/20 animate-pulse rounded-lg" />
        }
      >
        {/* Pass view mode if InventoryList supports it, otherwise it relies on client hooks or defaults */}
        <InventoryList items={items} view={view} searchQuery={q} />
      </Suspense>
    </div>
  )
}
