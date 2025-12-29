# UsageLog Refactoring Design Proposal

## 1. Requirement Analysis

The goal is to redesign the `UsageLog` table to act as a **history snapshot** for item replacements.

**Key Objectives:**

1.  **Snapshot Recording**: Capture the exact state of the item (name, brand, price, note, unit, quantity) at the moment of replacement.
2.  **Trigger Point**: Create a log entry automatically when the "Replace" (Start Using) action is performed.
3.  **Undo Support**: Allow the user to "Undo" the replacement, which should revert the item state and **delete** the corresponding log entry.
4.  **Data Integrity**: When an `Item` is deleted, its entire history (`UsageLog`) must be deleted automatically.

---

## 2. Schema Redesign (`prisma/schema.prisma`)

I propose replacing the existing `UsageLog` model with the following structure. This model focuses on immutable snapshots rather than generic "actions".

```prisma
// ==========================================
// 📊 Tracking Module
// ==========================================

model UsageLog {
  id              String   @id @default(cuid())

  // -- Snapshot Data (Captured at time of replacement) --
  // We explicitly copy these fields to preserve history
  // even if the original item details are changed later.
  itemName        String
  itemBrand       String?
  itemPrice       Decimal?
  itemNote        String?
  itemUnit        String   // e.g., "piece", "ml"
  itemQuantity    Float    // e.g., 500 (ml)

  // -- Action Metadata --
  replacedAt      DateTime @default(now()) // The time of replacement

  // -- Relations --
  itemId          String
  item            Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)

  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // -- Indexes --
  @@index([itemId])
  @@index([userId])
  @@index([replacedAt])
}
```

### Analysis of Fields

- **Snapshot Fields (`item*`)**: These fields mirror the `Item` fields. Using the `item` prefix (e.g., `itemName`) helps distinguish them from the relation fields and clarify that they are historical snapshots.
- **`replacedAt`**: Records strictly when the replacement happened.
- **`onDelete: Cascade`**: Ensures that deleting the `User` or `Item` automatically wipes the associated logs.

---

## 3. Logic Implementation Plan

### A. Action: Replace Item (`replaceItem`)

We will wrap the logic in a **Transaction** to ensure data consistency.

**Flow:**

1.  Verify Item ownership and stock level.
2.  Prepare Snapshot Data from the current Item state.
3.  **Transaction**:
    - Update `Item` (decrement stock, update `lastOpenedAt`).
    - Create `UsageLog` (Snapshot).
4.  **Return**: The new `usageLog.id` (along with previous state) to the client to support the Undo feature.

**Pseudo-code (Server Action):**

```typescript
export async function replaceItem(id: string) {
  // ... check auth ...

  // 1. Fetch current item state
  const item = await prisma.item.findUnique(...)
  // ... check stock ...

  // 2. Transaction
  const [updatedItem, newLog] = await prisma.$transaction([
    // Update Item
    prisma.item.update({
      where: { id },
      data: {
        stock: item.isStockFixed ? item.stock : item.stock - 1,
        lastOpenedAt: new Date(),
      }
    }),
    // Create Log Snapshot
    prisma.usageLog.create({
      data: {
        userId: session.user.id,
        itemId: item.id,
        itemName: item.name,
        itemBrand: item.brand,
        itemPrice: item.price,
        itemNote: item.note,
        itemUnit: item.unit,
        itemQuantity: item.quantity,
        replacedAt: new Date(),
      }
    })
  ])

  // 3. Return data for Undo
  return {
    success: true,
    previousStock: item.stock,
    previousDate: item.lastOpenedAt,
    usageLogId: newLog.id // <--- Essential for Undo
  }
}
```

### B. Action: Undo Replace (`undoReplaceItem`)

We need to update the signature to accept `usageLogId`.

**Flow:**

1.  **Transaction**:
    - Revert `Item` state (stock + `lastOpenedAt`) using the provided previous values.
    - Delete the `UsageLog` entry using `usageLogId`.

**Pseudo-code (Server Action):**

```typescript
export async function undoReplaceItem(
  id: string,
  previousStock: number,
  previousDate: string | null,
  usageLogId?: string // <--- New Parameter
) {
  // ... check auth ...

  const queries = [
    // Revert Item
    prisma.item.update({
      where: { id },
      data: {
        stock: previousStock,
        lastOpenedAt: previousDate ? new Date(previousDate) : null,
      },
    }),
  ]

  // Delete Log if ID is provided
  if (usageLogId) {
    queries.push(
      prisma.usageLog.delete({
        where: { id: usageLogId },
      })
    )
  }

  await prisma.$transaction(queries)

  return { success: true }
}
```

## 4. Summary of Benefits

1.  **Historical Accuracy**: By snapshotting `price`, `brand`, etc., the analysis remains accurate even if the user changes the item description later (e.g., renames "Colgate Toothpaste" to "Toothpaste").
2.  **Transactional Integrity**: Using `prisma.$transaction` ensures we never have a "ghost log" without a stock deduction, or vice versa, especially during undo operations.
3.  **Clean Up**: The `onDelete: Cascade` rule in Schema handles the cleanup requirement perfectly without extra code.

## 5. Next Steps

1.  Apply schema changes to `prisma/schema.prisma`.
2.  Run `prisma migrate dev` or `prisma db push` to update the database.
3.  Refactor `app/actions/item.ts` to implement the logic above.
4.  Update the frontend `ItemCard` / `ItemRow` components to pass the `usageLogId` to the Undo handler.
