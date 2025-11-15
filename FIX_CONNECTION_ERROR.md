# 🔧 Fix Connection Refused Error

## Problem
You're seeing "ERR_CONNECTION_REFUSED" when trying to access http://localhost:3000

## Root Cause Analysis

Based on the diagnostics, here are the **5 most likely sources** of the problem:

### 1. **Dev Server Not Running** (MOST LIKELY - 90%)
- The Next.js dev server simply isn't started
- Port 3000 shows no active listener
- Solution: Start the dev server

### 2. **Port Conflict** (LIKELY - 60%)
- Another process is using port 3000
- Port 54112 (VSCode) is blocking startup
- Solution: Kill conflicting processes

### 3. **Frontend Build Issues** (POSSIBLE - 40%)
- Next.js build cache corruption
- Missing dependencies
- Solution: Clean rebuild

### 4. **Environment Configuration** (POSSIBLE - 30%)
- Missing or incorrect .env.local
- Wrong RPC URL configuration
- Solution: Verify environment variables

### 5. **Firewall/Antivirus** (UNLIKELY - 10%)
- Windows Firewall blocking localhost
- Antivirus interfering with Node.js
- Solution: Add exceptions

## Distilled to Top 2 Most Likely Issues

### Issue #1: Dev Server Not Running ⭐⭐⭐⭐⭐
**Confidence: 90%**

**Diagnosis:**
```bash
netstat -ano | findstr "3000"
# Returns nothing = server not running
```

**Fix:**
Use the new simplified startup script:
```bash
SIMPLE_START.bat
```

This will:
1. Kill any conflicting processes
2. Start Hardhat node in background
3. Start Next.js dev server in new window
4. Wait 10 seconds for initialization
5. Open http://localhost:3000

### Issue #2: Port Conflicts ⭐⭐⭐⭐
**Confidence: 60%**

**Diagnosis:**
```bash
netstat -ano | findstr "54112"
# Shows: TCP 0.0.0.0:54112 LISTENING 32172
# This is VSCode's process interfering
```

**Fix:**
The SIMPLE_START.bat script automatically handles this by:
```batch
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %%a
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8545"') do taskkill /F /PID %%a
```

## Step-by-Step Resolution

### Step 1: Clean Start (RECOMMENDED)

1. **Close all terminal windows**
2. **Double-click `SIMPLE_START.bat`**
3. **Wait 10 seconds** for services to initialize
4. **Open browser** to http://localhost:3000

### Step 2: If Still Not Working

**Check if dev server actually started:**
```bash
cd frontend
npm run dev
```

Look for this output:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
○ Network:      http://192.168.x.x:3000
```

**If you see errors:**

#### Error: "EADDRINUSE: address already in use"
```bash
# Kill the process using port 3000
netstat -ano | findstr ":3000"
# Note the PID (last column)
taskkill /F /PID <PID>
```

#### Error: "Module not found" or "Cannot find module"
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

#### Error: "PostCSS plugin error"
Already fixed in postcss.config.js - just restart:
```bash
cd frontend
npm run dev
```

### Step 3: Manual Verification

**Test if port 3000 is listening:**
```bash
netstat -ano | findstr ":3000"
```

Expected output:
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12345
TCP    [::]:3000              [::]:0                 LISTENING       12345
```

**Test if Hardhat node is running:**
```bash
netstat -ano | findstr ":8545"
```

Expected output:
```
TCP    127.0.0.1:8545         0.0.0.0:0              LISTENING       67890
```

### Step 4: Nuclear Option (If Nothing Works)

```bash
# 1. Kill ALL Node processes
taskkill /F /IM node.exe

# 2. Clean everything
cd frontend
rmdir /s /q node_modules
rmdir /s /q .next
del package-lock.json

# 3. Reinstall
npm install

# 4. Start fresh
npm run dev
```

## Validation Checklist

After starting services, verify:

- [ ] Hardhat node running on port 8545
- [ ] Frontend dev server running on port 3000
- [ ] Browser can access http://localhost:3000
- [ ] No console errors in browser
- [ ] Wallet connection button visible
- [ ] Demo mode banner shows (if enabled)

## Expected Behavior

When everything works correctly:

1. **SIMPLE_START.bat runs:**
   - Cleans ports (2 seconds)
   - Starts Hardhat node (5 seconds)
   - Opens new terminal with dev server
   - Shows "Ready in X seconds"

2. **Browser opens to http://localhost:3000:**
   - Landing page loads
   - "Connect Wallet" button visible
   - No console errors
   - Page is responsive

3. **Dashboard accessible:**
   - Click "Launch App" or go to /dashboard
   - Treasury balances show (demo mode)
   - All components render
   - No TypeScript errors

## Still Having Issues?

### Check Browser Console

Press F12 in browser and look for errors:

**Common errors and fixes:**

1. **"Failed to fetch"**
   - RPC URL wrong in .env.local
   - Hardhat node not running
   - Fix: Check NEXT_PUBLIC_RPC_URL

2. **"Hydration error"**
   - Server/client mismatch
   - Fix: Clear .next folder and restart

3. **"Module not found"**
   - Missing dependency
   - Fix: npm install in frontend/

### Check Terminal Output

Look for these in the dev server terminal:

**Good signs:**
```
✓ Compiled successfully
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

**Bad signs:**
```
✗ Failed to compile
Error: Cannot find module
EADDRINUSE: address already in use
```

## Quick Reference Commands

```bash
# Start everything (EASIEST)
SIMPLE_START.bat

# Start manually
cd frontend
npm run dev

# Check what's running
netstat -ano | findstr "3000 8545"

# Kill specific port
for /f "tokens=5" %a in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %a

# Clean rebuild
cd frontend
rmdir /s /q .next
npm run dev

# Full reset
cd frontend
rmdir /s /q node_modules .next
npm install
npm run dev
```

## Success Indicators

You'll know it's working when:

✅ Terminal shows "Ready in X seconds"
✅ Browser loads http://localhost:3000
✅ Landing page displays correctly
✅ No red errors in browser console
✅ "Connect Wallet" button is clickable
✅ Dashboard page loads at /dashboard

## Next Steps After Fix

Once the server is running:

1. Test the landing page
2. Navigate to /dashboard
3. Test wallet connection
4. Try scheduling a payment
5. Check the /approvals page
6. Test dark mode toggle
7. Try keyboard shortcuts (Cmd+K)

---

**Need more help?** Check the error message in your terminal and browser console, then search this document for that specific error.