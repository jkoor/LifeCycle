# Design Playground

## 概述

Design Playground 是 LifeCycle 项目的设计系统展示页面，提供了完整的视觉设计指南和组件库参考。

## 访问路径

```
http://localhost:3000/design-playground
```

## 功能特性

### 1. Typography 排版系统

- **标题层级**: H1 到 H4 的完整标题样式
- **正文文本**: 大、中、小三种尺寸
- **字重展示**: Normal、Medium、Semibold、Bold
- **用途**: 确保整个应用的文本层级一致性

### 2. Color Palette 色彩系统

基于 Tailwind CSS v4 的 CSS 变量色彩系统：

#### 语义化颜色
- **Primary**: 主要操作和强调
- **Secondary**: 次要操作
- **Destructive**: 危险操作和错误状态
- **Muted**: 降低视觉重要性的内容
- **Accent**: 强调和高亮

#### 表面颜色
- **Background**: 页面背景
- **Card**: 卡片容器背景
- **Popover**: 弹出层背景
- **Border**: 边框颜色
- **Input**: 输入框背景

#### 图表颜色
- 5 种渐进色阶，用于数据可视化

### 3. Shadcn UI 组件库

展示所有已安装的 Shadcn UI 组件：

#### Button 按钮
- **6 种变体**: Default, Secondary, Outline, Ghost, Destructive, Link
- **4 种尺寸**: Extra Small, Small, Default, Large
- **图标支持**: 前置、后置、仅图标
- **状态**: Disabled, Loading

#### Badge 徽章
- 4 种变体：Default, Secondary, Outline, Destructive
- 支持图标组合

#### Form Inputs 表单输入
- **Input**: 文本输入框
  - 默认状态
  - 禁用状态
  - 错误状态
  - 带图标
- **Textarea**: 多行文本输入
- **Select**: 下拉选择器

#### Card 卡片
- 两种尺寸：Small, Default
- 完整结构：Header, Content, Footer
- 支持图标装饰

#### Alert Dialog 警告对话框
- 模态对话框组件
- 用于重要操作确认

#### Separator 分隔符
- 内容区域的视觉分割

### 4. Lucide Icons 图标库

展示常用图标集合：
- Check, Close, Alert, Info
- Star, Heart, Sparkles, Zap
- Crown, Rocket, Mail, User
- Settings, Loader

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (CSS 变量)
- **UI Library**: Shadcn UI
- **Icons**: Lucide React
- **Color System**: OKLCH 色彩空间

## 使用建议

### 开发新功能时
1. 访问 Design Playground 查看可用组件
2. 复制所需组件的使用示例
3. 遵循展示的设计模式和间距规范

### 添加新组件时
1. 使用 Shadcn CLI 安装组件
2. 在 Design Playground 中添加展示区域
3. 提供多种变体和使用示例

### 自定义样式时
1. 优先使用 Tailwind 工具类
2. 遵循 4px 栅格系统 (p-4, gap-6)
3. 使用 CSS 变量定义的颜色

## 维护指南

### 更新组件展示
编辑 `app/design-playground/page.tsx`：

```tsx
// 添加新的组件展示区域
<Card>
  <CardHeader>
    <CardTitle>新组件名称</CardTitle>
    <CardDescription>组件描述</CardDescription>
  </CardHeader>
  <CardContent>
    {/* 组件示例 */}
  </CardContent>
</Card>
```

### 更新色彩系统
修改 `app/globals.css` 中的 CSS 变量：

```css
:root {
  --primary: oklch(0.67 0.16 58);
  /* 其他颜色变量 */
}
```

## 最佳实践

1. **始终使用 Shadcn 组件**: 不要使用原生 HTML/CSS 样式
2. **保持一致性**: 参考 Design Playground 中的模式
3. **响应式设计**: 使用 Tailwind 的响应式前缀 (sm:, md:, lg:)
4. **可访问性**: 使用语义化 HTML 和 ARIA 属性
5. **性能优化**: 优先使用服务端组件 (RSC)

## 相关文件

- `/app/design-playground/page.tsx` - 主页面组件
- `/app/globals.css` - 全局样式和 CSS 变量
- `/components/ui/` - Shadcn UI 组件库
- `/lib/utils.ts` - 工具函数 (cn helper)

## 快捷操作

```bash
# 安装新的 Shadcn 组件
pnpm dlx shadcn@latest add [component-name]

# 启动开发服务器
pnpm dev

# 访问 Design Playground
# http://localhost:3000/design-playground
```
