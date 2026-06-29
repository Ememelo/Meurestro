@echo off
echo ====================================================
echo   MeuResto - Script de Instalacao Automatica
echo ====================================================
echo.

cd /d "%~dp0"

:: 1. Setup Backend virtual environment and dependencies
echo [1/3] Configurando o ambiente virtual do Backend (Python)...
cd backend
if not exist venv (
    python -m venv venv
)
python -m pip install --upgrade pip
.\venv\Scripts\pip.exe install -r requirements.txt
cd ..

:: 2. Setup Frontend dependencies
echo [2/3] Instalando dependencias do Frontend (Node.js/npm)...
cd frontend
call npm install
cd ..

:: 3. Create desktop shortcut immediately
echo [3/3] Criando inicializadores e atalho na Area de Trabalho...
powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'MeuRestô.lnk'));$s.TargetPath='%~dp0MeuResto.vbs';$s.WorkingDirectory='%~dp0';$s.IconLocation='%SystemRoot%\System32\shell32.dll,14';$s.Save()"

echo.
echo ====================================================
echo   Instalacao concluida com sucesso!
echo   Um atalho chamado "MeuResto" foi criado no seu Desktop.
echo   Para iniciar o sistema de forma silenciosa, basta dar um duplo clique nele.
echo ====================================================
pause
