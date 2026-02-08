import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { ClientLayout } from "@/components/providers/client-layout"
import { NavigationWrapper } from "@/components/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { prisma } from "@/lib/prisma"
import { PWAInstallPrompt } from "@/components/features/pwa-install-prompt"
import { OfflineIndicator } from "@/components/features/offline-indicator"

import { NuqsAdapter } from "nuqs/adapters/next/app"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "LifeCycle - 智能生活管理平台",
  description: "数据驱动的生活方式管理工具",
  generator: "v0.app",
  applicationName: "LifeCycle",
  keywords: ["生活管理", "数据驱动", "智能管理", "LifeCycle"],
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeCycle",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
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
  let categories = [] as Awaited<ReturnType<typeof prisma.category.findMany>>
  try {
    categories = await prisma.category.findMany()
  } catch (error: unknown) {
    const prismaError = error as { code?: string }
    if (prismaError.code !== "P2021") {
      throw error
    }
  }

  return (
    <html lang="zh-CN" className={fontSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClientLayout>
              <OfflineIndicator />
              {/* Desktop: 整体容器带圆角和阴影 */}
              <div className="flex min-h-screen flex-col md:flex-row md:h-screen md:overflow-hidden md:p-3 md:gap-3 bg-neutral-100 dark:bg-neutral-900">
                <NavigationWrapper categories={categories} />
                <AnimatedThemeToggler className="fixed top-4 right-4 md:top-6 md:right-6 z-50 text-foreground" />
                {/* 主内容区：移动端添加底部 padding，桌面端添加圆角 */}
                <main className="flex-1 w-full pb-24 md:pb-0 bg-background md:rounded-2xl md:shadow-sm md:border md:border-border/50 md:h-full md:overflow-hidden">
                  {children}
                </main>
              </div>
              <PWAInstallPrompt />
            </ClientLayout>
          </ThemeProvider>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  )
}
