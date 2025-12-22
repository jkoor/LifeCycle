### 📅 开发计划：Inventory (库存管理) 页面

#### 1. 核心目标与架构分析

* **目标**：将 `app/inventory/page.tsx` 从一个简单的统计看板升级为功能完整的库存管理主界面。
* **数据模型映射** (`prisma/schema.prisma`)：
* 主要数据：`Item` 表。
* 关联数据：`Category` (分类), `Tag` (标签), `UsageLog` (用于计算状态)。
* 关键字段：`name`, `stock`, `expirationDate` (计算即将过期), `image`, `categoryId`。


* **技术策略**：
* **SSR (RSC)**: 页面主体为服务端组件，直接通过 Prisma 获取数据。
* **URL State (`nuqs`)**: 搜索关键词、排序方式、视图模式（列表/卡片）的状态通过 URL 参数管理，确保可分享和刷新保持。
* **响应式设计**: 桌面端使用 `Table` 组件，移动端使用 `Card` 组件网格。



---

#### 2. 组件架构拆解

我们将页面拆分为以下模块，遵循 "Shadcn First" 和 "Composition" 原则：

* `app/inventory/page.tsx`: 主页面（RSC），负责数据获取和 Suspense 边界。
* `components/features/inventory/`:
* `inventory-header.tsx`: 页面标题、面包屑、"新增物品" 按钮（触发 Sheet 或 Dialog）。
* `inventory-toolbar.tsx`: 搜索框、筛选器（分类/状态）、视图切换器（仅移动端或响应式控制）。
* `inventory-list-view.tsx`: 桌面端表格视图 (`<Table>`)。
* `inventory-grid-view.tsx`: 移动端/画廊模式卡片视图 (`<Card>`)。
* `inventory-empty-state.tsx`: 空状态展示。
* `item-status-badge.tsx`: 封装状态逻辑（正常/低库存/即将过期）的 Badge 组件。



---

#### 3. 详细实施步骤

##### 阶段一：页面骨架与布局 (Layout & Skeleton)

* **任务**: 修改 `app/inventory/page.tsx`，移除或重构旧的统计卡片（可视情况保留为顶部摘要），建立新的布局结构。
* **布局考量**:
* 利用 `app/layout.tsx` 中已有的 `pb-20 md:pb-0` 处理移动端底部导航遮挡。
* 使用 `container mx-auto p-4` 保持一致的内边距。


* **Action Item**:
* 创建 `InventoryHeader` 组件，包含 `H1` 标题和 `<Button size="sm"><Plus /> 新增物品</Button>`。
* 按钮应使用 `lucide-animated` 图标增强交互感。



##### 阶段二：数据获取 (Server State)

* **任务**: 在 `page.tsx` 中编写 Prisma 查询。
* **查询逻辑**:
```typescript
// 伪代码示例
const items = await prisma.item.findMany({
  where: { userId: session.user.id }, // 必须基于当前用户筛选
  include: { category: true, tags: true },
  orderBy: { updatedAt: 'desc' }
});

```


* **类型定义**: 使用 `Prisma.ItemGetPayload` 推断 TypeScript 类型，确保类型安全。

##### 阶段三：桌面端视图 - 表格 (Desktop View)

* **组件**: `InventoryTable` (基于 `components/ui/table`)。
* **列规划**:
1. **图片/名称**: 组合显示，图片作为缩略图 (`<Avatar>` 或 `<Image>`)。
2. **分类**: 显示 Category Icon 和名称。
3. **库存**: 显示 `stock` 数量，低库存时高亮。
4. **状态**: 基于 `expirationDate` 和 `lifespanDays` 计算出的 Badge。
5. **操作**: 行末的 "..." 下拉菜单 (编辑、删除、调整库存)。


* **响应式**: 使用 Tailwind 的 `hidden md:table` 类，确保仅在桌面端显示。

##### 阶段四：移动端视图 - 卡片 (Mobile View)

* **组件**: `InventoryGrid` (基于 `div.grid` 和 `components/ui/card`)。
* **设计**:
* 卡片头部：图片 + 名称 + 状态 Badge。
* 卡片内容：关键属性（库存、过期时间）。
* 卡片底部：快捷操作按钮（+1 / -1 库存）。


* **响应式**: 使用 `block md:hidden` 类，确保仅在移动端显示。

##### 阶段五：状态管理与交互 (Nuqs Integration)

* **任务**: 实现搜索和筛选。
* **工具**: `nuqs` (Type-safe search params state manager)。
* **实现**:
* 在 `search-params.ts` 中定义解析器：
```typescript
export const inventoryParams = {
  q: parseAsString.withDefault(''), // 搜索词
  sort: parseAsString.withDefault('updatedAt'), // 排序
  view: parseAsString.withDefault('table'), // 视图模式
}

```


* `InventoryToolbar` 组件是一个 Client Component，使用 `useQueryStates` 更新 URL。
* `page.tsx` 读取 `searchParams` prop 并传递给 Prisma `where` 子句。
* **注意**: 必须将使用了 `useSearchParams` 的组件包裹在 `<Suspense>` 中。



##### 阶段六：空状态与加载状态 (Empty & Loading)

* **Empty State**: 当数据库无数据或搜索无结果时，显示 `components/ui/empty.tsx`（如果已存在）或自定义设计。
* 内容：插画、"还没有物品"提示、"立即创建"引导按钮。


* **Loading UI**: 创建 `app/inventory/loading.tsx`，使用 `Skeleton` 组件模拟表格和卡片的加载形态，防止页面抖动。

---

#### 4. 开发清单 CheckList

| 步骤 | 任务描述 | 相关文件 | 优先级 |
| --- | --- | --- | --- |
| 1 | **基础结构**: 修改 `page.tsx`，引入 `InventoryHeader` 和布局容器。 | `app/inventory/page.tsx` | High |
| 2 | **数据层**: 定义 Prisma 查询，获取当前用户的 Item 列表。 | `app/inventory/page.tsx` | High |
| 3 | **组件开发**: 创建 `InventoryItemCard` (移动端) 组件骨架。 | `components/features/inventory/` | High |
| 4 | **组件开发**: 创建 `InventoryTable` (桌面端) 组件骨架。 | `components/features/inventory/` | High |
| 5 | **交互**: 添加 "新增物品" 按钮（暂时仅做 UI 占位或 log 输出）。 | `app/inventory/page.tsx` | Mid |
| 6 | **状态**: 集成 `nuqs`，实现基础的搜索框 UI (逻辑可稍后连接)。 | `components/features/inventory/toolbar.tsx` | Mid |
| 7 | **UI 优化**: 添加空状态 (`EmptyState`) 和加载骨架屏 (`loading.tsx`)。 | `app/inventory/loading.tsx` | Low |

#### 5. 代码结构预览

建议按照以下结构开始编写 `app/inventory/page.tsx`：

```tsx
import { Suspense } from 'react';
import { InventoryHeader } from '@/components/features/inventory/inventory-header';
import { InventoryList } from '@/components/features/inventory/inventory-list';
import { InventoryToolbar } from '@/components/features/inventory/inventory-toolbar';
import { getItems } from '@/lib/actions/inventory'; // 建议封装数据获取逻辑

// 定义 URL 参数类型
type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function InventoryPage({ searchParams }: PageProps) {
  // 1. 解析参数
  const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;

  // 2. 数据获取 (Server Side)
  // const items = await getItems(query); 

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* 头部：标题 + 新增按钮 */}
      <InventoryHeader />

      {/* 工具栏：搜索 + 筛选 (Client Component) */}
      <Suspense fallback={<div>Loading toolbar...</div>}>
         <InventoryToolbar />
      </Suspense>

      {/* 数据展示区域 */}
      <Suspense fallback={<div>Loading items...</div>}>
         {/* InventoryList 内部根据屏幕宽度渲染 Table 或 Grid */}
         <InventoryList query={query} />
      </Suspense>
    </div>
  );
}

```
