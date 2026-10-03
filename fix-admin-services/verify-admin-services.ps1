$ErrorActionPreference = "Stop"
Write-Host "Checking DreamSMM admin service fix..." -ForegroundColor Cyan

$files = @(
  "lib\admin\ensure-service-category.ts",
  "app\api\admin\services\route.ts",
  "app\api\admin\services\repair-categories\route.ts",
  "app\api\admin\micosmm-import\route.ts",
  "app\api\admin\smmgen-import\route.ts",
  "app\api\admin\mkapi-import\route.ts",
  "app\api\admin\vipsmm-import\route.ts",
  "app\admin\services\page.tsx"
)

foreach ($f in $files) {
  if (!(Test-Path $f)) { throw "Missing: $f" }
  Write-Host "OK  $f" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next:"
Write-Host "  npm run build"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "After login, repair old services with:"
Write-Host "  Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/admin/services/repair-categories"
