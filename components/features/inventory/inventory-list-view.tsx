"use client"

import { useMemo, useState } from "react"
import { InventoryItem } from "@/types/inventory"
import {
  Archive,
  Pencil,
  Trash2Icon,
  Loader2,
  Minus,
  Plus,
  Bell,
  BellOff,
  AlertTriangle,
} from "lucide-react"
import { RefreshCWIcon } from "@/components/ui/refresh-cw"
import { cn } from "@/lib/utils"
import { AddItemModal } from "./add-item-modal"
import {
  deleteItem,
  updateStock,
  toggleNotification,
  replaceItem,
  undoReplaceItem,
  toggleArchive,
} from "@/app/actions/item"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Category } from "@prisma/client"
import { format, differenceInDays, addDays } from "date-fns"
import { zhCN } from "date-fns/locale"
import { SortByOption, SortDirOption } from "@/app/inventory/search-params"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface InventoryListViewProps {
  items: InventoryItem[]
  categories: Category[]
  sortBy?: SortByOption
  sortDir?: SortDirOption
  className?: string
}

export function InventoryListView({
  items,
  categories,
  sortBy = "remainingDays",
  sortDir = "asc",
  className,
}: InventoryListViewProps) {
  const { toast: shadcnToast } = { toast: (props: any) => {} } // Mocking/removing usage safely if any remains
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null)
  const [updatingNotifyId, setUpdatingNotifyId] = useState<string | null>(null)
  const [replacingId, setReplacingId] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const handleUpdateStock = async (id: string, delta: number) => {
    setUpdatingStockId(id)
    try {
      const res = await updateStock(id, delta)
      if (res.error) {
        toast.error("更新库存失败", { description: res.error })
      } else {
        router.refresh()
      }
    } catch {
      toast.error("更新库存失败")
    } finally {
      setUpdatingStockId(null)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete
    setDeletingId(id)
    setItemToDelete(null) // Close dialog immediately or wait? Better wait. Actually close dialog then show loading state on button?
    // Button is inside row, dialog is global.
    // Let's keep dialog open? No, standard is close then optimistic or loading.

    try {
      const res = await deleteItem(id)
      if (res.error) {
        toast.error("删除失败", { description: res.error })
      } else {
        toast.success("物品已删除")
        router.refresh()
      }
    } catch {
      toast.error("删除失败")
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleNotification = async (id: string, enabled: boolean) => {
    setUpdatingNotifyId(id)
    try {
      const res = await toggleNotification(id, enabled)
      if (res.error) {
        toast.error("切换提醒失败", { description: res.error })
      } else {
        toast.success(enabled ? "已开启提醒" : "已关闭提醒", {
          description: enabled
            ? `将在过期前 ${res.notifyAdvanceDays} 天提醒`
            : "不再提醒",
          action: {
            label: "撤销",
            onClick: async () => {
              await toggleNotification(id, !enabled)
              router.refresh()
            },
          },
        })
        router.refresh()
      }
    } catch {
      toast.error("切换提醒失败")
    } finally {
      setUpdatingNotifyId(null)
    }
  }

  const handleReplace = async (id: string) => {
    setReplacingId(id)
    try {
      const res = await replaceItem(id)
      if (res.error) {
        toast.error("更换失败", { description: res.error })
      } else {
        toast.success("已完成更换", {
          description: "库存 -1，日期已重置",
          action: {
            label: "撤销",
            onClick: async () => {
              // Undo replace: restore stock and date
              if (res.previousStock !== undefined) {
                await undoReplaceItem(
                  id,
                  res.previousStock,
                  res.previousDate || null
                )
                router.refresh()
              }
            },
          },
        })
        router.refresh()
      }
    } catch {
      toast.error("更换失败")
    } finally {
      setReplacingId(null)
    }
  }

  const handleToggleArchive = async (id: string, currentStatus: boolean) => {
    setArchivingId(id)
    try {
      const newStatus = !currentStatus
      const res = await toggleArchive(id, newStatus)
      if (res.error) {
        toast.error("归档失败", { description: res.error })
      } else {
        toast.success(newStatus ? "已归档" : "已取消归档", {
          action: {
            label: "撤销",
            onClick: async () => {
              await toggleArchive(id, currentStatus)
              router.refresh()
            },
          },
        })
        router.refresh()
      }
    } catch {
      toast.error("操作失败")
    } finally {
      setArchivingId(null)
    }
  }

  // 计算剩余天数
  const getRemainingDays = (item: InventoryItem) => {
    if (item.expirationDate) {
      return differenceInDays(new Date(item.expirationDate), new Date())
    }
    if (item.lifespanDays && item.lastOpenedAt) {
      const expiresAt = addDays(new Date(item.lastOpenedAt), item.lifespanDays)
      return differenceInDays(expiresAt, new Date())
    }
    return null
  }

  // 获取剩余天数的状态样式
  const getRemainingStatus = (days: number | null) => {
    if (days === null) return null
    if (days < 0)
      return { label: "已过期", color: "text-red-500", bg: "bg-red-500/10" }
    if (days <= 7)
      return {
        label: `${days} 天`,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      }
    return {
      label: `${days} 天`,
      color: "text-green-500",
      bg: "bg-green-500/10",
    }
  }

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
    <div className={cn("hidden rounded-lg border bg-card md:block", className)}>
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
        className="border-0 rounded-none "
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
                  {categoryItems.map((item) => {
                    const remainingDays = getRemainingDays(item)
                    const status = getRemainingStatus(remainingDays)

                    return (
                      <TableRow
                        key={item.id}
                        className="hover:bg-muted/50 group border-b-0 last:border-b"
                      >
                        <TableCell className="h-16 pl-4 pr-2">
                          <div className="flex items-center gap-3">
                            <Avatar
                              className={cn(
                                "h-10 w-10 rounded-md shrink-0",
                                item.image
                                  ? "bg-transparent after:hidden"
                                  : "bg-muted after:rounded-md border-0"
                              )}
                            >
                              <AvatarImage
                                src={item.image || ""}
                                alt={item.name}
                                className="object-cover rounded-md"
                              />
                              <AvatarFallback className="rounded-md">
                                {item.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span
                                className="font-medium truncate"
                                title={item.name}
                              >
                                {item.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground truncate">
                                  {item.brand || "无品牌"}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {item.tags &&
                                    item.tags.length > 0 &&
                                    item.tags.slice(0, 2).map((tag) => (
                                      <Badge
                                        key={tag.id}
                                        variant="secondary"
                                        className="px-1.5 py-0 text-[10px] font-normal"
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  {item.tags && item.tags.length > 2 && (
                                    <Badge
                                      variant="secondary"
                                      className="px-1.5 py-0 text-[10px] font-normal"
                                    >
                                      +{item.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="h-16 px-2 text-sm font-medium text-right">
                          {item.price !== undefined && item.price !== null
                            ? `¥${Number(item.price).toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="h-16 px-2  text-center">
                          <TooltipProvider>
                            <div className="flex items-center justify-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-primary hover:text-white"
                                    onClick={() =>
                                      handleUpdateStock(item.id, -1)
                                    }
                                    disabled={
                                      updatingStockId === item.id ||
                                      (item.stock ?? 0) <= 0
                                    }
                                  >
                                    {updatingStockId === item.id ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <Minus className="size-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>减少库存</TooltipContent>
                              </Tooltip>
                              <span
                                className={cn(
                                  "min-w-[24px] text-center text-sm font-medium",
                                  (item.stock ?? 0) === 0
                                    ? "text-red-500"
                                    : (item.stock ?? 0) <= 2
                                    ? "text-amber-500"
                                    : "text-foreground"
                                )}
                              >
                                {item.stock ?? 0}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-primary hover:text-white"
                                    onClick={() =>
                                      handleUpdateStock(item.id, 1)
                                    }
                                    disabled={updatingStockId === item.id}
                                  >
                                    {updatingStockId === item.id ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <Plus className="size-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>增加库存</TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="h-16 px-2 text-sm text-muted-foreground text-center">
                          {item.lastOpenedAt
                            ? format(
                                new Date(item.lastOpenedAt),
                                "yyyy-MM-dd",
                                {
                                  locale: zhCN,
                                }
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="h-16 px-2 text-center">
                          <TooltipProvider>
                            <div className="flex items-center justify-center gap-1">
                              {status ? (
                                <Badge
                                  variant="ghost"
                                  className={cn(
                                    "border-0 font-medium min-w-[56px] justify-center",
                                    status.bg,
                                    status.color
                                  )}
                                >
                                  {status.label}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground min-w-[56px] text-center">
                                  -
                                </span>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-7 w-7",
                                      remainingDays !== null &&
                                        remainingDays < 0
                                        ? "text-destructive hover:bg-destructive hover:text-white"
                                        : "hover:bg-primary hover:text-white",
                                      replacingId === item.id && "opacity-50"
                                    )}
                                    onClick={() => handleReplace(item.id)}
                                    disabled={
                                      replacingId === item.id ||
                                      (item.stock ?? 0) < 1
                                    }
                                  >
                                    {replacingId === item.id ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <RefreshCWIcon size={14} />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  更换 (库存-1, 重置日期)
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-7 w-7 transition-colors",
                                      item.notifyAdvanceDays > 0
                                        ? "text-primary hover:bg-primary hover:text-white"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                      updatingNotifyId === item.id &&
                                        "opacity-50"
                                    )}
                                    onClick={() =>
                                      handleToggleNotification(
                                        item.id,
                                        item.notifyAdvanceDays <= 0
                                      )
                                    }
                                    disabled={updatingNotifyId === item.id}
                                  >
                                    {updatingNotifyId === item.id ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : item.notifyAdvanceDays > 0 ? (
                                      <Bell className="size-4" />
                                    ) : (
                                      <BellOff className="size-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {item.notifyAdvanceDays > 0
                                    ? `提前 ${item.notifyAdvanceDays} 天提醒 (点击关闭)`
                                    : "提醒已关闭 (点击开启)"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="h-16 pl-2 pr-4 text-center">
                          <TooltipProvider>
                            <div className="flex items-center justify-center gap-0.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-block">
                                    <AddItemModal
                                      item={item}
                                      categories={categories}
                                    >
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-primary hover:text-white"
                                      >
                                        <Pencil className="size-3.5" />
                                      </Button>
                                    </AddItemModal>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>编辑</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-7 w-7 hover:bg-indigo-500 hover:text-white",
                                      item.isArchived && "text-indigo-500",
                                      archivingId === item.id && "opacity-50"
                                    )}
                                    onClick={() =>
                                      handleToggleArchive(
                                        item.id,
                                        item.isArchived
                                      )
                                    }
                                    disabled={archivingId === item.id}
                                  >
                                    {archivingId === item.id ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <Archive className="size-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {item.isArchived ? "取消归档" : "归档"}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:bg-destructive hover:text-white"
                                    onClick={() => setItemToDelete(item.id)}
                                    disabled={deletingId === item.id}
                                  >
                                    {deletingId === item.id ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <Trash2Icon className="size-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>删除</TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle>确认删除？</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除此物品吗？此操作将永久删除该物品及其所有数据。该操作无法撤销。
              </AlertDialogDescription>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
