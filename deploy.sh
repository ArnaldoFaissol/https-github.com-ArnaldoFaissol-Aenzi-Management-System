#!/usr/bin/env bash
# ============================================================
# Aenzi Management System - Deploy Script
# Target: Ubuntu 24.04 (fresh Vultr/DO/VPS server, run as root)
# Usage (remote): curl -fsSL <raw-url>/deploy.sh | bash
# Usage (local):  scp deploy.sh root@<server>:/root/ && ssh root@<server> 'bash /root/deploy.sh'
# ============================================================
set -euo pipefail

# ---------- Config (edit as needed) ----------
APP_NAME="aenzi"
APP_DIR="/var/www/${APP_NAME}"
REPO_URL="https://github.com/ArnaldoFaissol/https-github.com-ArnaldoFaissol-Aenzi-Management-System.git"
SERVER_NAME="${SERVER_NAME:-_}"   # ex: export SERVER_NAME=aenzi.com.br antes de rodar. "_" = aceita qualquer host.
NODE_VERSION="20"

# Supabase env (passe via env vars OU edite aqui)
VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-https://rgnakshjytnektqjzklp.supabase.co}"
VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-sb_publishable_WU7VnUhndV0blCoWaWngPQ_5uLtpIqn}"
# ---------------------------------------------

log()  { echo -e "\n\033[1;32m[deploy]\033[0m $*"; }
warn() { echo -e "\n\033[1;33m[warn]\033[0m $*"; }
err()  { echo -e "\n\033[1;31m[error]\033[0m $*" >&2; }

# Require root
if [[ $EUID -ne 0 ]]; then
  err "Rode como root (ou com sudo)."
  exit 1
fi

log "1/7 - Atualizando sistema..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

log "2/7 - Instalando Node.js ${NODE_VERSION}, git, nginx, ufw, certbot..."
if ! command -v node >/dev/null || [[ "$(node -v | grep -oP '\d+' | head -1)" != "${NODE_VERSION}" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash -
fi
apt-get install -y nodejs git nginx ufw certbot python3-certbot-nginx

log "3/7 - Clonando / atualizando repositorio em ${APP_DIR}..."
mkdir -p /var/www
if [[ -d "${APP_DIR}/.git" ]]; then
  cd "${APP_DIR}"
  git fetch --all
  git reset --hard origin/HEAD
else
  rm -rf "${APP_DIR}"
  git clone "${REPO_URL}" "${APP_DIR}"
  cd "${APP_DIR}"
fi

log "4/7 - Criando .env.local com credenciais do Supabase..."
cat > "${APP_DIR}/.env.local" <<EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
EOF
chmod 600 "${APP_DIR}/.env.local"

log "5/7 - Instalando dependencias e buildando (isso pode demorar)..."
cd "${APP_DIR}"
npm ci --no-audit --no-fund || npm install --no-audit --no-fund
npm run build

if [[ ! -d "${APP_DIR}/dist" ]]; then
  err "Build falhou: pasta dist/ nao foi criada."
  exit 1
fi

log "6/7 - Configurando Nginx..."
NGINX_CONF="/etc/nginx/sites-available/${APP_NAME}"
cat > "${NGINX_CONF}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAME};

    root ${APP_DIR}/dist;
    index index.html;

    # gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/json application/xml
               application/rss+xml image/svg+xml;

    # SPA fallback (React Router)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache agressivo para assets versionados do Vite
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Nao cachear index.html (para pegar novos deploys)
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF

ln -sf "${NGINX_CONF}" "/etc/nginx/sites-enabled/${APP_NAME}"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

log "7/7 - Configurando firewall..."
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
ufw --force enable || true

IP_ADDR="$(hostname -I | awk '{print $1}')"

echo ""
echo "============================================================"
log "Deploy concluido com sucesso!"
echo "  App em: http://${IP_ADDR}/  (server_name=${SERVER_NAME})"
echo ""
echo "Proximos passos opcionais:"
echo "  1) Apontar um dominio (A record) para ${IP_ADDR}"
echo "  2) Rodar SSL: certbot --nginx -d seudominio.com"
echo "  3) No Supabase Dashboard > Authentication > URL Configuration,"
echo "     adicionar http://${IP_ADDR} (ou seu dominio) em Site URL e Redirect URLs"
echo "============================================================"
