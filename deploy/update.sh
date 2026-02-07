#!/bin/bash
# ============================================
# LifeCycle 更新部署脚本
# 用于代码更新后重新构建和部署
# ============================================

set -euo pipefail

ENV_FILE=".env.production"

echo "[*] 拉取最新代码..."
git pull origin main

echo "[*] 重新构建镜像..."
docker compose --env-file "$ENV_FILE" build --no-cache app

echo "[*] 滚动更新（零停机）..."
docker compose --env-file "$ENV_FILE" up -d --no-deps app

echo "[*] 执行数据库迁移..."
sleep 5
docker compose exec app npx prisma db push

echo "[*] 清理旧镜像..."
docker image prune -f

echo "[✓] 更新完成！"
docker compose ps
