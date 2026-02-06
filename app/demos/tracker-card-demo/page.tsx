"use client"

import { TrackerCard, type TrackerItemMock } from "@/components/modules/item"

// Mock Data
const demoItems: TrackerItemMock[] = [
  {
    id: "1",
    name: "隐形眼镜护理液",
    category: "卫浴用品",
    status: "healthy",
    stock: 2,
    totalDays: 90,
    daysRemaining: 75,
  },
  {
    id: "2",
    name: "电动牙刷头",
    category: "个人护理",
    status: "expiring_soon", // Replaced 'warning'
    stock: 1,
    totalDays: 90,
    daysRemaining: 12,
  },
  {
    id: "3",
    name: "厨房海绵",
    category: "厨房用品",
    status: "out_of_stock", // Replaced 'critical' with out_of_stock for demo or similar
    stock: 0,
    totalDays: 14,
    daysRemaining: 0,
  },
  {
    id: "4",
    name: "濾水壺濾芯",
    category: "厨房用品",
    status: "expired",
    stock: 1,
    totalDays: 30,
    daysRemaining: 0,
  },
  {
    id: "5",
    name: "洗洁精",
    category: "厨房用品",
    status: "low_stock",
    stock: 1,
    totalDays: 60,
    daysRemaining: 45,
  },
]

export default function TrackerCardDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          物品追踪卡片 (Tracker Card)
        </h1>
        <p className="text-muted-foreground">
          展示不同状态下的物品追踪卡片设计方案。适配最新 types.ts 状态定义。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {demoItems.map((item) => (
            <TrackerCard key={item.id} item={item} />
          ))}
        </div>

        <div className="pt-12">
          <h2 className="text-xl font-semibold mb-4">
            宽卡片布局测试 (Grid span-2)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TrackerCard item={demoItems[0]} className="md:col-span-2" />
            <TrackerCard item={demoItems[2]} />
          </div>
        </div>
      </div>
    </div>
  )
}
