# ============================================
# LifeCycle - Multi-stage Docker Build
# ============================================
# 支持两种使用方式:
#   1. 直接拉取预构建镜像: docker pull ghcr.io/YOUR_OWNER/lifecycle:latest
#   2. 本地构建: docker compose build
# ============================================

# ---- Base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 只有 NEXT_PUBLIC_ 开头的变量需要构建时注入
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# 构建时需要一个临时 DATABASE_URL 让 Prisma generate 成功
ENV DATABASE_URL="file:./build.db"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# 兼容 pnpm 布局：将 Prisma engines 放到 /app/node_modules/.prisma 以便后续复制
RUN mkdir -p /app/node_modules/.prisma && \
  cp -r /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma/* /app/node_modules/.prisma/

# ---- Production ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 创建数据目录（SQLite 持久化用）并设置权限
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# 复制 Prisma schema + 迁移文件 + 已生成的客户端
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma

# 复制 LibSQL 驱动（Turso 模式需要）
COPY --from=builder /app/node_modules/@libsql ./node_modules/@libsql

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 入口脚本（处理数据库自动迁移）
COPY --chown=nextjs:nodejs deploy/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/auth/ok || exit 1

# 元数据标签
LABEL org.opencontainers.image.title="LifeCycle"
LABEL org.opencontainers.image.description="物品生命周期管理与过期提醒服务"

CMD ["/app/entrypoint.sh"]
