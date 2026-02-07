import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InventoryContent } from "@/components/features/inventory/inventory-content"
import { searchParamsCache } from "./search-params"
import { SearchParams } from "nuqs/server"

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const { q, sortBy, sortDir, isArchived } =
    await searchParamsCache.parse(searchParams)
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const rawItems = await prisma.item.findMany({
    where: {
      userId: session.user.id,
      isArchived: isArchived,
      name: {
        contains: q,
      },
    },
    include: {
      category: true,
      tags: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  // Fetch categories for the Add/Edit form
  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  })

  // Format items (decimal to number)
  const items = rawItems.map((item) => ({
    ...item,
    price: item.price ? item.price.toNumber() : 0,
  }))

  return (
    <InventoryContent
      items={items}
      categories={categories}
      searchQuery={q}
      sortBy={sortBy}
      sortDir={sortDir}
      isArchived={isArchived}
    />
  )
}
