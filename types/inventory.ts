import { Prisma } from "@prisma/client"

export type ItemWithRelations = Prisma.ItemGetPayload<{
  include: {
    category: true
    tags: true
  }
}>

export type InventoryItem = Omit<ItemWithRelations, "price"> & {
  price: number
}
