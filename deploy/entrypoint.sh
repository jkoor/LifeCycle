#!/bin/sh
# ============================================
# LifeCycle Docker 容器入口脚本
# ============================================
# 启动流程:
#   1. 以 root 启动，修复数据目录权限
#   2. SQLite 模式：执行 Prisma 数据库迁移
#   3. Turso 模式：跳过（由 instrumentation.ts 处理）
#   4. 通过 su-exec 降权为 nextjs 用户启动服务
# ============================================

set -e

echo "============================================"
echo "  LifeCycle 服务启动中..."
echo "  数据库模式: ${DATABASE_PROVIDER:-sqlite}"
echo "  端口: ${PORT:-3000}"
echo "============================================"

# ------------------------------------------
# 1. 修复数据目录权限（兼容已有 volume）
# ------------------------------------------
mkdir -p /app/data
chown nextjs:nodejs /app/data

# ------------------------------------------
# 2. 数据库迁移
# ------------------------------------------
if [ "${DATABASE_PROVIDER}" != "turso" ]; then
  # SQLite 模式（默认）
  export DATABASE_URL="${DATABASE_URL:-file:/app/data/lifecycle.db}"

  echo "[entrypoint] SQLite 模式 - 执行数据库迁移..."

  if su-exec nextjs node ./node_modules/prisma/build/index.js migrate deploy \
       --schema=./prisma/schema.prisma 2>&1; then
    echo "[entrypoint] 数据库迁移完成 ✓"
  else
    echo "[entrypoint] ⚠️  数据库迁移失败，尝试继续启动..."
  fi
else
  # Turso 模式 - 迁移由 instrumentation.ts 在应用启动时自动执行
  echo "[entrypoint] Turso 模式 - 迁移将在应用启动时自动执行"

  if [ -z "${TURSO_DATABASE_URL:-}" ]; then
    echo "[entrypoint] ⚠️  警告: TURSO_DATABASE_URL 未设置"
  fi
  if [ -z "${TURSO_AUTH_TOKEN:-}" ]; then
    echo "[entrypoint] ⚠️  警告: TURSO_AUTH_TOKEN 未设置"
  fi
fi

# ------------------------------------------
# 3. 降权启动 Next.js
# ------------------------------------------
echo "[entrypoint] 启动 Next.js 服务..."
exec su-exec nextjs node server.js
