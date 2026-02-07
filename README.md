This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 定时过期检查与 Webhook 通知

### 功能概述

系统会定期检查所有用户的物品是否即将过期或已过期，并通过用户配置的 Webhook 端点发送通知。

**过期判定规则（优先级递减）：**

1. **绝对过期日期** — `expirationDate` 字段直接指定的日期
2. **开封保质期** — `lastOpenedAt + shelfLifeDays` 计算得出
3. **使用寿命** — `lastOpenedAt + lifespanDays` 计算得出

当物品距到期天数 ≤ `notifyAdvanceDays` 时触发通知。

**防重复机制：** 同一物品 + 同一 Webhook + 同一到期日期，只会发送一次通知（通过 `NotificationLog` 表的唯一约束保证）。

### 架构：触发器与业务逻辑分离

```
触发层 (可替换)                         业务逻辑层 (不变)
┌──────────────────────┐        ┌───────────────────────────┐
│ Vercel Cron          │        │                           │
│ GitHub Actions       │──GET──▶│  /api/cron/check-expiry   │
│ 外部调度器 (curl)     │  POST  │  (鉴权 → 调用服务 → 返回) │
│ 手动触发             │        └───────────┬───────────────┘
└──────────────────────┘                    │
                                            ▼
                                ┌───────────────────────────┐
                                │  lib/services/             │
                                │  ├─ expiry-checker.ts      │
                                │  │   查询·分组·去重·编排    │
                                │  └─ webhook-sender.ts      │
                                │      模板渲染·HTTP发送      │
                                └───────────────────────────┘
```

### 环境变量

在 `.env`（本地）或部署平台的环境变量设置中添加：

```bash
# 必需：Cron 接口鉴权密钥，建议使用 32+ 字符的随机字符串
# 未设置时，所有 cron 请求将被拒绝（安全默认策略）
CRON_SECRET=your-random-secret-here
```

生成随机密钥：

```bash
openssl rand -base64 32
```

### 部署方式

#### 方式一：Vercel Cron Jobs（推荐）

在项目根目录创建 `vercel.json`：

```json
{
  "crons": [
    {
      "path": "/api/cron/check-expiry",
      "schedule": "0 9 * * *"
    }
  ]
}
```

> **说明：** `0 9 * * *` 表示每天 UTC 09:00（北京时间 17:00）执行一次。Vercel 会自动在请求头中注入 `x-vercel-cron-token`，其值等于环境变量 `CRON_SECRET`，无需额外配置。

在 Vercel 项目设置中添加环境变量 `CRON_SECRET`。

#### 方式二：GitHub Actions

在仓库中创建 `.github/workflows/cron-check-expiry.yml`：

```yaml
name: Check Expiring Items

on:
  schedule:
    - cron: '0 9 * * *'  # 每天 UTC 09:00
  workflow_dispatch:       # 支持手动触发

jobs:
  check-expiry:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger expiry check
        run: |
          curl -f -X POST "${{ secrets.APP_URL }}/api/cron/check-expiry" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中添加：
- `APP_URL` — 你的应用地址，如 `https://lifecycle.example.com`
- `CRON_SECRET` — 与 `.env` 中一致的密钥

#### 方式三：外部调度器 / 手动触发

```bash
# 手动执行一次
curl -X POST https://your-domain.com/api/cron/check-expiry \
  -H "Authorization: Bearer your-random-secret-here"

# 使用系统 crontab (Linux/macOS)
# crontab -e
0 9 * * * curl -sf -X POST https://your-domain.com/api/cron/check-expiry -H "Authorization: Bearer your-secret" > /dev/null 2>&1
```

### API 响应格式

```jsonc
// 成功响应 (200)
{
  "success": true,
  "totalItemsChecked": 42,      // 扫描的活跃物品总数
  "expiringItemsFound": 3,      // 命中过期条件的物品数
  "notificationsSent": 5,       // 实际发送的通知数
  "notificationsFailed": 0,     // 发送失败的通知数
  "notificationsSkipped": 2,    // 跳过的通知数（已发送过）
  "usersNotified": 2,           // 涉及的用户数
  "durationMs": 1234,           // 执行耗时
  "errors": []
}

// 鉴权失败 (401)
{ "error": "Unauthorized" }
```

### 安全机制

| 措施 | 说明 |
|------|------|
| CRON_SECRET 鉴权 | 必须在 `Authorization: Bearer <secret>` 或 `x-vercel-cron-token` 中携带正确密钥 |
| 安全默认策略 | 未配置 `CRON_SECRET` 时**拒绝所有请求**，不会意外暴露 |
| 独立鉴权 | `/api/cron/*` 不经过 session 中间件，与用户登录体系隔离 |
| Webhook 超时 | 每个 Webhook 请求 10 秒超时，防止慢速端点阻塞整个流程 |
| 通知去重 | `NotificationLog` 表按 `(itemId, webhookId, expiryDate)` 唯一约束，杜绝重复通知 |
