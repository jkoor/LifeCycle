"use client"

import { useState, useEffect } from "react"
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
import { Category } from "@prisma/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { InventoryItem } from "@/types/inventory"

interface AddItemModalProps {
  children?: React.ReactNode
  item?: InventoryItem
  categories: Category[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddItemModal({
  children,
  item,
  categories,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: AddItemModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = setControlledOpen ?? setInternalOpen

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(data: ItemFormValues) {
    try {
      let result
      if (item?.id) {
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
          description: item?.id ? "Item updated" : "Item created",
        })
        setOpen(false)
        router.refresh()
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      })
    }
  }

  // Pre-process default values
  const defaultValues: Partial<ItemFormValues> = item
    ? {
        name: item.name,
        categoryId: item.categoryId,
        brand: item.brand || undefined,
        image: item.image || undefined,
        note: item.note || undefined,
        stock: item.stock,
        // Item type from page has price as number, ensuring compatibility
        price: item.price ? Number(item.price) : undefined,
        lastOpenedAt: item.lastOpenedAt || undefined,
        lifespanDays: item.lifespanDays ?? 0,
        expirationDate: item.expirationDate || undefined,
        // If notifyAdvanceDays is -1, treat as disabled
        notifyEnabled: item.notifyAdvanceDays !== -1,
        notifyAdvanceDays:
          item.notifyAdvanceDays === -1 ? 3 : item.notifyAdvanceDays,
        tags: item.tags?.map((t) => t.name) || [],
      }
    : {
        stock: 1,
        notifyAdvanceDays: 3,
        notifyEnabled: true,
        tags: [],
      }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{item ? "编辑物品" : "添加新物品"}</DialogTitle>
            <DialogDescription>
              {item ? "在此修改物品详细信息。" : "添加一个新的物品到库存。"}
            </DialogDescription>
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

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent className="h-[95vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{item ? "编辑物品" : "添加新物品"}</DrawerTitle>
          <DrawerDescription>
            {item ? "在此修改物品详细信息。" : "添加一个新的物品到库存。"}
          </DrawerDescription>
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
