import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDashboardStats, getPinnedItems } from "@/app/actions/dashboard"
import { StatsCards } from "@/components/features/dashboard/stats-cards"
import { TrackedItems } from "@/components/features/dashboard/tracked-items"
import { Logo } from "@/components/common/logo"

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch dashboard data
  const statsResult = await getDashboardStats()
  const pinnedItemsResult = await getPinnedItems()

  // Handle errors
  if ("error" in statsResult) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center text-destructive">
          Failed to load dashboard statistics
        </div>
      </div>
    )
  }

  if ("error" in pinnedItemsResult) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center text-destructive">
          Failed to load pinned items
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        <p className="text-muted-foreground mt-1 ml-1">
          快速查看库存状态和追踪重要物品
        </p>
      </div>

      {/* Statistics Cards Section */}
      <section>
        <StatsCards stats={statsResult} />
      </section>

      {/* Item Tracking Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">物品追踪</h2>
          <p className="text-sm text-muted-foreground mt-1">
            已置顶的物品将显示在此处
          </p>
        </div>
        <TrackedItems items={pinnedItemsResult.items} />
      </section>
    </div>
  )
}
