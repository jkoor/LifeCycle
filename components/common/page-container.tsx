"use client"

import { PageHeader } from "@/components/common/page-header"
import { PageContent } from "@/components/common/page-content"

interface PageContainerProps {
  title: string
  description?: string
  headerChildren?: React.ReactNode
  children: React.ReactNode
}

/**
 * 统一的页面容器组件
 *
 * 提供：
 * - 固定标题栏（移动端滚动时收缩副标题）
 * - 独立滚动的内容区域
 * - 监听滚动事件更新 ScrollContext
 */
export function PageContainer({
  title,
  description,
  headerChildren,
  children,
}: PageContainerProps) {
  return (
    <div className="flex flex-col md:h-full md:overflow-hidden">
      <PageHeader title={title} description={description}>
        {headerChildren}
      </PageHeader>
      <PageContent>
        <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </PageContent>
    </div>
  )
}
