# ============================================
# LifeCycle - 多阶段 Docker 构建
# ============================================
# 特性:
#   - 4 阶段构建（base → deps → builder → runner）
#   - pnpm store 缓存加速重复构建
#   - standalone 模式极致精简运行时
#   - 仅保留 sqlite WASM 引擎，清理 ~300MB 冗余
#   - 非 root 运行，安全可靠
#
# 构建:
#   docker build -t lifecycle .
#   docker compose up -d
# ============================================

# ======================= Stage 1: Base =======================
FROM node:22-alpine AS base

# 启用 pnpm corepack
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

WORKDIR /app

# ======================= Stage 2: Dependencies =======================
FROM base AS deps

# 仅复制依赖描述文件，最大化利用 Docker 层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制 Prisma schema（pnpm install 的 postinstall 需要 prisma generate）
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma.config.ts ./prisma.config.ts

# 安装全部依赖（含 devDependencies，构建阶段需要）
# 使用 BuildKit cache mount 加速 pnpm store
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ======================= Stage 3: Build =======================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 说明: NEXT_PUBLIC_APP_URL 等业务变量无需构建时注入
#   - auth.ts 中 trustedOrigins 是服务端代码，运行时读取 process.env
#   - auth-client.ts 客户端使用 window.location.origin，不依赖编译时常量
#   - 所有密钥/配置均通过 docker-compose environment 运行时传入

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 执行构建
RUN pnpm build

# ---- 提取 Prisma CLI 运行时依赖 ----
# entrypoint 使用 prisma migrate deploy，但 standalone 不会追踪 CLI 工具
# 需要递归解析依赖树，复制到独立目录
RUN node -e " \
const fs = require('fs'); \
const path = require('path'); \
const DEST = '/app/prisma-cli/node_modules'; \
fs.mkdirSync(DEST, { recursive: true }); \
function findPkg(name) { \
  const direct = path.join('/app/node_modules', name, 'package.json'); \
  if (fs.existsSync(direct)) return path.dirname(direct); \
  const pnpmDir = '/app/node_modules/.pnpm'; \
  const safeName = name.replace(/\\//g, '+'); \
  try { \
    const entries = fs.readdirSync(pnpmDir).filter(d => d.startsWith(safeName + '@')); \
    for (const e of entries) { \
      const p = path.join(pnpmDir, e, 'node_modules', name); \
      if (fs.existsSync(p)) return p; \
    } \
  } catch {} \
  return null; \
} \
function copyDeps(name, visited) { \
  if (visited.has(name)) return; \
  visited.add(name); \
  const src = findPkg(name); \
  if (!src) return; \
  const dest = path.join(DEST, name); \
  if (!fs.existsSync(dest)) { \
    fs.mkdirSync(path.dirname(dest), { recursive: true }); \
    fs.cpSync(fs.realpathSync(src), dest, { recursive: true, dereference: true }); \
  } \
  try { \
    const pkg = JSON.parse(fs.readFileSync(path.join(src, 'package.json'), 'utf-8')); \
    for (const dep of Object.keys(pkg.dependencies || {})) copyDeps(dep, visited); \
  } catch {} \
} \
const visited = new Set(); \
copyDeps('prisma', visited); \
copyDeps('dotenv', visited); \
console.log('[builder] Prisma CLI dependencies extracted:', visited.size, 'packages'); \
"

# ---- 清理 Prisma CLI 中非目标平台的文件 ----
RUN find /app/prisma-cli -name "*.dll.node" -delete && \
    find /app/prisma-cli -name "*.exe" -delete && \
    find /app/prisma-cli -name "*darwin*" -delete && \
    find /app/prisma-cli -name "*windows*" -delete && \
    # 仅保留 sqlite WASM 引擎
    find /app/prisma-cli -name "query_compiler_bg.*.wasm" ! -name "*.sqlite.wasm" -delete 2>/dev/null; \
    find /app/prisma-cli -name "query_engine_bg.*.wasm" ! -name "*.sqlite.wasm" -delete 2>/dev/null; \
    # 删除内嵌的 prisma-client（运行时由 standalone 提供）
    rm -rf /app/prisma-cli/node_modules/prisma/prisma-client && \
    echo "[builder] Prisma CLI cleaned for linux-alpine + sqlite-only"

# ---- 清理 standalone 产物中的冗余 ----
RUN find /app/.next/standalone -name "*.tmp*" -delete 2>/dev/null; \
    find /app/.next/standalone -name "*.dll.node" -delete 2>/dev/null; \
    find /app/.next/standalone -name "*.exe" -delete 2>/dev/null; \
    find /app/.next/standalone/node_modules -path "*win32*" -prune -exec rm -rf {} + 2>/dev/null; \
    find /app/.next/standalone/node_modules -path "*darwin*" -prune -exec rm -rf {} + 2>/dev/null; \
    # 删除 typescript（outputFileTracingExcludes 可能遗漏）
    rm -rf /app/.next/standalone/node_modules/.pnpm/typescript@* 2>/dev/null; \
    rm -rf /app/.next/standalone/node_modules/typescript 2>/dev/null; \
    # 删除 @prisma/client/runtime 中非 sqlite 的 WASM 引擎
    find /app/.next/standalone -path "*/runtime/*cockroachdb*" -delete 2>/dev/null; \
    find /app/.next/standalone -path "*/runtime/*mysql*" -delete 2>/dev/null; \
    find /app/.next/standalone -path "*/runtime/*postgresql*" -delete 2>/dev/null; \
    find /app/.next/standalone -path "*/runtime/*sqlserver*" -delete 2>/dev/null; \
    echo "[builder] Standalone cleaned: removed non-sqlite engines and platform-specific files"

# ======================= Stage 4: Production Runner =======================
FROM node:22-alpine AS runner

WORKDIR /app

# 安装运行时系统依赖
# su-exec: 权限降级（比 gosu 更轻量）
# wget: 健康检查（alpine 自带）
RUN apk add --no-cache su-exec && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# 环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ---- 按变更频率从低到高复制文件，优化层缓存 ----

# 1. Prisma schema + 迁移文件 + 配置（数据库结构变更时才变）
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# 2. 静态资源（PWA icons 等，较少变化）
COPY --from=builder /app/public ./public

# 3. Next.js standalone 构建产物（含精简后的 node_modules）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 4. 叠加 Prisma CLI 依赖（entrypoint 中 migrate deploy 需要）
COPY --from=builder /app/prisma-cli/node_modules ./node_modules

# 5. 入口脚本（最常变化）
COPY --chown=nextjs:nodejs deploy/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# 创建数据目录（SQLite 持久化挂载点）
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/auth/ok || exit 1

# 元数据标签
LABEL org.opencontainers.image.title="LifeCycle" \
      org.opencontainers.image.description="物品生命周期管理与过期提醒服务" \
      org.opencontainers.image.source="https://github.com/YOUR_OWNER/lifecycle"

# 以 root 启动 → entrypoint 修复权限后通过 su-exec 降权运行
CMD ["/app/entrypoint.sh"]
