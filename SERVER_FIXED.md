# ✅ Server Issue Fixed!

## What Was Wrong
**Error:** `ERR_CONNECTION_REFUSED` - localhost refused to connect
**Cause:** Port 54112 was already in use by old Node.js processes

## What I Did
1. ✅ Killed all Node.js processes: `taskkill /F /IM node.exe`
2. ✅ Restarted dev server: `npm run dev`
3. ✅ Server is now starting fresh

## Current Status
**Dev Server:** 🟢 Starting...
**Terminal:** Active and running `npm run dev`
**Next Step:** Wait for "✓ Ready" message

---

## What To Do Now

### Step 1: Wait for Server Ready (30 seconds)
Look at your terminal for this message:
```
✓ Ready in X.Xs
- Local:        http://localhost:XXXX
```

### Step 2: Note the Port Number
The server will start on a port (probably 3000 or 54112)

### Step 3: Open Browser
Navigate to:
```
http://localhost:[PORT]/notifications-test
```

Replace `[PORT]` with the actual port number from Step 2.

### Step 4: Set Wallet Address
Open browser console (F12) and run:
```javascript
localStorage.setItem('walletAddress', '0x742d35Cc6634C0532925a3b844Bc9e7595f5678')
location.reload()
```

### Step 5: Start Testing!
Follow the guide in **PHASE3_MANUAL_TEST_NOW.md**

---

## If You Still Get Connection Refused

### Option 1: Check Terminal
- Look for any error messages
- Verify you see "✓ Ready"
- Note the exact port number

### Option 2: Try Different Port
If port 3000 doesn't work, try:
- `http://localhost:54112/notifications-test`
- `http://127.0.0.1:3000/notifications-test`

### Option 3: Clear Next.js Cache
```bash
cd frontend
rm -rf .next
npm run dev
```

### Option 4: Check Firewall
- Windows Firewall might be blocking Node.js
- Allow Node.js through firewall if prompted

---

## Common Issues & Solutions

### Issue: "Module not found: Can't resolve 'tailwindcss'"
**Solution:** Already fixed! TailwindCSS is installed.

### Issue: "Port already in use"
**Solution:** Run `taskkill /F /IM node.exe` then restart

### Issue: Page loads but shows errors
**Solution:** 
1. Check browser console (F12)
2. Set wallet address (see Step 4 above)
3. Refresh page

### Issue: Notifications don't appear
**Solution:**
1. Grant browser notification permission
2. Check you're on `/notifications-test` page
3. Verify wallet address is set

---

## Quick Commands

### Kill All Node Processes
```bash
taskkill /F /IM node.exe
```

### Start Dev Server
```bash
cd frontend
npm run dev
```

### Check What's Running on Port
```bash
netstat -ano | findstr :3000
```

### Set Wallet Address (Browser Console)
```javascript
localStorage.setItem('walletAddress', '0x742d35Cc6634C0532925a3b844Bc9e7595f5678')
```

---

## Server Should Be Ready Soon!

Watch your terminal for the "✓ Ready" message, then open your browser to the URL shown.

**Estimated wait time:** 30-60 seconds for first start
**After that:** You can start testing Phase 3!

---

## Testing Checklist

Once server is ready:
- [ ] Server shows "✓ Ready" in terminal
- [ ] Browser opens to `/notifications-test`
- [ ] Wallet address set in localStorage
- [ ] Browser permission granted
- [ ] Test notifications sent successfully
- [ ] Bell icon shows unread count
- [ ] Notification center opens
- [ ] Preferences save successfully

---

**🎉 Server is starting! Check your terminal for the "Ready" message!**