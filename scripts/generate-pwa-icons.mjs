/**
 * PWA 图标生成脚本
 * 
 * 使用方法：
 *   node scripts/generate-pwa-icons.mjs
 * 
 * 依赖：sharp (npm install -D sharp)
 * 
 * 该脚本会从 public/logo.png 生成各种尺寸的 PWA 图标，
 * 并将它们保存到 public/icons/ 目录。
 */

import { existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, "..")

const ICON_SIZES = [72, 96, 128, 144, 192, 384, 512]
const SOURCE_ICON = join(rootDir, "public", "logo.png")
const OUTPUT_DIR = join(rootDir, "public", "icons")

async function generateIcons() {
    // Dynamic import so sharp isn't required at project level
    let sharp
    try {
        sharp = (await import("sharp")).default
    } catch {
        console.error("❌ 请先安装 sharp: pnpm add -D sharp")
        process.exit(1)
    }

    if (!existsSync(SOURCE_ICON)) {
        console.error(`❌ 源图标不存在: ${SOURCE_ICON}`)
        console.error("   请确保 public/logo.png 文件存在")
        process.exit(1)
    }

    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    console.log("🎨 正在生成 PWA 图标...\n")

    for (const size of ICON_SIZES) {
        const outputPath = join(OUTPUT_DIR, `icon-${size}x${size}.png`)
        await sharp(SOURCE_ICON)
            .resize(size, size, {
                fit: "contain",
                background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .png()
            .toFile(outputPath)
        console.log(`  ✅ icon-${size}x${size}.png`)
    }

    // Generate maskable icon (with safe-zone padding)
    const maskableSize = 512
    const padding = Math.round(maskableSize * 0.1) // 10% padding for safe zone
    const innerSize = maskableSize - padding * 2
    const maskablePath = join(OUTPUT_DIR, `maskable-icon-${maskableSize}x${maskableSize}.png`)

    await sharp(SOURCE_ICON)
        .resize(innerSize, innerSize, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toFile(maskablePath)
    console.log(`  ✅ maskable-icon-${maskableSize}x${maskableSize}.png`)

    console.log("\n🎉 所有 PWA 图标生成完成！")
    console.log(`   输出目录: ${OUTPUT_DIR}`)
}

generateIcons().catch(console.error)
