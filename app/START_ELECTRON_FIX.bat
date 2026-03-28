@echo off
REM Dental App - Electron Startup Script with Electron Fix

echo.
echo ===============================================
echo   Cabinet Dentaire - Electron Launcher
echo ===============================================
echo.

REM Navigate to app directory
cd /d "%~dp0"

echo [1] Checking dependencies...
call pnpm install --force

echo.
echo [2] Clearing Electron cache...
if exist "node_modules" (
    cd node_modules\.pnpm
    for /d %%D in (*electron*) do (
        rmdir /s /q "%%D" 2>nul
    )
    cd ..\..\
)

echo [3] Reinstalling Electron...
call pnpm install --no-frozen-lockfile

echo.
echo [4] Backend Status
timeout /t 2 >nul
curl --silent http://localhost:8000/api >nul 2>&1
if %ERRORLEVEL% EQ 0 (
    echo [OK] Backend is running
) else (
    echo [WARNING] Backend might not be running
    echo Start backend with: php artisan serve --host=localhost --port=8000
    echo.
)

echo [5] Starting Electron App...
echo.
call pnpm run dev:electron

pause
