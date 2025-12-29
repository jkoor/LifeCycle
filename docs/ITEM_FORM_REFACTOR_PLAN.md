# ItemForm 组件改进方案

经过对 `components/modules/item/ui/item-form.tsx` 的代码审查，生成以下改进方案。本方案旨在确保代码严格符合项目的 [UI/Design Guidelines] 和 [Architecture] 规范。

## 1. 核心违规修复 (Priority: High)

根据规范 **"No Native Styling: DO NOT use native HTML/CSS styling"**，组件中现存的原生 HTML 标签必须被替换。

### A. 库存锁定按钮 (Line 344)

- **当前代码**: `<button type="button" ...>`
- **问题**: 使用了原生 button 配合 Tailwind 类名模拟交互，缺乏统一的 Focus 状态和按键反馈。
- **改进方案**: 替换为 Shadcn UI 的 `Button` 组件或项目公共组件 `IconButton`。
  ```tsx
  // 建议替换为
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className={cn("h-6 w-6", field.value && "bg-primary/10 text-primary")}
    onClick={() => ...}
  >
    {/* Icons */}
  </Button>
  ```

### B. 标签删除按钮 (Line 470)

- **当前代码**: `<button type="button" ...>`
- **问题**: 在 Badge 内部使用了原生 button。
- **改进方案**: 使用 `lucide-react` 的图标配合 `role="button"` 或者封装更小的交互组件。考虑到这是 Badge 内部的微交互，可以使用 `Button` 的 `ghost` 变体并调整 `size` 和 `padding`，或者简单的 `span` + `cursor-pointer` (如果不需要复杂的键盘交互)，但为了无障碍性，建议使用极小尺寸的 `Button` 或者是专门的 `Tag` 组件封装。

## 2. 架构与逻辑优化 (Priority: Medium)

### A. 逻辑解耦 (Separation of Concerns)

- **当前状态**: `handleCreateCategory` 直接调用 Server Action。
- **改进建议**: 虽然目前逻辑尚简，但为了遵循 DDD，建议将 "分类管理" 相关的逻辑（搜索、创建、状态维护）提取为一个 Custom Hook，例如 `useCategorySelect`。
  - **位置**: `components/modules/item/hooks/use-category-select.ts`
  - **收益**: 如果未来其他表单也需要选择或创建分类，该逻辑可直接复用。

### B. 类型依赖

- **当前状态**: `import { Category } from "@prisma/client"`
- **改进建议**: 尽量避免在 UI 组件中直接引用 Prisma Client 类型。建议在 `types/` 或 `components/modules/item/types.ts` 中定义纯前端使用的 DTO (Data Transfer Object) 类型，或者确认仅导入类型不会导致构建时的服务端代码泄露。

## 3. UI/UX 增强 (Priority: Low - "Wow" Factor)

### A. 动画与交互

- **建议**: 为 "生命周期与提醒" 卡片添加展开/收起的微动画，或者在 `Switch` 切换提醒开启时，下方的天数选择器使用 `Framer Motion` 或 CSS Transition 进行平滑展开，而不是生硬的条件渲染。
- **图标**: 主要操作按钮（如“保存物品”）可以使用 `lucide-animated` 增加 Hover 时的动态效果。

### B. 视觉优化

- **图片上传**: 目前的上传区域较为简朴。建议增加拖拽上传 (Drag & Drop) 的视觉反馈，或者在上传中状态显示 `Loader2` 动画。

## 4. 行动计划 (Action Plan)

1.  **执行替换**: 立即将所有原生 `<button>` 替换为 `<Button>` 组件。
2.  **样式微调**: 确保替换后的按钮在尺寸和边距上与原设计保持一致（特别是 Badge 内部的删除按钮）。
3.  **清理代码**: 移除未使用的导入（如有）。

