# 物品管理模块重构计划：原子化架构与逻辑解耦

## 1. 核心目标 (Vision & Objectives)

本计划旨在解决当前物品管理模块中逻辑高度耦合、代码重复（列表页与卡片页逻辑重复）、以及复用性差的问题。通过引入**原子化设计 (Atomic Design)** 和 **自定义 Hooks**，实现以下目标：

- **单一事实来源 (Single Source of Truth)**：所有物品操作逻辑（删除、更新库存、更换等）收敛至一个 Hook，不再散落在各个 UI 组件中。
- **极致复用 (Maximum Reusability)**：UI 拆分为原子组件，可在 Dashboard、列表、卡片、移动端视图中自由组合。
- **一致性体验 (Consistent UX)**：无论在何处操作物品，交互反馈（Loading、Toast、乐观更新）保持完全一致。

---

## 2. 推荐目录结构 (Directory Structure)

建议调整 `components/features/inventory` 目录结构如下：

```text
components/features/inventory/
├── atoms/                      # [新建] 原子UI组件（纯展示，无复杂业务逻辑，或仅绑定简单交互）
│   ├── item-avatar.tsx         # 统一处理图片、Fallback、Logo裁剪
│   ├── item-status-badge.tsx   # (现有) 剩余天数/过期状态徽章
│   ├── item-stock-control.tsx  # 库存加减组件 (含 Loading 状态)
│   ├── item-action-buttons.tsx # 操作按钮组 (编辑、归档、删除、更换)
│   └── item-tags-list.tsx      # 标签与品牌展示
├── hooks/                      # [新建] 业务逻辑层
│   └── use-inventory-item.ts   # 核心 Hook，封装所有 Server Actions
├── cards/                      # [新建] 组合层 - 卡片视图
│   ├── inventory-grid-card.tsx # (原 inventory-card.tsx 重构)
│   └── inventory-mobile-row.tsx # [新建] 移动端专用紧凑行组件
├── table/                      # [新建] 组合层 - 列表视图
│   └── inventory-table-row.tsx # 桌面端列表行组件
├── inventory-list-view.tsx     # 主入口 (负责布局切换、数据获取)
└── item-form.tsx               # 表单组件
```

---

## 3. 实施步骤 (Implementation Phase)

### Phase 1: 逻辑抽离 (The Brain)

**任务**：创建 `useInventoryItem` Hook。

**文件**：`components/features/inventory/hooks/use-inventory-item.ts`

**需封装的功能**：

1.  **库存管理**：`updateStock(delta)`，包含乐观更新或 Loading 状态。
2.  **生命周期**：`replaceItem()` (一键更换) 和 `undoReplace()`。
3.  **状态管理**：`toggleArchive()`, `toggleNotification()`。
4.  **删除操作**：`deleteItem()`。
5.  **辅助计算**：`getRemainingDays()`, `getStatusColor()` (从组件中移出，变为纯函数或 Hook 计算属性)。

**API 设计预览**：

```typescript
const { isUpdating, handleUpdateStock, handleReplace, daysRemaining, status } =
  useInventoryItem(item)
```

### Phase 2: UI 原子化 (The Bricks)

**任务**：将现有大组件拆解为原子组件。

1.  **`item-avatar.tsx`**:

    - 逻辑：统一处理 `item.image` 存在时的圆角、裁剪，不存在时的 `AvatarFallback` 颜色和缩写。
    - 目标：列表和卡片只传 `item` 或 `src/name` 即可获得一致显示。

2.  **`item-stock-control.tsx`**:

    - 逻辑：包含 `+` 按钮、`-` 按钮、库存数字显示。
    - 交互：内部直接调用 `handleUpdateStock` (通过 Props 传入或 Context)。
    - 视觉：处理 Loading 旋转图标。

3.  **`item-action-buttons.tsx`**:

    - 逻辑：封装 Edit (Modal Trigger), Replace, Archive, Delete 等按钮。
    - 变化：支持 `variant` (如图标模式 vs 下拉菜单模式) 以适应不同容器。

4.  **`item-tags-list.tsx`**:
    - 逻辑：处理 Tag 的渲染，超过一定数量显示 `+N`。

### Phase 3: 组合与重构 (The Buildings)

**任务**：使用原子组件重建主要视图。

1.  **重构 `InventoryCard` (Grid View)**:

    - 使用 `useInventoryItem` 获取逻辑。
    - 布局：`ItemAvatar` (Top/Left) + `ItemStatusBadge` (Top/Right) + `ItemStockControl` (Bottom)。
    - 删除原有的大量内联函数。

2.  **重构 `InventoryListView` (Table View)**:

    - 创建 `InventoryTableRow` 组件，剥离出 `inventory-list-view.tsx` 中的 `map` 循环内部内容。
    - 在 Row 组件中使用 Hook 和原子组件。

3.  **新建 `InventoryMobileRow` (Mobile List View)**:
    - 设计为移动端优化的点击区域。
    - 极其精简：Avatar + Name + StatusBadge。
    - 点击触发 Drawer (详情页)。

---

## 4. 开发规范 (Guidelines)

1.  **Prop Drilling vs Composition**: 尽量保持原子组件纯粹，通过 Props 接收数据。对于复杂交互（如 Modal），尽量在父级控制显隐，或使用全局 Context/Store。
2.  **Tailwind Class 复用**: 很多按钮样式是一样的（`ghost`, `size="icon"`, `h-7 w-7`），建议在 `item-action-buttons.tsx` 中定义常量或基础组件来复用这些样式，避免 Copy-Paste 错误。
3.  **Loading 态统一**: 所有异步操作（删除、更新）必须有明确的 Loading UI（通常是 Icon 转圈），由 Hook 的 `isUpdating` 状态驱动。
4.  **移动端优先**: 任何新组建都要考虑在手机屏幕上的触摸尺寸 (Touch Targets 至少 44x44px 建议，或者视觉小但在点击时有 Padding)。

## 5. 后续行动 (Next Steps)

建议按照 **Phase 1 -> Phase 2 -> Phase 3** 的顺序执行。
首先请确认是否开始 **Phase 1：创建 `useInventoryItem` Hook**？
