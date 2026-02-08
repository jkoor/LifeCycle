#!/bin/sh
# ============================================
# LifeCycle Docker 容器启动入口脚本
# 自动执行数据库迁移后启动 Next.js 服务
# ============================================

set -e

echo "============================================"
echo "  LifeCycle 服务启动中..."
echo "  数据库模式: ${DATABASE_PROVIDER:-sqlite}"
echo "============================================"

# ------------------------------------------
# SQLite 模式（默认）
# ------------------------------------------
if [ "${DATABASE_PROVIDER}" != "turso" ]; then
  echo "[entrypoint] SQLite 模式 - 执行数据库迁移..."

  # 确保 DATABASE_URL 指向持久化目录
  export DATABASE_URL="${DATABASE_URL:-file:/app/data/lifecycle.db}"

  # 执行 Prisma 迁移（建表/更新表结构）
  npx prisma migrate deploy --schema=./prisma/schema.prisma 2>&1
  echo "[entrypoint] 数据库迁移完成 ✓"
fi

# ------------------------------------------
# Turso 模式
# ------------------------------------------
# Turso 的自动迁移由 instrumentation.ts 在应用启动时处理
# 它会自动读取 prisma/migrations/ 目录下的 SQL 并应用到远程数据库
if [ "${DATABASE_PROVIDER}" = "turso" ]; then
  echo "[entrypoint] Turso 模式 - 迁移将在应用启动时自动执行"

  if [ -z "${TURSO_DATABASE_URL}" ]; then
    echo "[entrypoint] ⚠️  警告: TURSO_DATABASE_URL 未设置"
  fi
  if [ -z "${TURSO_AUTH_TOKEN}" ]; then
    echo "[entrypoint] ⚠️  警告: TURSO_AUTH_TOKEN 未设置"
  fi
fi

echo "[entrypoint] 启动 Next.js 服务..."
exec node server.js
