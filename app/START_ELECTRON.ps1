#!/usr/bin/env pwsh

# Dental App - Electron Startup Script for PowerShell

Write-Host ""
Write-Host "==============================================="
Write-Host "   Cabinet Dentaire - Electron Launcher" -ForegroundColor Cyan
Write-Host "==============================================="
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "[OK] pnpm found: v$pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] pnpm is not installed globally" -ForegroundColor Yellow
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

Write-Host ""
Write-Host "[1] Installing dependencies..." -ForegroundColor Cyan
Set-Location $PSScriptRoot
pnpm install

Write-Host ""
Write-Host "[2] Backend Status Check" -ForegroundColor Cyan
Write-Host "Checking if Laravel backend is running on port 8000..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api" -UseBasicParsing -TimeoutSec 2
    Write-Host "[OK] Backend is running" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Backend does not appear to be running" -ForegroundColor Yellow
    Write-Host "Please start the backend or it will fail to connect" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To start backend in another terminal:" -ForegroundColor Cyan
    Write-Host "  cd dental-backend" -ForegroundColor Gray
    Write-Host "  php artisan serve --host=localhost --port=8000" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[3] Starting Electron Application..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Applications will open:" -ForegroundColor Yellow
Write-Host "  - Vite Dev Server: http://localhost:5173" -ForegroundColor Gray
Write-Host "  - Electron App: Desktop window (1400x900)" -ForegroundColor Gray
Write-Host ""
Write-Host "Use F12 or Ctrl+Shift+I to open Developer Tools" -ForegroundColor Yellow
Write-Host ""

# Start development
pnpm run dev:electron

Read-Host "Press Enter to close"
