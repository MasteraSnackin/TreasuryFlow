@echo off
echo ========================================
echo TreasuryFlow Development Server Startup
echo ========================================
echo.

REM Kill any existing processes on development ports
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8545') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :54112') do taskkill /F /PID %%a 2>nul
timeout /t 2 >nul

echo.
echo Starting Hardhat Node...
start "Hardhat Node" cmd /k "npx hardhat node"
timeout /t 5 >nul

echo.
echo Deploying Contracts...
npx hardhat run scripts/deploy-v2.js --network localhost
timeout /t 2 >nul

echo.
echo Starting Frontend Dev Server...
start "Frontend Dev" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Services Starting!
echo ========================================
echo.
echo Hardhat Node: http://127.0.0.1:8545
echo Frontend: http://localhost:3000
echo.
echo Wait 10-15 seconds for services to fully start
echo Then open: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul