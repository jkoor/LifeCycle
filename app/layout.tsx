import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/providers/session-provider"
import { ClientLayout } from "@/components/providers/client-layout"
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeCycle",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Optional: makes it feel more native, but considering accessibility
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const categories = await prisma.category.findMany()

  return (
    <html lang="zh-CN" className={fontSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        <NuqsAdapter>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ClientLayout>
                {/* Desktop: 整体容器带圆角和阴影 */}
                <div className="flex min-h-screen flex-col md:flex-row md:h-screen md:overflow-hidden md:p-3 md:gap-3 bg-neutral-100 dark:bg-neutral-900">
                  <NavigationWrapper categories={categories} />
                  <AnimatedThemeToggler className="fixed top-4 right-4 md:top-6 md:right-6 z-50 text-foreground" />
                  {/* 主内容区：移动端添加底部 padding，桌面端添加圆角 */}
                  <main className="flex-1 w-full pb-24 md:pb-0 bg-background md:rounded-2xl md:shadow-sm md:border md:border-border/50 md:h-full md:overflow-hidden">
                    {children}
                  </main>
                </div>
              </ClientLayout>
            </ThemeProvider>
          </SessionProvider>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  )
}
