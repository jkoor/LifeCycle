# 物品状态自定义指南

本文档说明如何自定义修改物品状态系统，包括自定义状态文字、添加/删除/排序状态等。

## 目录

- [架构概述](#架构概述)
- [自定义状态文字](#自定义状态文字)
- [修改阈值](#修改阈值)
- [添加新状态](#添加新状态)
- [删除状态](#删除状态)
- [调整状态优先级](#调整状态优先级)
- [自定义状态图标](#自定义状态图标)

---

## 架构概述

状态系统采用 **Single Source of Truth** 设计模式，所有状态逻辑集中在：

```
components/modules/item/
├── types.ts      # 类型定义 (ItemLifecycleStatus, ItemStatusState)
├── utils.ts      # 核心逻辑 (getItemStatus, 阈值常量)
├── hooks/        # Hook 层 (useItem)
└── ui/           # UI 层 (ItemStatus)
```

**数据流向**：

```
getItemStatus(item) → ItemStatusState → UI 组件渲染
```

---

## 自定义状态文字

### 修改现有状态的显示文本

编辑 `utils.ts` 中的 `getItemStatus` 函数：

```typescript
// utils.ts

export function getItemStatus(item: InventoryItem): ItemStatusState {
  // ...

  // 修改"缺货"状态的显示文本
  if (stock <= 0) {
    return {
      key: "out_of_stock",
      label: "无库存", // ← 修改这里
      variant: "destructive",
      description: "请及时补货", // ← 可选的详细描述
      icon: Package,
    }
  }

  // ...
}
```

### 常见自定义示例

| 状态            | 默认文本     | 自定义示例               |
| --------------- | ------------ | ------------------------ |
| `out_of_stock`  | "缺货"       | "无库存"、"已售罄"       |
| `expired`       | "已过期"     | "过期"、"失效"           |
| `expiring_soon` | "X 天后过期" | "即将到期"、"请尽快使用" |
| `low_stock`     | "库存不足"   | "库存紧张"、"需补货"     |
| `healthy`       | "正常"       | "良好"、"✓"              |

---

## 修改阈值

### 调整"即将过期"警告天数

```typescript
// utils.ts

/** 即将过期警告天数阈值 */
export const THRESHOLD_EXPIRING_SOON_DAYS = 7 // ← 改为 14 提前 2 周警告
```

### 调整"低库存"警告数量

```typescript
// utils.ts

/** 低库存警告阈值 */
export const THRESHOLD_LOW_STOCK = 2 // ← 改为 5 表示库存少于 5 件时警告
```

**注意**：修改常量后，所有使用该状态的 UI 会自动更新。

---

## 添加新状态

### Step 1: 定义新状态键

编辑 `types.ts`：

```typescript
export type ItemLifecycleStatus =
  | "out_of_stock"
  | "expired"
  | "expiring_soon"
  | "low_stock"
  | "needs_attention" // ← 添加新状态
  | "healthy"
```

### Step 2: 实现状态逻辑

编辑 `utils.ts` 中的 `getItemStatus` 函数，按优先级顺序添加判断：

```typescript
export function getItemStatus(item: InventoryItem): ItemStatusState {
  const stock = item.stock ?? 0
  const daysLeft = getRemainingDays(item)

  // Priority 1: 缺货
  if (stock <= 0) {
    /* ... */
  }

  // Priority 2: 已过期
  if (daysLeft !== null && daysLeft < 0) {
    /* ... */
  }

  // Priority 3: 即将过期
  if (daysLeft !== null && daysLeft <= THRESHOLD_EXPIRING_SOON_DAYS) {
    /* ... */
  }

  // Priority 4: 需要关注 (新状态示例)
  if (item.needsReview) {
    // 假设有此字段
    return {
      key: "needs_attention",
      label: "待检查",
      variant: "info", // 使用 info 变体
      description: "该物品需要人工检查",
      icon: AlertCircle,
    }
  }

  // Priority 5: 库存不足
  if (stock < THRESHOLD_LOW_STOCK) {
    /* ... */
  }

  // Default: 正常
  return {
    /* ... */
  }
}
```

### Step 3: (可选) 在 UI 中处理新状态

如果新状态需要特殊 UI 处理，可在组件中检查：

```tsx
const { statusState } = useItem(item)

if (statusState.key === "needs_attention") {
  // 特殊处理
}
```

---

## 删除状态

### 移除现有状态

1. 从 `types.ts` 的 `ItemLifecycleStatus` 中删除对应键
2. 从 `utils.ts` 的 `getItemStatus` 中删除对应的 `if` 分支

**示例：删除 "低库存" 状态**

```typescript
// types.ts
export type ItemLifecycleStatus =
  | "out_of_stock"
  | "expired"
  | "expiring_soon"
  // | "low_stock"  ← 删除
  | "healthy"

// utils.ts - 删除对应的判断分支
export function getItemStatus(item: InventoryItem): ItemStatusState {
  // ...
  // 删除这段代码:
  // if (stock < THRESHOLD_LOW_STOCK) {
  //   return { key: "low_stock", ... }
  // }
  // ...
}
```

---

## 调整状态优先级

状态优先级由 `getItemStatus` 函数中的 `if` 语句顺序决定。

### 当前优先级（从高到低）

1. `out_of_stock` - 缺货
2. `expired` - 已过期
3. `expiring_soon` - 即将过期
4. `low_stock` - 库存不足
5. `healthy` - 正常

### 调整优先级

只需调整 `if` 语句的顺序：

```typescript
export function getItemStatus(item: InventoryItem): ItemStatusState {
  const stock = item.stock ?? 0
  const daysLeft = getRemainingDays(item)

  // 如果想让"已过期"优先级高于"缺货"
  // Priority 1: 已过期 (原来是 Priority 2)
  if (daysLeft !== null && daysLeft < 0) {
    return { key: "expired" /* ... */ }
  }

  // Priority 2: 缺货 (原来是 Priority 1)
  if (stock <= 0) {
    return { key: "out_of_stock" /* ... */ }
  }

  // ...
}
```

---

## 自定义状态图标

### 修改现有状态图标

```typescript
// utils.ts

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  ShoppingCart,
} from "lucide-react"

export function getItemStatus(item: InventoryItem): ItemStatusState {
  // ...

  if (stock <= 0) {
    return {
      key: "out_of_stock",
      label: "缺货",
      variant: "destructive",
      icon: ShoppingCart, // ← 换成购物车图标
    }
  }

  // ...
}
```

### 可用图标

可以使用 `lucide-react` 中的任何图标。常用推荐：

| 状态类型  | 推荐图标                             |
| --------- | ------------------------------------ |
| 危险/错误 | `AlertTriangle`, `XCircle`, `Ban`    |
| 警告      | `AlertCircle`, `Clock`, `Timer`      |
| 成功/正常 | `CheckCircle`, `Check`, `ThumbsUp`   |
| 库存相关  | `Package`, `ShoppingCart`, `Archive` |

---

## 完整示例：添加"需要补货"状态

```typescript
// types.ts
export type ItemLifecycleStatus =
  | "out_of_stock"
  | "expired"
  | "expiring_soon"
  | "low_stock"
  | "needs_restock" // 新增
  | "healthy"

// utils.ts
export const THRESHOLD_RESTOCK = 5 // 新增常量

export function getItemStatus(item: InventoryItem): ItemStatusState {
  const stock = item.stock ?? 0
  const daysLeft = getRemainingDays(item)

  if (stock <= 0) {
    /* out_of_stock */
  }
  if (daysLeft !== null && daysLeft < 0) {
    /* expired */
  }
  if (daysLeft !== null && daysLeft <= THRESHOLD_EXPIRING_SOON_DAYS) {
    /* expiring_soon */
  }
  if (stock < THRESHOLD_LOW_STOCK) {
    /* low_stock */
  }

  // 新增：需要补货（库存低于 5 但高于低库存阈值）
  if (stock < THRESHOLD_RESTOCK) {
    return {
      key: "needs_restock",
      label: "建议补货",
      variant: "info",
      description: `当前库存 ${stock} 件`,
      icon: ShoppingCart,
    }
  }

  return { key: "healthy" /* ... */ }
}
```

---

## 测试验证

修改后，运行 TypeScript 检查确保类型安全：

```bash
pnpm exec tsc --noEmit
```

由于 `getItemStatus` 是纯函数，可以编写单元测试：

```typescript
import { getItemStatus } from "./utils"

describe("getItemStatus", () => {
  it("returns expired when days < 0", () => {
    const item = { stock: 5, expirationDate: "2023-01-01" } as InventoryItem
    expect(getItemStatus(item).key).toBe("expired")
  })

  it("prioritizes out_of_stock over expired", () => {
    const item = { stock: 0, expirationDate: "2023-01-01" } as InventoryItem
    expect(getItemStatus(item).key).toBe("out_of_stock")
  })
})
```
