param(
  [switch]$SkipPrisma
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
  param (
    [string]$Title,
    [ScriptBlock]$Action
  )

  Write-Host "==> $Title" -ForegroundColor Cyan
  & $Action
  Write-Host "✔  $Title" -ForegroundColor Green
}

function Install-Npm {
  param ([string]$RelativePath)
  Invoke-Step "Installing node modules in $RelativePath" {
    Push-Location $RelativePath
    if (Test-Path package-lock.json) {
      cmd /c npm ci
    } else {
      cmd /c npm install
    }
    Pop-Location
  }
}

Install-Npm "apps/frontend"
Install-Npm "apps/backend"
Install-Npm "apps/contracts"

if (-not $SkipPrisma) {
  Invoke-Step "Generating Prisma Client" {
    Push-Location "apps/backend"
    cmd /c npx prisma generate
    Pop-Location
  }
} else {
  Write-Host "⚠️  Skip Prisma client generation (--SkipPrisma)." -ForegroundColor Yellow
}

Write-Host "All dependencies installed." -ForegroundColor Green