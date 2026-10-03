$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
Write-Host "DreamSMM Admin Services repair" -ForegroundColor Cyan
Write-Host "Project: $root" -ForegroundColor DarkGray

$targets = @(
  "app\admin\services\page.tsx",
  "app\api\admin\services\route.ts",
  "app\api\admin\micosmm-import\route.ts",
  "app\api\admin\smmgen-import\route.ts",
  "app\api\admin\mkapi-import\route.ts",
  "app\api\admin\vipsmm-import\route.ts"
)

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $root "admin-services-backup-$stamp"
New-Item -ItemType Directory -Path $backup -Force | Out-Null

foreach ($file in $targets) {
  $full = Join-Path $root $file
  if (Test-Path $full) {
    $dest = Join-Path $backup $file
    New-Item -ItemType Directory -Path (Split-Path $dest) -Force | Out-Null
    Copy-Item $full $dest -Force
  }
}

Write-Host "Backup created: $backup" -ForegroundColor Green

$helperPath = Join-Path $root "lib\admin\ensure-service-category.ts"
New-Item -ItemType Directory -Path (Split-Path $helperPath) -Force | Out-Null

@'
import { prisma } from "@/lib/prisma";

export function normalizeCategoryName(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

export async function ensureServiceCategory(
  categoryName: string | null | undefined,
  platform: string | null | undefined
) {
  const name = normalizeCategoryName(categoryName);
  const fallback = normalizeCategoryName(platform) || "Other Services";
  const finalName = name || fallback;
  const finalPlatform = normalizeCategoryName(platform) || "Other";

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, platform: true, enabled: true, sortOrder: true },
  });

  const existing = categories.find(
    (category) =>
      normalizeCategoryName(category.name).toLowerCase() === finalName.toLowerCase()
  );

  if (existing) return existing;

  return prisma.category.create({
    data: {
      name: finalName,
      platform: finalPlatform,
      enabled: true,
      sortOrder: 0,
    },
  });
}
'@ | Set-Content $helperPath -Encoding UTF8

function Add-Import($path) {
  $full = Join-Path $root $path
  if (!(Test-Path $full)) { return }
  $s = Get-Content $full -Raw
  if ($s -notmatch 'ensure-service-category') {
    $s = $s -replace '(import\s+\{\s*prisma\s*\}\s+from\s+"@/lib/prisma";)', '$1' + "`r`n" + 'import { ensureServiceCategory } from "@/lib/admin/ensure-service-category";'
    Set-Content $full $s -Encoding UTF8
  }
}

$manual = Join-Path $root "app\api\admin\services\route.ts"
if (Test-Path $manual) {
  Add-Import "app\api\admin\services\route.ts"
  $s = Get-Content $manual -Raw
  if ($s -notmatch 'ensureServiceCategory\(') {
    $marker = 'const created = await prisma.service.create({'
    $call = 'await ensureServiceCategory(category || platform || "Other Services", platform || "Other");'
    if ($s.Contains($marker)) {
      $s = $s.Replace($marker, $call + "`r`n`r`n" + $marker)
    } else {
      $marker = 'const service = await prisma.service.create({'
      if ($s.Contains($marker)) {
        $s = $s.Replace($marker, $call + "`r`n`r`n" + $marker)
      }
    }
    Set-Content $manual $s -Encoding UTF8
  }
}

$imports = @(
  "app\api\admin\micosmm-import\route.ts",
  "app\api\admin\smmgen-import\route.ts",
  "app\api\admin\mkapi-import\route.ts",
  "app\api\admin\vipsmm-import\route.ts"
)

foreach ($path in $imports) {
  $full = Join-Path $root $path
  if (!(Test-Path $full)) { continue }

  Add-Import $path
  $s = Get-Content $full -Raw

  if ($s -notmatch 'ensureServiceCategory\(') {
    $categoryExpr = $null
    $platformExpr = '"Other"'

    if ($s -match 'service\.category') {
      $categoryExpr = 'service.category || service.type'
    } elseif ($s -match 'providerService\.category') {
      $categoryExpr = 'providerService.category'
    } elseif ($s -match 'provider\.category') {
      $categoryExpr = 'provider.category'
    }

    if ($s -match 'getPlatform\(service\)') {
      $platformExpr = 'getPlatform(service)'
    } elseif ($s -match 'getPlatform\(providerService\)') {
      $platformExpr = 'getPlatform(providerService)'
    } elseif ($s -match 'platform\s*=\s*') {
      $platformExpr = 'platform'
    }

    if ($categoryExpr) {
      $call = "await ensureServiceCategory($categoryExpr, $platformExpr);"
      $patterns = @(
        '(\r?\n\s*)(const created\s*=\s*await prisma\.service\.create\()',
        '(\r?\n\s*)(const service\s*=\s*await prisma\.service\.create\()',
        '(\r?\n\s*)(await prisma\.service\.create\()'
      )

      $done = $false
      foreach ($pattern in $patterns) {
        if ($s -match $pattern) {
          $s = [regex]::Replace($s, $pattern, ('$1' + $call + "`r`n`r`n" + '$2'), 1)
          $done = $true
          break
        }
      }

      if ($done) {
        Set-Content $full $s -Encoding UTF8
        Write-Host "Patched: $path" -ForegroundColor Green
      } else {
        Write-Warning "Could not locate service.create in $path"
      }
    }
  }
}

$page = Join-Path $root "app\admin\services\page.tsx"
if (Test-Path $page) {
  $s = Get-Content $page -Raw
  $s = $s -replace '/api/admin/services\?debug=\$\{Date\.now\(\)\}', '/api/admin/services'
  $s = $s -replace '/api/admin/categories\?fresh=\$\{Date\.now\(\)\}', '/api/admin/categories'
  $s = $s -replace 'transition hover:bg-blue-700 transition hover:bg-blue-500', 'transition hover:bg-blue-500'
  $s = $s -replace 'transition hover:bg-gray-50 transition hover:bg-gray-200', 'transition hover:bg-gray-200'
  $s = $s -replace 'bg-slate-50 bg-\[#070a11\]', 'bg-[#070a11]'
  $s = $s -replace 'ÃƒÂ¢Ã¢â‚¬ÂPS', '×'

  $mico = 'setMessage\(["'']MicoSMM service imported successfully\.["'']\);\s*setMico'
  if ($s -match $mico) {
    # no-op; the exact surrounding code differs between versions
  }

  # Add category refresh to the first Mico import success block if it lacks one.
  $idx = $s.IndexOf('MicoSMM service imported successfully.')
  if ($idx -ge 0) {
    $tail = $s.Substring($idx, [Math]::Min(1200, $s.Length - $idx))
    if ($tail -notmatch 'await loadCategories\(\)') {
      $servicePos = $s.IndexOf('await loadServices();', $idx)
      if ($servicePos -ge 0 -and $servicePos -lt ($idx + 1200)) {
        $end = $servicePos + 'await loadServices();'.Length
        $s = $s.Insert($end, "`r`n      await loadCategories();")
      }
    }
  }

  $s = $s -replace 'await Promise\.all\(\[loadServices\(\), loadCategories\(\)\]\);\s*await loadCategories\(\);', 'await Promise.all([loadServices(), loadCategories()]);'
  Set-Content $page $s -Encoding UTF8
  Write-Host "Patched admin services page." -ForegroundColor Green
}

$repair = Join-Path $root "app\api\admin\services\repair-categories\route.ts"
New-Item -ItemType Directory -Path (Split-Path $repair) -Force | Out-Null

@'
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { ensureServiceCategory, normalizeCategoryName } from "@/lib/admin/ensure-service-category";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session || !verifySession(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      select: { id: true, category: true, platform: true },
    });

    let repaired = 0;

    for (const service of services) {
      const category =
        normalizeCategoryName(service.category) ||
        normalizeCategoryName(service.platform) ||
        "Other Services";

      const ensured = await ensureServiceCategory(category, service.platform);

      if (service.category !== ensured.name) {
        await prisma.service.update({
          where: { id: service.id },
          data: { category: ensured.name },
        });
        repaired++;
      }
    }

    return NextResponse.json({
      success: true,
      scanned: services.length,
      repaired,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Repair failed." },
      { status: 500 }
    );
  }
}
'@ | Set-Content $repair -Encoding UTF8

Write-Host ""
Write-Host "DONE." -ForegroundColor Green
Write-Host "Backup: $backup"
Write-Host "Run: .\verify-admin-services.ps1"
