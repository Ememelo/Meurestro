# Lira People Management - Script de Execução Local para Desenvolvimento
# Este script inicia o backend (FastAPI) e o frontend (React/Vite) em paralelo.

$host.UI.RawUI.WindowTitle = "Lira People Management - Dev Server"

Write-Host "==========================================================" -ForegroundColor Gold
Write-Host "         INICIANDO LIRA PEOPLE MANAGEMENT (RH)           " -ForegroundColor Gold
Write-Host "==========================================================" -ForegroundColor Gold
Write-Host ""
Write-Host "1. Verificando se os diretórios existem..." -ForegroundColor Gray

$ProjectRoot = Get-Location
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

# Check directories
if (!(Test-Path $BackendDir) -or !(Test-Path $FrontendDir)) {
    Write-Host "Erro: Estrutura de pastas incompleta!" -ForegroundColor Red
    Exit
}

# Start backend in a new window
Write-Host "2. Iniciando o Servidor de API Backend (FastAPI)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir'; & '.\venv\Scripts\Activate.ps1'; `$env:PYTHONPATH='.'; python -m uvicorn app.main:app --reload --port 8000" -WindowStyle Normal

# Start frontend in a new window
Write-Host "3. Iniciando o Servidor de Interface Frontend (Vite)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Gold
Write-Host "   SISTEMA INICIADO COM SUCESSO!                          " -ForegroundColor Emerald
Write-Host "==========================================================" -ForegroundColor Gold
Write-Host ""
Write-Host "Para acessar o sistema, abra o navegador e acesse:"
Write-Host "-> http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Utilize as seguintes credenciais padrão para o primeiro acesso:"
Write-Host "-> Usuário: admin" -ForegroundColor Yellow
Write-Host "-> Senha:   admin" -ForegroundColor Yellow
Write-Host ""
Write-Host "A documentação interativa da API (Swagger) está disponível em:"
Write-Host "-> http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para fechar o sistema, basta fechar as duas janelas de terminal abertas."
Write-Host "==========================================================" -ForegroundColor Gold
