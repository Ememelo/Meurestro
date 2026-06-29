#!/bin/bash

# Script de deploy em lote do MeuRestô para servidores Ubuntu (DigitalOcean, AWS, etc.)
# Executar como root ou com privilégios sudo.

# Interromper execução em caso de erros
set -e

echo "======================================================"
echo "   Iniciando Deploy Automático do MeuRestô no Ubuntu"
echo "======================================================"

# 1. Atualizar Pacotes do Sistema
echo "--- 1. Atualizando pacotes do sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar Dependências Necessárias (Python, Node, Nginx, Git, PM2)
echo "--- 2. Instalando Python, Node.js, Nginx e Git..."
sudo apt install -y python3-pip python3-venv python3-dev nginx git curl

# Instalar Node.js 18+ (caso não esteja na versão correta)
if ! command -v node &> /dev/null || [ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]; then
    echo "--- Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Instalar PM2 globalmente
echo "--- Instalando PM2 (Gerenciador de Processos)..."
sudo npm install -y -g pm2

# 3. Pegar diretório atual do projeto
APP_DIR=$(pwd)
echo "Diretório do app: $APP_DIR"

# 4. Configurar e Instalar Dependências do Backend
echo "--- 4. Configurando Ambiente Virtual do Python..."
cd "$APP_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# 5. Configurar e Instalar Dependências do Frontend
echo "--- 5. Compilando o Frontend React..."
cd "$APP_DIR/frontend"
npm install
npm run build

# 6. Configurar Servidor de Emails (SMTP) no arquivo .env se não existir
cd "$APP_DIR/backend"
if [ ! -f .env ]; then
    echo "--- Criando arquivo .env padrão..."
    cat <<EOT >> .env
PROJECT_NAME="MeuRestô"
UPLOAD_DIR="./uploads"
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587
SMTP_USERNAME="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-de-aplicativo"
SMTP_FROM="backup@meuresto.com.br"
EOT
    echo "--- IMPORTANTE: Edite o arquivo $APP_DIR/backend/.env com suas credenciais de email SMTP."
fi

# 7. Iniciar Serviços com PM2 (Processos Persistentes em Background)
echo "--- 7. Iniciando Backend com PM2..."
cd "$APP_DIR/backend"
# Parar processos anteriores se houver
pm2 delete meuresto-backend || true
pm2 start "venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000" --name "meuresto-backend"
pm2 save

# 8. Configurar Nginx para Servir o App
echo "--- 8. Configurando Nginx..."
NGINX_CONF="/etc/nginx/sites-available/meuresto"

sudo cat <<EOT > $NGINX_CONF
server {
    listen 80;
    server_name _; # Aceita qualquer IP ou domínio conectado

    # Frontend React (Arquivos Estáticos)
    location / {
        root $APP_DIR/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend FastAPI proxy
    location /api {
        proxy_pass http://127.0.0.1:8000/api;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Uploads dinâmicos de imagens e documentos
    location /uploads {
        proxy_pass http://127.0.0.1:8000/uploads;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOT

# Ativar site no Nginx e recarregar
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default || true
sudo nginx -t
sudo systemctl restart nginx

# 9. Configurar PM2 para iniciar no boot do sistema
echo "--- 9. Configurando Inicialização Automática no Boot..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME || true

echo "======================================================"
echo "   DEPLOY CONCLUÍDO COM SUCESSO!"
echo "   Acesse o sistema pelo IP público do seu servidor."
echo "======================================================"
