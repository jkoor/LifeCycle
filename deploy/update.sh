#!/bin/bash
# ============================================
# LifeCycle 更新部署脚本
# ============================================
# 使用方式:
#   chmod +x deploy/update.sh
#   ./deploy/update.sh
#
# 功能: 拉取最新代码 → 重新构建 → 滚动更新 → 清理旧镜像
# ============================================

set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
    echo "未找到 $ENV_FILE，请先运行 ./deploy/deploy.sh"
    exit 1
fi

echo ""
echo "============================================"
echo "  LifeCycle 更新部署"
echo "============================================"
echo ""

# 1. 拉取最新代码
info "拉取最新代码..."
git pull origin main
log "代码更新完成"

# 2. 重新构建镜像
info "重新构建镜像（--no-cache）..."
docker compose --env-file "$ENV_FILE" build --no-cache
log "镜像构建完成"

# 3. 滚动更新
info "更新容器..."
docker compose --env-file "$ENV_FILE" up -d --no-deps app
log "容器已更新"

# 4. 等待启动
info "等待应用启动..."
sleep 15

# 5. 验证状态
if docker compose --env-file "$ENV_FILE" ps | grep -q "healthy\|Up"; then
    log "更新完成，服务运行正常！"
else
    echo "  查看日志: docker compose --env-file $ENV_FILE logs -f app"
fi

# 6. 清理旧镜像
info "清理悬空镜像..."
docker image prune -f
log "清理完成"

echo ""
docker compose --env-file "$ENV_FILE" ps
echo ""
