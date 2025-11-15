@echo off
echo ========================================
echo TreasuryFlow - Simple Startup
echo ========================================
echo.

REM Kill any existing processes on our ports
echo [1/3] Cleaning up ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8545" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Starting Hardhat node in background...
cd /d "%~dp0"
start /B cmd /c "npx hardhat node > hardhat.log 2>&1"
timeout /t 5 /nobreak >nul

echo [3/3] Starting frontend dev server...
cd frontend
start cmd /k "npm run dev"

echo.
echo ========================================
echo Services Starting!
echo ========================================
echo.
echo Hardhat Node: http://127.0.0.1:8545
echo Frontend: http://localhost:3000
echo.
echo Wait 10 seconds, then open: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul