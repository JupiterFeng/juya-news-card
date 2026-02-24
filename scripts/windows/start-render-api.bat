@echo off
setlocal enabledelayedexpansion

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js not found. Please install Node.js 20+ first.
  exit /b 1
)

if not exist node_modules (
  echo [INFO] node_modules not found, running npm install...
  call npm install
  if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    exit /b %errorlevel%
  )
)

echo [INFO] Ensuring Playwright browser (chromium-headless-shell)...
call npx playwright install chromium-headless-shell
if %errorlevel% neq 0 (
  echo [WARN] Playwright install failed. The service may fail on first render.
)

if "%RENDER_API_HOST%"=="" set RENDER_API_HOST=127.0.0.1
if "%RENDER_API_PORT%"=="" set RENDER_API_PORT=8080

echo [INFO] Starting render-api on http://%RENDER_API_HOST%:%RENDER_API_PORT%
call npm run render-api

endlocal
