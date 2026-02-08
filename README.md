# LifeCycle

物品生命周期管理与过期提醒服务。追踪日用品的使用周期、保质期和库存，到期自动通过 Webhook 通知。

## 功能特性

- **物品追踪** — 记录物品的生命周期、保质期、库存数量
- **到期提醒** — 自动检测即将过期的物品，通过 Webhook 发送通知
- **更换记录** — 记录物品更换历史，生成消费分析报表
- **多用户** — 每个用户独立管理自己的物品数据
- **PWA 支持** — 支持安装到桌面/手机，离线可用
- **2FA / Passkey** — 支持两步验证和 Passkey 无密码登录

## 快速部署

### 方式一：Docker 部署（推荐）

> 适用于有自己服务器（VPS、NAS、本地机器）的用户。数据存储在本地 SQLite 文件中，自动迁移建表，开箱即用。

**1. 创建配置文件**

```bash
mkdir lifecycle && cd lifecycle

# 创建环境变量文件
cat > .env <<'EOF'
# 认证密钥（必改！请替换为随机字符串，至少 32 字符）
BETTER_AUTH_SECRET=请替换为你的密钥-至少32个字符-可以用openssl-rand-base64-32生成
# 应用访问地址（改为你的域名或 IP）
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
# 定时任务密钥
CRON_SECRET=请替换为随机字符串
# 端口
APP_PORT=3000
EOF
```

**2. 创建 docker-compose.yml**

```yaml
services:
  app:
    image: ghcr.io/YOUR_OWNER/lifecycle:latest
    container_name: lifecycle
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      - DATABASE_PROVIDER=sqlite
      - DATABASE_URL=file:/app/data/lifecycle.db
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL:-http://localhost:3000}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
      - CRON_SECRET=${CRON_SECRET:-}
    volumes:
      - lifecycle-data:/app/data

volumes:
  lifecycle-data:
```

**3. 启动服务**

```bash
docker compose up -d
```

打开浏览器访问 `http://localhost:3000`，注册账户即可使用。

> **数据持久化：** SQLite 数据库存储在 Docker Volume `lifecycle-data` 中，容器重建不会丢失数据。

> **自动建表：** 容器首次启动时会自动执行数据库迁移（创建所有表结构），无需手动操作。

**更新镜像：**

```bash
docker compose pull
docker compose up -d
```

---

### 方式二：Vercel + Turso 部署

> 适用于无服务器的用户。部署到 Vercel 免费计划，使用 Turso 作为远程数据库。

#### 步骤 1：创建 Turso 数据库

1. 注册 [Turso](https://turso.tech)（免费计划足够使用）
2. 创建数据库：

```bash
# 安装 Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 登录
turso auth login

# 创建数据库
turso db create lifecycle

# 获取连接 URL
turso db show lifecycle --url

# 创建 Auth Token
turso db tokens create lifecycle
```

3. 记录下 **数据库 URL** 和 **Auth Token**

> **无需手动建表！** 应用首次启动时会自动将 Prisma 迁移应用到 Turso 数据库，自动创建所有表结构。

#### 步骤 2：部署到 Vercel

1. Fork 本仓库到你的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 在 **Settings → Environment Variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_PROVIDER` | `turso` | 使用 Turso 数据库 |
| `DATABASE_URL` | `file:./placeholder.db` | Prisma CLI 需要（运行时不使用） |
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` | Turso 连接 URL |
| `TURSO_AUTH_TOKEN` | `your-token` | Turso 认证令牌 |
| `BETTER_AUTH_SECRET` | 随机字符串（≥32字符） | 认证密钥 |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` | 应用地址 |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | 应用公开地址 |
| `CRON_SECRET` | 随机字符串 | 定时任务鉴权 |
| `CRON_ENABLED` | `false` | 禁用内置调度器（使用 Vercel Cron） |

4. 点击 **Deploy**

> 项目已内置 `vercel.json`，Vercel 会自动识别 Next.js 框架并配置 Cron Job。

---

## 环境变量说明

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `DATABASE_PROVIDER` | 否 | `sqlite` | 数据库类型：`sqlite` \| `turso` |
| `DATABASE_URL` | 是 | — | SQLite 文件路径 |
| `TURSO_DATABASE_URL` | Turso 时必填 | — | Turso 连接 URL |
| `TURSO_AUTH_TOKEN` | Turso 时必填 | — | Turso 认证令牌 |
| `BETTER_AUTH_SECRET` | 是 | — | 认证密钥（≥32字符） |
| `BETTER_AUTH_URL` | 是 | — | 应用访问地址 |
| `NEXT_PUBLIC_APP_URL` | 是 | — | 应用公开地址 |
| `CRON_SECRET` | 否 | — | Cron API 鉴权密钥 |
| `CRON_ENABLED` | 否 | `true` | 是否启用内置 node-cron |
| `CRON_SCHEDULE` | 否 | `0 9 * * *` | Cron 表达式 |
| `CRON_TIMEZONE` | 否 | `Asia/Shanghai` | Cron 时区 |
| `APP_PORT` | 否 | `3000` | Docker 映射端口 |

---

## 高级部署

### Docker + Nginx + SSL

适用于生产环境，包含 Nginx 反向代理和 Let''s Encrypt SSL 证书自动续期：

```bash
# 克隆仓库
git clone https://github.com/YOUR_OWNER/lifecycle.git
cd lifecycle

# 使用一键部署脚本
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

或手动使用生产配置：

```bash
cp .env.example .env.production
# 编辑 .env.production，修改域名和密钥

docker compose -f docker-compose.production.yml --env-file .env.production up -d
```

### 本地开发

```bash
# 安装依赖
pnpm install

# 初始化数据库
pnpm db:migrate

# 启动开发服务器
pnpm dev
```

---

## 定时任务与 Webhook 通知

系统会定期检查物品到期状态，通过用户配置的 Webhook 发送通知。

- **Docker 部署**：内置 node-cron 调度器自动运行，无需额外配置
- **Vercel 部署**：通过 Vercel Cron Jobs 触发（已在 `vercel.json` 中配置）
- **手动触发**：

```bash
curl -X POST https://your-domain.com/api/cron/check-expiry \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 技术栈

- **框架**: Next.js 16 (App Router)
- **数据库**: SQLite / Turso (LibSQL)
- **ORM**: Prisma
- **认证**: Better-Auth
- **UI**: shadcn/ui + Tailwind CSS
- **动画**: Framer Motion
- **PWA**: @ducanh2912/next-pwa

## License

MIT
