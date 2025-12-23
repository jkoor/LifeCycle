import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/providers/session-provider"
import { NavigationWrapper } from "@/components/navigation"

import { NuqsAdapter } from "nuqs/adapters/next/app"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "LifeCycle - 智能生活管理平台",
  description: "数据驱动的生活方式管理工具",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={fontSans.variable}>
      <body className="antialiased">
        <NuqsAdapter>
          <SessionProvider>
            <NavigationWrapper />
            {/* 主内容区：移动端添加底部 padding 避免被悬浮导航遮挡 */}
            <main className="pb-20 md:pb-0">{children}</main>
          </SessionProvider>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  )
}
