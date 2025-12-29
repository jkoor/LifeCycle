# 设计方案：归档物品 UI 与逻辑

## 1. 概述

为了解决如何显示归档物品的需求，我建议采用 **方案 1**：**“复用当前列表组件显示归档后的物品”**，并通过 URL 参数进行状态控制。

这种方法符合项目的 **领域驱动设计 (DDD)** 和 **用户体验 (UX)** 原则：

- **简洁性**：保持库存主页专注于显示的“活跃”物品，避免视觉混乱。
- **一致性**：复用现有的 `InventoryContainer`、`InventoryDesktopTable` 和 `InventoryMobileList` 组件，避免代码重复。
- **深度链接**：使用 `nuqs`（URL 参数）管理状态，使得“归档视图”可以被收藏或分享。

## 2. 详细设计

### A. URL 状态管理 (`search-params.ts`)

我们将引入一个新的搜索参数来控制视图模式。

```typescript
// app/inventory/search-params.ts
export const inventoryParams = {
  // ... 现有参数
  // 新增参数：用于切换“活跃”和“归档”物品视图
  // 默认为 false (显示活跃物品)
  isArchived: parseAsBoolean.withDefault(false),
}
```

### B. UI 变更

#### 1. 库存工具栏 (`inventory-toolbar.tsx`)

在工具栏右侧（排序下拉菜单旁）添加一个专门的“归档”切换开关或按钮。

- **交互**：点击时切换 URL 中的 `?isArchived=true` 参数。
- **视觉**：
  - **当前显示活跃物品时**：按钮显示“已归档(Archive)”图标（Ghost 风格）。
  - **当前显示归档物品时**：按钮高亮或变为“返回库存”，并提示当前处于“归档模式”。

#### 2. 视觉反馈 (上下提示)

当 `isArchived=true` 时：

- 页面应清楚地表明用户正处于“归档模式”。
- 我们可以更改空状态（Empty State）的文案，或者在列表顶部添加一个可关闭的提示条（Alert）。

#### 3. 物品操作 (`item-actions.tsx`)

物品上的可用操作应根据其状态进行调整：

- **归档物品**：
  - **编辑 (Restore/Un-archive)**：编辑功能。
  - **还原 (Restore/Un-archive)**：将物品移回活跃列表。
  - **删除**：永久删除。

### C. 数据获取 (`page.tsx`)

服务端数据获取逻辑需根据 `isArchived` 参数进行调整。

```typescript
// app/inventory/page.tsx
const { q, sortBy, sortDir, isArchived } = await searchParamsCache.parse(
  searchParams
)

const items = await prisma.item.findMany({
  where: {
    userId: session.user.id,
    isArchived: isArchived, // 动态过滤
    // ... 现有的搜索逻辑
  },
  // ...
})
```

## 3. 实施步骤

### 步骤 1: 更新 Search Params

- 修改 `app/inventory/search-params.ts`，加入 `isArchived` 参数定义。

### 步骤 2: 更新服务端逻辑

- 修改 `app/inventory/page.tsx`，读取 `isArchived` 参数并在 Prisma 查询中使用该参数进行过滤。

### 步骤 3: UI 实现

- **工具栏**：在 `inventory-toolbar.tsx` 中添加“查看归档 / 查看活跃”的切换逻辑。
- **行/卡片组件**：
  - 将 `isArchived` 上下文或属性传递给 `ItemRow` / `ItemCard`。
  - 更新 `ItemActions`：当物品处于归档状态时，显示“还原”而不是“归档”。

### 步骤 4: 添加“还原”服务端 Action

- 更新或确认 `app/actions/item.ts` 中的 `toggleArchive` 函数逻辑是否足够通用（通常只需要传入布尔值即可实现归档与还原的双向操作）。

