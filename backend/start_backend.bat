@echo off
set PYTHONPATH=.
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
pause
