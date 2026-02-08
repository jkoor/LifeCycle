"use client"

import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ItemForm } from "./item-form"
import { ItemFormValues } from "@/lib/schemas/item-schema"
import { createItem, updateItem } from "@/app/actions/item"
import type { Category } from "@/generated/prisma/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { InventoryItem } from "@/types/inventory"

interface ItemModalProps {
  children?: React.ReactNode
  item?: InventoryItem
  categories: Category[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * 将 InventoryItem 转换为表单默认值
 * 处理数据类型转换和默认值填充
 */
function transformItemToFormValues(
  item?: InventoryItem
): Partial<ItemFormValues> {
  if (!item) {
    return {
      stock: 1,
      notifyAdvanceDays: 3,
      notifyEnabled: true,
      tags: [],
    }
  }

  return {
    name: item.name,
    categoryId: item.categoryId,
    brand: item.brand || undefined,
    image: item.image || undefined,
    note: item.note || undefined,
    stock: item.stock,
    // 库存锁定状态
    isStockFixed: item.isStockFixed ?? false,
    // 规格信息
    quantity: item.quantity ?? undefined,
    unit: item.unit || "个",
    // 确保 price 是数字类型
    price: item.price ? Number(item.price) : undefined,
    lastOpenedAt: item.lastOpenedAt || undefined,
    lifespanDays: item.lifespanDays ?? 0,
    // 保质期（天）
    shelfLifeDays: item.shelfLifeDays ?? undefined,
    expirationDate: item.expirationDate || undefined,
    // notifyAdvanceDays 为 -1 时表示禁用通知
    notifyEnabled: item.notifyAdvanceDays !== -1,
    notifyAdvanceDays:
      item.notifyAdvanceDays === -1 ? 3 : item.notifyAdvanceDays,
    tags: item.tags?.map((t) => t.name) || [],
  }
}

export function ItemModal({
  children,
  item,
  categories,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ItemModalProps) {
  // 支持受控和非受控模式
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const { toast } = useToast()
  const router = useRouter()

  const isEditing = !!item?.id

  /**
   * 处理表单提交
   * 根据是否有 item.id 决定是创建还是更新
   */
  async function handleSubmit(data: ItemFormValues) {
    try {
      let result
      if (isEditing) {
        result = await updateItem(item.id, data)
      } else {
        result = await createItem(data)
      }

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else {
        toast({
          title: "Success",
          description: isEditing ? "物品已更新" : "物品已创建",
        })
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to submit item form:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "操作失败，请重试",
      })
    }
  }

  const defaultValues = transformItemToFormValues(item)
  const title = isEditing ? "编辑物品" : "添加新物品"
  const description = isEditing
    ? "在此修改物品详细信息。"
    : "添加一个新的物品到库存。"

  // 桌面端使用 Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ItemForm
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            defaultValues={defaultValues}
          />
        </DialogContent>
      </Dialog>
    )
  }

  // 移动端使用 Drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent className="h-[95vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto pb-8">
          <ItemForm
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            defaultValues={defaultValues}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// 保留旧名称的别名导出，方便迁移
export { ItemModal as AddItemModal }
