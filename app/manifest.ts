import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LifeCycle - 智能生活管理平台",
    short_name: "LifeCycle",
    description: "数据驱动的生活方式管理工具",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#000000",
    lang: "zh-CN",
    dir: "ltr",
    categories: ["lifestyle", "productivity", "utilities"],
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // 注意：截图文件需手动添加到 public/screenshots/ 目录
    // 添加后取消下面的注释以启用安装时的截图预览
    // screenshots: [
    //   {
    //     src: "/screenshots/desktop.png",
    //     sizes: "1920x1080",
    //     type: "image/png",
    //     // @ts-expect-error - form_factor is valid but not yet in TS types
    //     form_factor: "wide",
    //     label: "LifeCycle 桌面端界面",
    //   },
    //   {
    //     src: "/screenshots/mobile.png",
    //     sizes: "750x1334",
    //     type: "image/png",
    //     // @ts-expect-error - form_factor is valid but not yet in TS types
    //     form_factor: "narrow",
    //     label: "LifeCycle 移动端界面",
    //   },
    // ],
  }
}
