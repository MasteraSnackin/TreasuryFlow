@echo off
echo Killing processes on common development ports...

REM Kill processes on port 3000 (Next.js default)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a on port 3000
    taskkill /F /PID %%a 2>nul
)

REM Kill processes on port 8545 (Hardhat)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8545') do (
    echo Killing process %%a on port 8545
    taskkill /F /PID %%a 2>nul
)

REM Kill processes on port 54112 (Next.js alternate)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :54112') do (
    echo Killing process %%a on port 54112
    taskkill /F /PID %%a 2>nul
)

echo.
echo All development ports cleared!
echo You can now run:
echo   - npx hardhat node (in one terminal)
echo   - cd frontend && npm run dev (in another terminal)
echo.
pause