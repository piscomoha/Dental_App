@echo off
REM Dental App - Electron Startup Script for Windows

echo.
echo ===============================================
echo   Cabinet Dentaire - Electron Launcher
echo ===============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] pnpm is not installed globally
    echo Installing pnpm...
    npm install -g pnpm
)

echo [1] Checking and installing dependencies...
cd /d "%~dp0"
call pnpm install

echo.
echo [2] Backend Status Check
echo Checking if Laravel backend is running on port 8000...

REM Try to reach the backend
curl --silent --fail http://localhost:8000/api 2>nul
if %ERRORLEVEL% EQ 0 (
    echo [OK] Backend is running
) else (
    echo [WARNING] Backend does not appear to be running
    echo Please start the backend with:
    echo   cd dental-backend
    echo   php artisan serve --host=localhost --port=8000
    echo.
)

echo.
echo [3] Starting Electron Application...
echo.
echo Applications will open:
echo   - Vite Dev Server: http://localhost:5173
echo   - Electron App: Desktop window (1400x900)
echo.
echo Use Press F12 or Ctrl+Shift+I to open Developer Tools
echo.

REM Start the development server and electron
call pnpm run dev:electron

pause
