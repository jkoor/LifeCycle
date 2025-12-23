import { z } from "zod"

export const itemFormSchema = z.object({
  id: z.string().optional(), // For edit mode
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),

  // Optional fields need to be handled carefully (empty string vs undefined)
  brand: z.string().optional(),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
  note: z.string().optional(),

  // Numbers need coercion because inputs usually return strings
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(1),
  price: z.coerce.number().min(0, "Price cannot be negative").optional(),

  // Dates
  lastOpenedAt: z.date().optional(),
  lifespanDays: z.coerce
    .number()
    .int()
    .min(1, "Lifespan must be at least 1 day")
    .optional()
    .or(z.literal(0)),
  expirationDate: z.date().optional(),

  // Notification
  // Maps to notifyAdvanceDays.
  // We'll use a separate form state for "enabled", but the schema validates the day count.
  notifyAdvanceDays: z.coerce.number().int().min(0).max(10).default(3),
  notifyEnabled: z.boolean().default(true),

  tags: z.array(z.string()).default([]),
})

export type ItemFormValues = z.infer<typeof itemFormSchema>
