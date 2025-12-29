"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Category } from "@prisma/client"
import { InventoryItem, getRemainingDays } from "@/components/modules/item"
import { DeleteDialogProvider } from "@/components/common/delete-dialog-provider"
import { ItemMobileRow } from "./inventory-mobile-row"
import { SortByOption, SortDirOption } from "@/app/inventory/search-params"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface InventoryMobileGridProps {
  items: InventoryItem[]
  categories: Category[]
  sortBy?: SortByOption
  sortDir?: SortDirOption
  isArchived?: boolean
}

/**
 * 移动端物品视图（Drawer 抽屉模式 + Accordion 分组）
 *
 * 使用 ItemMobileRow 组件：点击展开 Drawer 详情
 * 支持按分类分组，使用 Accordion 展开/折叠
 * 删除确认由 DeleteDialogProvider 统一处理
 */
export function InventoryMobileGrid({
  items,
  categories,
  sortBy = "remainingDays",
  sortDir = "asc",
  isArchived = false,
}: InventoryMobileGridProps) {
  const router = useRouter()

  // 排序函数
  const sortItems = (itemsToSort: InventoryItem[]) => {
    return [...itemsToSort].sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name, "zh-CN")
          break
        case "price":
          comparison = (a.price ?? 0) - (b.price ?? 0)
          break
        case "stock":
          comparison = (a.stock ?? 0) - (b.stock ?? 0)
          break
        case "lastReplaced":
          const aTime = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : 0
          const bTime = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : 0
          comparison = aTime - bTime
          break
        case "remainingDays":
        default:
          const aRemaining = getRemainingDays(a)
          const bRemaining = getRemainingDays(b)
          // null 值排到最后
          if (aRemaining === null && bRemaining === null) comparison = 0
          else if (aRemaining === null) comparison = 1
          else if (bRemaining === null) comparison = -1
          else comparison = aRemaining - bRemaining
          break
      }
      return sortDir === "desc" ? -comparison : comparison
    })
  }

  // 分组并排序物品
  const groupedAndSortedItems = useMemo(() => {
    // 先按分类分组
    const grouped = items.reduce((acc, item) => {
      const categoryName = item.category?.name || "未分类"
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(item)
      return acc
    }, {} as Record<string, InventoryItem[]>)

    // 对每组内的物品进行排序
    const sortedGroups: Record<string, InventoryItem[]> = {}
    Object.keys(grouped).forEach((categoryName) => {
      sortedGroups[categoryName] = sortItems(grouped[categoryName])
    })

    // 分组按名称排序
    const sortedEntries = Object.entries(sortedGroups).sort(([a], [b]) =>
      a.localeCompare(b, "zh-CN")
    )

    return sortedEntries
  }, [items, sortBy, sortDir])

  // 获取所有分类名称作为默认展开项
  const allCategoryNames = groupedAndSortedItems.map(([name]) => name)

  return (
    <DeleteDialogProvider onDeleteSuccess={() => router.refresh()}>
      <div className="block md:hidden rounded-lg border bg-card">
        <Accordion
          type="multiple"
          defaultValue={allCategoryNames}
          className="border-0 rounded-none"
        >
          {groupedAndSortedItems.map(([categoryName, categoryItems]) => (
            <AccordionItem
              key={categoryName}
              value={categoryName}
              className="border-0"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{categoryName}</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {categoryItems.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="divide-y divide-border/50">
                  {categoryItems.map((item) => (
                    <ItemMobileRow
                      key={item.id}
                      item={item}
                      categories={categories}
                      isArchived={isArchived}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </DeleteDialogProvider>
  )
}
