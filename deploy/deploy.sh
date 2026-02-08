#!/bin/bash
# ============================================
# LifeCycle 一键部署脚本
# ============================================
# 使用方式:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh
#
# 功能:
#   - 检查 Docker 环境
#   - 自动生成环境变量文件（含安全密钥）
#   - 构建镜像并启动服务
#   - 健康检查验证
# ============================================

set -euo pipefail

# ---- 颜色 ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info()  { echo -e "${CYAN}[i]${NC} $1"; }

# ============================================
# 1. 前置检查
# ============================================
echo ""
echo "============================================"
echo "  LifeCycle 一键部署"
echo "============================================"
echo ""

command -v docker >/dev/null 2>&1 || error "Docker 未安装。请先安装: https://docs.docker.com/engine/install/"
docker compose version >/dev/null 2>&1 || error "Docker Compose 未安装或版本过旧。"
log "Docker 环境检查通过"

# ============================================
# 2. 环境变量
# ============================================
ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
    warn "未找到 $ENV_FILE，正在自动生成..."

    # 自动生成安全密钥
    AUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    CRON_SECRET=$(openssl rand -hex 16 2>/dev/null || head -c 16 /dev/urandom | xxd -p)

    cat > "$ENV_FILE" <<EOF
# ============================================
# LifeCycle 生产环境配置
# 由 deploy.sh 自动生成于 $(date '+%Y-%m-%d %H:%M:%S')
# ============================================

# 认证密钥（已自动生成，请妥善保管）
BETTER_AUTH_SECRET=${AUTH_SECRET}

# 应用端口
APP_PORT=3000

# 数据库（默认 SQLite）
DATABASE_PROVIDER=sqlite

# 定时任务
CRON_SECRET=${CRON_SECRET}
CRON_ENABLED=true
CRON_SCHEDULE="0 9 * * *"
CRON_TIMEZONE=Asia/Shanghai
EOF

    log "已生成 $ENV_FILE（密钥已自动填充）"
    echo ""
    info "查看配置: cat $ENV_FILE"
    info "重新部署: ./deploy/deploy.sh"
    echo ""

    # 询问是否继续
    read -p "是否使用默认配置直接部署？(y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# 加载环境变量
set -a
source "$ENV_FILE"
set +a

# 检查关键变量
if [ -z "${BETTER_AUTH_SECRET:-}" ] || [ "$BETTER_AUTH_SECRET" = "请替换为随机密钥" ]; then
    error "BETTER_AUTH_SECRET 未设置！请编辑 $ENV_FILE"
fi

log "环境变量加载完成"

# ============================================
# 3. 拉取/构建镜像
# ============================================
echo ""

# 检查 docker-compose.yml 是否配置了 build（本地构建模式）
if grep -q "^\s*build:" docker-compose.yml; then
    info "检测到本地构建模式，开始构建 Docker 镜像..."
    docker compose --env-file "$ENV_FILE" build
    log "镜像构建完成"
else
    info "使用预构建镜像，拉取最新版本..."
    docker compose --env-file "$ENV_FILE" pull
    log "镜像拉取完成"
fi

# ============================================
# 4. 启动服务
# ============================================
info "启动服务..."

docker compose --env-file "$ENV_FILE" up -d

log "容器已启动"

# ============================================
# 5. 健康检查
# ============================================
echo ""
info "等待应用启动..."

MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if docker compose --env-file "$ENV_FILE" ps 2>/dev/null | grep -q "healthy"; then
        break
    fi
    sleep 3
    WAITED=$((WAITED + 3))
    printf "."
done
echo ""

if docker compose --env-file "$ENV_FILE" ps 2>/dev/null | grep -q "healthy"; then
    log "应用启动成功！"
else
    CONTAINER_STATUS=$(docker compose --env-file "$ENV_FILE" ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null || echo "未知")
    warn "应用仍在启动中（健康检查有 40s 启动宽限期）"
    echo "  当前状态: $CONTAINER_STATUS"
    echo "  查看日志: docker compose --env-file $ENV_FILE logs -f app"
fi

# ============================================
# 6. 完成
# ============================================
APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:${APP_PORT:-3000}}"

echo ""
echo "============================================"
echo -e "  ${GREEN}部署完成！${NC}"
echo "============================================"
echo ""
echo "  访问地址: $APP_URL"
echo ""
echo "  常用命令:"
echo "    查看日志:   docker compose --env-file $ENV_FILE logs -f"
echo "    重启服务:   docker compose --env-file $ENV_FILE restart"
echo "    停止服务:   docker compose --env-file $ENV_FILE down"
echo "    更新部署:   ./deploy/update.sh"
echo ""
echo "============================================"
