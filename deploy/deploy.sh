#!/bin/bash
# ============================================
# LifeCycle 一键部署脚本
# ============================================
# 使用方式:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh
# ============================================

set -euo pipefail

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ============================================
# 1. 前置检查
# ============================================
echo "============================================"
echo "  LifeCycle 部署脚本"
echo "============================================"
echo ""

command -v docker >/dev/null 2>&1 || error "Docker 未安装。请先安装 Docker: https://docs.docker.com/engine/install/"
command -v docker compose >/dev/null 2>&1 || error "Docker Compose 未安装。"

# ============================================
# 2. 检查环境变量文件
# ============================================
ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
    warn "未找到 $ENV_FILE，正在从模板创建..."
    
    # 自动生成安全密钥
    AUTH_SECRET=$(openssl rand -base64 32)
    CRON_SECRET=$(openssl rand -hex 16)
    
    cat > "$ENV_FILE" <<EOF
# ============================================
# LifeCycle 生产环境配置
# 请修改以下值后再部署！
# ============================================

# 你的域名（必改）
NEXT_PUBLIC_APP_URL=https://your-domain.com
BETTER_AUTH_URL=https://your-domain.com

# 认证密钥（已自动生成，保管好！）
BETTER_AUTH_SECRET=${AUTH_SECRET}

# Cron 任务密钥（已自动生成）
CRON_SECRET=${CRON_SECRET}

# 应用端口（Nginx 代理到此端口）
APP_PORT=3000
EOF

    warn "已创建 $ENV_FILE，请修改域名后重新运行此脚本！"
    warn "文件位置: $(pwd)/$ENV_FILE"
    exit 0
fi

# 加载环境变量
source "$ENV_FILE"

# 检查是否还是默认值
if [[ "$NEXT_PUBLIC_APP_URL" == *"your-domain"* ]]; then
    error "请先修改 $ENV_FILE 中的域名配置！"
fi

log "环境变量检查通过"

# ============================================
# 3. 替换 Nginx 配置中的域名
# ============================================
DOMAIN=$(echo "$NEXT_PUBLIC_APP_URL" | sed 's|https\?://||' | sed 's|/.*||')

log "检测到域名: $DOMAIN"

# 替换 Nginx 配置中的域名占位符
sed -i "s/your-domain.com/$DOMAIN/g" deploy/nginx/conf.d/default.conf
sed -i "s/your-domain.com/$DOMAIN/g" deploy/nginx/conf.d/ssl.conf.example

log "Nginx 配置已更新"

# ============================================
# 4. 构建和启动
# ============================================
echo ""
log "开始构建 Docker 镜像..."
docker compose --env-file "$ENV_FILE" build --no-cache

log "启动服务..."
docker compose --env-file "$ENV_FILE" up -d

echo ""
log "等待应用启动..."
sleep 10

# 健康检查
if docker compose ps | grep -q "healthy"; then
    log "应用启动成功！"
else
    warn "应用正在启动中，请稍后检查: docker compose ps"
fi

# ============================================
# 5. 数据库迁移
# ============================================
log "执行数据库迁移..."
docker compose exec app npx prisma db push --accept-data-loss 2>/dev/null || \
    docker compose exec app npx prisma db push

log "数据库迁移完成"

# ============================================
# 6. SSL 证书（可选）
# ============================================
echo ""
echo "============================================"
echo "  部署完成！"
echo "============================================"
echo ""
echo "  HTTP 访问: http://$DOMAIN"
echo ""
echo "  获取 SSL 证书:"
echo "    docker compose run --rm certbot certonly \\"
echo "      --webroot -w /var/www/certbot \\"
echo "      -d $DOMAIN \\"
echo "      --email your-email@example.com \\"
echo "      --agree-tos --no-eff-email"
echo ""
echo "  启用 HTTPS:"
echo "    cp deploy/nginx/conf.d/ssl.conf.example deploy/nginx/conf.d/default.conf"
echo "    docker compose restart nginx"
echo ""
echo "  查看日志:"
echo "    docker compose logs -f app"
echo ""
echo "  停止服务:"
echo "    docker compose --env-file .env.production down"
echo ""
echo "============================================"
