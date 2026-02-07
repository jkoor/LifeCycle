import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDashboardStats, getPinnedItems } from "@/app/actions/dashboard"
import { DashboardContent } from "@/components/features/dashboard/dashboard-content"

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
    <DashboardContent stats={statsResult} items={pinnedItemsResult.items} />
  )
}
