param(
  [string]$RenderApiHost = "127.0.0.1",
  [int]$RenderApiPort = 8080
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js not found. Please install Node.js 20+ first."
}

if (-not (Test-Path "node_modules")) {
  Write-Host "[INFO] node_modules not found, running npm install..."
  npm install
}

Write-Host "[INFO] Ensuring Playwright browser (chromium-headless-shell)..."
try {
  npx playwright install chromium-headless-shell
} catch {
  Write-Warning "Playwright install failed. The service may fail on first render."
}

$env:RENDER_API_HOST = $RenderApiHost
$env:RENDER_API_PORT = "$RenderApiPort"

Write-Host "[INFO] Starting render-api on http://$RenderApiHost:$RenderApiPort"
npm run render-api
