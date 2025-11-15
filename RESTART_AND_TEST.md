# Quick Restart & Test Guide for Phase 3

## 🚀 Step-by-Step Instructions

### Step 1: Stop the Current Dev Server
In the terminal where `npm run dev` is running:
1. Click on the terminal window
2. Press `Ctrl + C` to stop the server
3. Wait for it to fully stop (you'll see the command prompt return)

### Step 2: Restart the Dev Server
```bash
cd frontend
npm run dev
```

Wait for the message: `✓ Ready in X.Xs`

### Step 3: Note the Port Number
The server will show something like:
```
- Local:        http://localhost:54112
```

**Your port number:** Write it down! (It might be different each time)

### Step 4: Open the Test Page
In your browser, navigate to:
```
http://localhost:[YOUR_PORT]/notifications-test
```

Replace `[YOUR_PORT]` with the actual port number from Step 3.

### Step 5: Set Wallet Address (Required for Testing)
Open browser console (F12) and run:
```javascript
localStorage.setItem('walletAddress', '0x742d35Cc6634C0532925a3b844Bc9e7595f5678')
location.reload()
```

This simulates a connected wallet for testing.

---

## 🧪 Quick Test Checklist

Once the page loads:

### Test 1: Browser Notifications (2 min)
- [ ] Click "Request Browser Permission"
- [ ] Accept the permission dialog
- [ ] Status should show "✅ Granted"

### Test 2: Send Test Notifications (3 min)
- [ ] Click "💰 Test Payment Notification"
- [ ] Check result shows "✅ Payment notification sent!"
- [ ] Click bell icon in header
- [ ] Verify notification appears in dropdown

### Test 3: Notification Center (2 min)
- [ ] Click bell icon to open notification center
- [ ] Verify unread count shows (red badge)
- [ ] Click on a notification
- [ ] Verify blue background disappears (marked as read)
- [ ] Click "Mark all read"
- [ ] Verify unread count becomes 0

### Test 4: Preferences (3 min)
- [ ] Scroll to "Notification Preferences" section
- [ ] Toggle browser notifications on/off
- [ ] Enable quiet hours
- [ ] Set time range (e.g., 22:00 to 08:00)
- [ ] Click "Save Preferences"
- [ ] Verify "Saved!" message appears

### Test 5: Generate Sample Data (1 min)
- [ ] Click "🔄 Generate Sample Notifications"
- [ ] Verify multiple notifications appear
- [ ] Check different priority colors (red, orange, yellow, blue)

---

## ✅ Success Criteria

If all these work, Phase 3 is **FULLY FUNCTIONAL**:
- ✅ Browser notifications permission works
- ✅ Notifications appear in center
- ✅ Mark as read works
- ✅ Preferences save and load
- ✅ Different notification types display correctly

---

## 🐛 If Something Doesn't Work

### Issue: Page shows "Failed to compile"
**Solution:** Check terminal for errors. Most likely still the TailwindCSS issue.
```bash
# Stop server (Ctrl+C)
cd frontend
npm install tailwindcss postcss autoprefixer
npm run dev
```

### Issue: Notifications don't appear
**Solution:** Set wallet address in console:
```javascript
localStorage.setItem('walletAddress', '0x742d35Cc6634C0532925a3b844Bc9e7595f5678')
location.reload()
```

### Issue: Browser permission doesn't work
**Solution:** 
- Use Chrome, Firefox, or Edge (not Safari)
- Make sure you're on localhost (not 127.0.0.1)
- Try incognito mode if permission was previously denied

### Issue: "Cannot find module" errors
**Solution:** Install missing dependencies:
```bash
cd frontend
npm install date-fns
npm run dev
```

---

## 📊 Expected Results

### What You Should See:

1. **Test Page Header:**
   - "Notifications Test Page" title
   - Bell icon with notification center
   - No compilation errors

2. **Browser Notifications Section:**
   - Permission status indicator
   - "Request Browser Permission" button (if not granted)
   - Current status display

3. **Test Buttons:**
   - 5 colorful test buttons
   - Result message area
   - Statistics showing total/unread counts

4. **Notification Center (Bell Icon):**
   - Red badge with unread count
   - Dropdown with notifications list
   - Filter tabs (All / Unread)
   - Action buttons (Mark all read, Clear all)

5. **Preferences Section:**
   - Channel toggles (Browser, Email, Telegram, Discord)
   - Priority selection buttons
   - Quiet hours configuration
   - Save button

---

## 🎯 Next Steps After Testing

### If Everything Works:
1. Document test results
2. Take screenshots
3. Move to Phase 4 (Analytics)

### If Issues Found:
1. Note the specific error
2. Check browser console (F12)
3. Report the issue
4. I'll help debug

---

## 💡 Pro Tips

1. **Keep browser console open** (F12) to see any errors
2. **Test in incognito mode** for clean state
3. **Try different browsers** to verify compatibility
4. **Take screenshots** of working features for documentation

---

## 📞 Need Help?

If you encounter any issues:
1. Check the error message in browser console
2. Check terminal for server errors
3. Refer to `PHASE3_TEST_DEBUG_GUIDE.md` for detailed troubleshooting
4. Check `PHASE3_BUG_REPORT.md` for known issues

---

**Ready to test? Follow the steps above!** 🚀

**Estimated Time:** 10-15 minutes for complete testing