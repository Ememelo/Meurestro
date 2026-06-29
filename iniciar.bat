@echo off
cd /d "%~dp0"

:: Create Desktop shortcut pointing to the silent VBScript launcher if it doesn't exist
if not exist "%USERPROFILE%\Desktop\MeuRestô.lnk" (
    echo Criando atalho na Área de Trabalho...
    powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'MeuRestô.lnk'));$s.TargetPath='%~dp0MeuResto.vbs';$s.WorkingDirectory='%~dp0';$s.IconLocation='%SystemRoot%\System32\shell32.dll,14';$s.Save()"
)

:: Start Backend Server
start /b "" cmd /c "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Start Frontend Server
start /b "" cmd /c "cd frontend && npm run dev -- --host"

:: Wait 3 seconds and launch browser
timeout /t 3 /nobreak >nul
start http://localhost:5173
