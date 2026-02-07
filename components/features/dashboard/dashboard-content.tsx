"use client"

import { PageContainer } from "@/components/common"
import { StatsCards } from "@/components/features/dashboard/stats-cards"
import { TrackedItems } from "@/components/features/dashboard/tracked-items"
import type { DashboardStats } from "@/app/actions/dashboard"
import type { InventoryItem } from "@/components/modules/item/types"

interface DashboardContentProps {
  stats: DashboardStats
  items: InventoryItem[]
}

export function DashboardContent({ stats, items }: DashboardContentProps) {
  return (
    <PageContainer title="首页" description="快速查看库存状态和追踪重要物品">
      <div className="space-y-8">
        {/* Statistics Cards Section */}
        <section>
          <StatsCards stats={stats} />
        </section>

        {/* Item Tracking Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">物品追踪</h2>
            <p className="text-sm text-muted-foreground mt-1">
              已置顶的物品将显示在此处
            </p>
          </div>
          <TrackedItems items={items} />
        </section>
      </div>
    </PageContainer>
  )
}
