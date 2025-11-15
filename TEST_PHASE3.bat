@echo off
echo ========================================
echo  Phase 3 Notification System Test
echo ========================================
echo.

echo [1/4] Checking if dev server is running...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Dev server not running!
    echo [*] Starting dev server...
    cd frontend
    start cmd /k "npm run dev"
    echo [*] Waiting for server to start...
    timeout /t 10 /nobreak >nul
    cd ..
) else (
    echo [OK] Dev server is running
)

echo.
echo [2/4] Opening test page...
start http://localhost:3000/notifications-test

echo.
echo [3/4] Opening browser console...
echo     Press F12 to open DevTools
echo     Navigate to Console tab

echo.
echo [4/4] Test Instructions:
echo.
echo     1. Request browser notification permission
echo     2. Click test buttons to send notifications
echo     3. Check notification center (bell icon)
echo     4. Configure preferences
echo     5. Verify all features work
echo.
echo     See PHASE3_TEST_DEBUG_GUIDE.md for detailed tests
echo.

echo ========================================
echo  Ready to test!
echo ========================================
echo.
echo Press any key to open test guide...
pause >nul
start PHASE3_TEST_DEBUG_GUIDE.md