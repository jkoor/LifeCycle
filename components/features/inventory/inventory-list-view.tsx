"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Category } from "@prisma/client"
import { SortByOption, SortDirOption } from "@/app/inventory/search-params"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  InventoryItem,
  getRemainingDays,
  ItemRow,
} from "@/components/modules/item"
import { DeleteDialogProvider } from "@/components/common/delete-dialog-provider"

interface InventoryListViewProps {
  items: InventoryItem[]
  categories: Category[]
  sortBy?: SortByOption
  sortDir?: SortDirOption
  className?: string
}

/**
 * 桌面端物品列表视图
 *
 * 使用 InventoryTableRow 组件渲染每行，
 * 逻辑已抽离到 useInventoryItem Hook。
 * 删除确认由 DeleteDialogProvider 统一处理。
 */
export function InventoryListView({
  items,
  categories,
  sortBy = "remainingDays",
  sortDir = "asc",
  className,
}: InventoryListViewProps) {
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
      <div
        className={cn("hidden rounded-lg border bg-card md:block", className)}
      >
        <Table className="table-fixed w-full">
          <colgroup>
            <col className="w-[300px]" />
            <col className="w-[90px]" />
            <col className="w-[20px]" />
            <col className="w-[150px]" />
            <col className="w-[110px]" />
            <col className="w-[170px]" />
            <col className="w-[130px]" />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="h-12 pl-4 pr-2 font-medium">物品</TableHead>
              <TableHead className="h-12 px-2 font-medium text-right">
                价格
              </TableHead>
              <TableHead></TableHead>
              <TableHead className="h-12 px-2 font-medium text-center">
                库存
              </TableHead>
              <TableHead className="h-12 px-2 font-medium text-center">
                上次更换
              </TableHead>
              <TableHead className="h-12 px-2 font-medium text-center">
                剩余天数
              </TableHead>
              <TableHead className="h-12 pl-2 pr-4 font-medium text-center">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>

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
              <AccordionContent className={cn("p-0 -mx-4")}>
                <Table className="table-fixed w-full">
                  <colgroup>
                    <col className="w-[300px]" />
                    <col className="w-[90px]" />
                    <col className="w-[20px]" />
                    <col className="w-[150px]" />
                    <col className="w-[110px]" />
                    <col className="w-[170px]" />
                    <col className="w-[130px]" />
                  </colgroup>
                  <TableBody>
                    {categoryItems.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        categories={categories}
                      />
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </DeleteDialogProvider>
  )
}
