@echo off
echo ========================================
echo TailwindCSS Fix Script
echo ========================================
echo.

echo Step 1: Killing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Removing node_modules and package-lock...
if exist node_modules rmdir /S /Q node_modules
if exist package-lock.json del /F /Q package-lock.json
if exist .next rmdir /S /Q .next

echo Step 3: Clearing npm cache...
call npm cache clean --force

echo Step 4: Installing dependencies...
call npm install

echo Step 5: Verifying TailwindCSS installation...
if exist node_modules\tailwindcss (
    echo [SUCCESS] TailwindCSS found in node_modules
) else (
    echo [ERROR] TailwindCSS NOT found - installation failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Fix Complete! Starting dev server...
echo ========================================
echo.

call npm run dev