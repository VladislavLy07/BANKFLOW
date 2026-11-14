@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python 3 is required for the local SQLite server. Open index.html for offline demo.
  pause
  exit /b 1
)
start "BANKFLOW" http://127.0.0.1:8000
python backend\server.py
pause
