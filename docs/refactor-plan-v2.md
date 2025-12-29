# 开发重构计划：生命周期逻辑升级 (v2)

基于最新的需求沟通，我们确定了以 **“极简实用”** 为核心的重构方向。本计划旨在解决过期逻辑 Bug、增强单位管理，并引入“固定库存”概念以兼容订阅制服务。

## 1. 核心变更点

1.  **修复过期逻辑 Bug**：废弃“硬性过期日期 (Date)”，改为“保质期天数 (Duration)”。
    - _问题_：从绝对日期（2025-12-01）改为相对天数（如 365 天）。每次“换新”时，基于当前时间自动计算新的到期日。
2.  **引入单位系统**：增加 `unit` 和 `quantity`，支持非整数消耗（如 500g, 100ml），使计算更精确。
3.  **固定库存模式**：通过 `isStockFixed` 标记，支持订阅制/无限续杯场景，锁定库存不扣减。

## 2. 数据库变更 (Schema Changes)

### 2.1 修改 `Item` 模型

位置：`prisma/schema.prisma`

需要进行以下 Schema 变更：

1.  **废弃 `expirationDate`** (DateTime): 删除或改名为 `legacyExpirationDate`（用于数据迁移）。
2.  **新增 `shelfLifeDays`** (Int): 代表“保质期天数”（硬性限制）。
3.  **新增 `unit`** (String): 计量单位，如 "个", "ml", "g"。
4.  **新增 `quantity`** (Float): 规格数量，默认为 1。例如一瓶是 500 (ml)。
5.  **新增 `isStockFixed`** (Boolean): 此前沟通的“固定库存”开关。

```prisma
model Item {
  // ...

  // [NEW] 1. 保质期逻辑修正
  // expirationDate DateTime? // 移除：绝对日期不适合循环物品
  shelfLifeDays    Int?      // 新增：相对保质期（如 365天）

  // [EXISTING] 2. 软性使用寿命
  lifespanDays     Int?      // 建议使用时长（开封后）

  // [NEW] 3. 单位与规格
  unit             String    @default("个") // 单位
  quantity         Float     @default(1)    // 单件规格 (如 500, 1)

  // [NEW] 4. 库存行为
  isStockFixed     Boolean   @default(false) // 是否锁定库存（订阅制专用）

  // ...
}
```

## 3. 业务逻辑重构 (Core Logic)

### 3.1 剩余时间/进度计算 (`utils.ts`)

我们不再比较两个静态日期，而是并在运行时动态计算两个“截止点”，取较早的那个。

**计算公式：**

1.  **开封失效点 (Use-by Date)** = `lastOpenedAt` + `lifespanDays`
2.  **保质失效点 (Best-by Date)** = `lastOpenedAt` (或购买日) + `shelfLifeDays`
3.  **实际剩余天数** = `Min(Use-by, Best-by) - Today`

### 3.2 换新/续费逻辑 (`Server Actions`)

当用户点击“换新/续费/Reset”时：

- **普通物品** (`isStockFixed: false`): 库存 `-1` (或 `-quantity`)，重置 `lastOpenedAt = Now`。
- **固定物品** (`isStockFixed: true`): 库存 **不变**，重置 `lastOpenedAt = Now`。

## 4. UI 适配与改造

### 4.1 物品表单 (ItemForm)

- **库存部分**：增加 "锁定库存 (Fix Stock)" 开关：使用lock/unlock图标，输入框为灰色。
- **单位部分**：新增“规格”输入行。
  - 例如：[ 500 ] [ ml ] / [ 1 ] [ 个 ]
- **时间部分**：
  - 移除“过期日期”选择器。
  - 改为“保质期”输入框 (与lifespanDays一致)。

### 4.2 列表/卡片 (InventoryListView)

- 库存展示：
  - 如果 `isStockFixed`，显示 【锁定】 图标。同时，加减按钮变为不可用状态。
  - 取消库存不同颜色提醒，统一颜色
- 规格信息：添加规格信息，如 500 ml
- 剩余天数：使用数字而不是badge组件，取消剩余天数不同颜色状态提醒；同时支持负数用来代表过期时间，仅将0和负数设置字体颜色用于提醒
- 状态信息：在物品后面插入状态一栏，用于显示物品状态（调用物品状态组件）

## 5. 迁移策略 (Migration)

由于我们要删除 `expirationDate` 字段，需要写一个迁移脚本：

- 如果旧数据有 `expirationDate`，直接设为 Null 并提醒用户重新录入。
- `unit` 默认为 "个"，`quantity` 默认为 1。

## 6. 执行清单 (Checklist)

1.  [ ] **Schema**: 修改 `prisma/schema.prisma` 并运行 `migrate dev`。
2.  [ ] **Types**: 更新前端 TypeScript 类型定义。
3.  [ ] **Logic**: 重写 `getRemainingDays` 和 `getExpirationDate` 工具函数。
4.  [ ] **UI (Form)**: 改造 ItemForm 支持新字段（Unit, ShelfLife, FixedStock）。
5.  [ ] **UI (List)**: 适配列表页的显示逻辑。
6.  [ ] **Actions**: 更新 `create` / `update` / `use` 逻辑。

---

请审阅此方案。确认无误后，我将按顺序执行。
