import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/providers/session-provider"
import { NavigationWrapper } from "@/components/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { prisma } from "@/lib/prisma"

import { NuqsAdapter } from "nuqs/adapters/next/app"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "LifeCycle - 智能生活管理平台",
  description: "数据驱动的生活方式管理工具",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const categories = await prisma.category.findMany()

  return (
    <html lang="zh-CN" className={fontSans.variable}>
      <body className="antialiased">
        <NuqsAdapter>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NavigationWrapper categories={categories} />
              <AnimatedThemeToggler className="fixed top-4 right-4 z-50 text-foreground" />
              {/* 主内容区：移动端添加底部 padding 避免被悬浮导航遮挡 */}
              <main className="pb-20 md:pb-0">{children}</main>
            </ThemeProvider>
          </SessionProvider>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  )
}
