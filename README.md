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
│ node-cron (内置)     │        │                           │
│ Vercel Cron          │        │  /api/cron/check-expiry   │
│ GitHub Actions       │──GET──▶│  (鉴权 → 调用服务 → 返回) │
│ 外部调度器 (curl)     │  POST  │                           │
│ 手动触发             │        └───────────┬───────────────┘
└──────────────────────┘                    │
                                            ▼
  instrumentation.ts                ┌───────────────────────────┐
  (服务器启动时自动加载)             │  lib/services/             │
          │                         │  ├─ cron-scheduler.ts      │
          └─ startScheduler() ─────▶│  │   node-cron 调度管理     │
                                    │  ├─ expiry-checker.ts      │
                                    │  │   查询·分组·去重·编排    │
                                    │  └─ webhook-sender.ts      │
                                    │      模板渲染·HTTP发送      │
                                    └───────────────────────────┘
```

### 环境变量

在 `.env`（本地）或部署平台的环境变量设置中添加：

```bash
# ── Cron 调度器配置 ──

# 是否启用内置 node-cron 调度器 (默认 true)
# 如果使用外部触发器 (Vercel Cron / GitHub Actions)，可设为 false
CRON_ENABLED=true

# Cron 表达式 (默认每天 09:00)
# 常用示例:
#   "0 9 * * *"     — 每天 09:00
#   "0 9,18 * * *"  — 每天 09:00 和 18:00
#   "0 */6 * * *"   — 每 6 小时
#   "*/30 * * * *"  — 每 30 分钟 (调试用)
CRON_SCHEDULE="0 9 * * *"

# Cron 时区 (默认 Asia/Shanghai)
CRON_TIMEZONE=Asia/Shanghai

# ── Webhook 配置 ──

# 单个 Webhook 请求超时 (毫秒，默认 10000)
WEBHOOK_TIMEOUT_MS=10000

# ── API 鉴权 (仅通过 HTTP API 触发时需要) ──

# Cron 接口鉴权密钥，建议使用 32+ 字符的随机字符串
# 未设置时，所有 HTTP cron 请求将被拒绝（安全默认策略）
# 内置 node-cron 调度器不需要此密钥
CRON_SECRET=your-random-secret-here
```

生成随机密钥：

```bash
openssl rand -base64 32
```

### 部署方式

#### 方式一：自托管 + 内置 node-cron（推荐）

项目内置了基于 `node-cron` 的调度器，服务器启动时自动运行，**无需任何外部依赖**。

##### Docker 部署

```dockerfile
FROM node:20-alpine AS base

# ... 构建阶段省略 (参见 Next.js standalone 部署文档) ...

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Cron 配置 (可在 docker-compose 或 docker run 中覆盖)
ENV CRON_ENABLED=true
ENV CRON_SCHEDULE="0 9 * * *"
ENV CRON_TIMEZONE=Asia/Shanghai
ENV WEBHOOK_TIMEOUT_MS=10000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  lifecycle:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./prisma/dev.db
      - CRON_ENABLED=true
      - CRON_SCHEDULE=0 9 * * *       # 每天 09:00
      - CRON_TIMEZONE=Asia/Shanghai
      - WEBHOOK_TIMEOUT_MS=10000
      - CRON_SECRET=your-random-secret  # 仅 HTTP API 触发需要
    volumes:
      - ./data:/app/prisma  # 持久化 SQLite 数据库
```

##### PM2 部署

```bash
# 构建
pnpm build

# 启动 (环境变量通过 ecosystem 配置)
pm2 start ecosystem.config.js
```

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "lifecycle",
    script: ".next/standalone/server.js",
    env: {
      NODE_ENV: "production",
      CRON_ENABLED: "true",
      CRON_SCHEDULE: "0 9 * * *",
      CRON_TIMEZONE: "Asia/Shanghai",
      WEBHOOK_TIMEOUT_MS: "10000",
    },
  }],
}
```

> **工作原理：** 服务启动时，Next.js 的 `instrumentation.ts` hook 自动调用 `startScheduler()`，在 Node.js 进程内注册 cron 任务。日志输出到 stdout，可通过 `docker logs` 或 PM2 日志查看调度状态。

#### 方式二：Vercel Cron Jobs

适用于 Vercel 托管部署。需要设置 `CRON_ENABLED=false` 以禁用内置调度器，避免重复触发。

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

在 Vercel 项目设置中添加环境变量 `CRON_SECRET` 和 `CRON_ENABLED=false`。

#### 方式三：GitHub Actions

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

#### 方式四：外部调度器 / 手动触发

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
| CRON_SECRET 鉴权 | HTTP API 触发时必须在 `Authorization: Bearer <secret>` 或 `x-vercel-cron-token` 中携带正确密钥 |
| 安全默认策略 | 未配置 `CRON_SECRET` 时**拒绝所有 HTTP 请求**，不会意外暴露 |
| 独立鉴权 | `/api/cron/*` 不经过 session 中间件，与用户登录体系隔离 |
| Webhook 超时 | 每个 Webhook 请求默认 10 秒超时 (`WEBHOOK_TIMEOUT_MS`)，防止慢速端点阻塞 |
| 通知去重 | `NotificationLog` 表按 `(itemId, webhookId, expiryDate)` 唯一约束，杜绝重复通知 |
| 幂等启动 | `startScheduler()` 多次调用安全，会先停止旧任务再注册新任务 |

### 环境变量速查表

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `CRON_ENABLED` | `true` | 是否启用内置 node-cron 调度器 |
| `CRON_SCHEDULE` | `0 9 * * *` | Cron 表达式 |
| `CRON_TIMEZONE` | `Asia/Shanghai` | Cron 时区 |
| `WEBHOOK_TIMEOUT_MS` | `10000` | 单个 Webhook 请求超时 (毫秒) |
| `CRON_SECRET` | _(无)_ | HTTP API 鉴权密钥 (内置调度器不需要) |
