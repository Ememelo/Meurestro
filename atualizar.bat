@echo off
echo ====================================================
echo   MeuResto - Atualizando o Sistema...
echo ====================================================
echo.

cd /d "%~dp0"

:: Fetch latest code from Git
echo Buscando atualizações no repositório Git...
git pull

echo.
echo [1/2] Atualizando dependências do Backend...
.\backend\venv\Scripts\pip.exe install -r backend/requirements.txt

echo [2/2] Atualizando dependências do Frontend...
cd frontend
call npm install
cd ..

echo.
echo ====================================================
echo   Sistema atualizado com sucesso!
echo ====================================================
pause
