import type { NextConfig } from "next"
import withPWA from "@ducanh2912/next-pwa"

const nextConfig: NextConfig = {
  output: "standalone",
}

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/_offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // 缓存同源页面请求（NavigationRoute）
        urlPattern: ({ request }: { request: Request }) =>
          request.mode === "navigate",
        handler: "NetworkFirst" as const,
        options: {
          cacheName: "pages-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 小时
          },
          networkTimeoutSeconds: 3,
        },
      },
      {
        // 缓存静态资源（JS, CSS）
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst" as const,
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
          },
        },
      },
      {
        // 缓存图片
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst" as const,
        options: {
          cacheName: "image-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
          },
        },
      },
      {
        // 缓存字体
        urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
        handler: "CacheFirst" as const,
        options: {
          cacheName: "font-cache",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 年
          },
        },
      },
      {
        // API 请求用 NetworkFirst
        urlPattern: /\/api\/.*/i,
        handler: "NetworkFirst" as const,
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 分钟
          },
          networkTimeoutSeconds: 3,
        },
      },
    ],
  },
})(nextConfig)
