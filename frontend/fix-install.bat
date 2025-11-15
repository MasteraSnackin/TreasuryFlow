@echo off
echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Cleaning up...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .next rmdir /s /q .next

echo Installing dependencies...
call npm install

echo.
echo Done! Now run: npm run dev
pause