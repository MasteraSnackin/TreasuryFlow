# Phase 3 Notification System - Test & Debug Guide

## 🧪 Testing Overview

This guide provides comprehensive testing and debugging procedures for the Phase 3 Real-time Notifications System.

---

## 📋 Pre-Test Checklist

### 1. Environment Setup
- [ ] Dev server running (`npm run dev`)
- [ ] Browser console open (F12)
- [ ] Network tab monitoring enabled
- [ ] localStorage accessible

### 2. Required Files
- [ ] `frontend/lib/notifications.ts` (590 lines)
- [ ] `frontend/components/NotificationCenter.tsx` (239 lines)
- [ ] `frontend/components/NotificationPreferences.tsx` (348 lines)
- [ ] `frontend/app/notifications-test/page.tsx` (test page)
- [ ] API routes: `/api/notifications/*`

---

## 🎯 Test Scenarios

### Test 1: Browser Notification Permission

**Steps:**
1. Navigate to `http://localhost:3000/notifications-test`
2. Check "Current Status" under Browser Notifications
3. Click "Request Browser Permission"
4. Accept the browser permission prompt

**Expected Results:**
- ✅ Permission status changes from "Not Requested" to "Granted"
- ✅ Browser shows native permission dialog
- ✅ No console errors

**Common Issues:**
```
Issue: Permission already denied
Fix: Clear site data in browser settings or use incognito mode

Issue: Permission dialog doesn't appear
Fix: Check if browser supports Notification API (Chrome, Firefox, Edge)
```

---

### Test 2: In-App Notifications

**Steps:**
1. Click "💰 Test Payment Notification"
2. Click the bell icon in header
3. Verify notification appears in dropdown

**Expected Results:**
- ✅ Bell icon shows unread count badge (red circle with number)
- ✅ Notification appears in dropdown with blue background
- ✅ Notification shows: title, message, timestamp, action button
- ✅ Blue dot indicator for unread status

**Debug Commands:**
```javascript
// In browser console
import { getNotifications } from '@/lib/notifications'
console.log(getNotifications())
```

---

### Test 3: Notification Templates

**Steps:**
1. Click each test button:
   - Payment Notification
   - Approval Notification
   - Security Alert
   - Custom Notification

**Expected Results:**
- ✅ Each notification has correct priority color:
  - Payment: Orange (HIGH)
  - Approval: Orange (HIGH)
  - Security: Red (URGENT)
  - Custom: Yellow (MEDIUM)
- ✅ Correct category icons displayed
- ✅ Action URLs work when clicked

**Verification:**
```javascript
// Check notification structure
const notifications = getNotifications()
console.log(notifications[0])
// Should show: id, timestamp, category, priority, title, message, channels, read, actionUrl
```

---

### Test 4: Mark as Read Functionality

**Steps:**
1. Generate sample notifications
2. Note unread count
3. Click on a notification
4. Verify blue background disappears
5. Click "Mark all read"

**Expected Results:**
- ✅ Clicked notification loses blue background
- ✅ Blue dot indicator disappears
- ✅ Unread count decreases
- ✅ "Mark all read" sets count to 0

**Debug:**
```javascript
// Check read status
import { getNotifications } from '@/lib/notifications'
const unread = getNotifications({ unreadOnly: true })
console.log('Unread:', unread.length)
```

---

### Test 5: Notification Preferences

**Steps:**
1. Scroll to "Notification Preferences" section
2. Toggle each channel on/off
3. Change priority selections for categories
4. Enable quiet hours
5. Click "Save Preferences"

**Expected Results:**
- ✅ Toggles switch smoothly
- ✅ "Saved!" confirmation appears
- ✅ Preferences persist on page reload
- ✅ No console errors

**Verify Persistence:**
```javascript
// Check localStorage
import { getUserPreferences } from '@/lib/notifications'
console.log(getUserPreferences())
```

---

### Test 6: Quiet Hours

**Steps:**
1. Enable quiet hours in preferences
2. Set start: 22:00, end: 08:00
3. Save preferences
4. Send a MEDIUM priority notification
5. Send an URGENT priority notification

**Expected Results:**
- ✅ MEDIUM notifications suppressed during quiet hours
- ✅ URGENT notifications always delivered
- ✅ Console shows "Notification suppressed by user preferences"

**Manual Time Test:**
```javascript
// Simulate quiet hours
const prefs = getUserPreferences()
prefs.quietHours = { enabled: true, start: '00:00', end: '23:59' }
updateUserPreferences(prefs)
// Now try sending notifications
```

---

### Test 7: Filter Tabs

**Steps:**
1. Generate 5+ notifications
2. Mark 2 as read
3. Click "Unread" tab
4. Click "All" tab

**Expected Results:**
- ✅ "Unread" shows only unread notifications
- ✅ "All" shows all notifications
- ✅ Counts update correctly
- ✅ Smooth transition between tabs

---

### Test 8: Delete Notifications

**Steps:**
1. Hover over a notification
2. Click the X button (delete)
3. Click "Clear all" button

**Expected Results:**
- ✅ Individual notification removed
- ✅ Count updates
- ✅ Confirmation dialog for "Clear all"
- ✅ All notifications removed after confirmation

---

### Test 9: API Routes (Email)

**Steps:**
1. Open Network tab
2. Enable email in preferences
3. Add email address to preferences
4. Send a notification

**Expected Results:**
- ✅ POST request to `/api/notifications/email`
- ✅ Status 200 response
- ✅ No CORS errors

**Test API Directly:**
```bash
curl -X POST http://localhost:3000/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "body": "Test message",
    "priority": "HIGH"
  }'
```

---

### Test 10: API Routes (Telegram)

**Steps:**
1. Configure Telegram bot token in `.env`
2. Add chat ID to preferences
3. Enable Telegram in preferences
4. Send notification

**Expected Results:**
- ✅ POST request to `/api/notifications/telegram`
- ✅ Message sent to Telegram (if configured)
- ✅ Graceful fallback if not configured

**Test Setup:**
```bash
# In .env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

---

### Test 11: API Routes (Discord)

**Steps:**
1. Configure Discord webhook in `.env`
2. Add webhook URL to preferences
3. Enable Discord in preferences
4. Send notification

**Expected Results:**
- ✅ POST request to `/api/notifications/discord`
- ✅ Rich embed appears in Discord channel
- ✅ Correct color based on priority

---

### Test 12: Real-time Updates

**Steps:**
1. Open notification center
2. Keep it open
3. In another tab/window, send a notification
4. Return to first tab

**Expected Results:**
- ✅ New notification appears automatically
- ✅ Unread count updates
- ✅ No page refresh needed

**Debug:**
```javascript
// Check listener system
import { addNotificationListener } from '@/lib/notifications'
const unsubscribe = addNotificationListener((notification) => {
  console.log('New notification:', notification)
})
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Notifications Not Appearing

**Symptoms:**
- Bell icon shows no count
- Dropdown is empty
- Console shows no errors

**Diagnosis:**
```javascript
// Check if notifications are being stored
import { getNotifications } from '@/lib/notifications'
console.log('Total notifications:', getNotifications().length)
```

**Fixes:**
1. Clear localStorage: `localStorage.clear()`
2. Reload page
3. Check if `sendNotification()` is being called
4. Verify no JavaScript errors in console

---

### Issue 2: Browser Notifications Not Working

**Symptoms:**
- Permission granted but no desktop notifications
- Console error: "Notification is not defined"

**Diagnosis:**
```javascript
// Check browser support
console.log('Notification' in window) // Should be true
console.log(Notification.permission) // Should be 'granted'
```

**Fixes:**
1. Use HTTPS or localhost (required for Notification API)
2. Check browser compatibility (Chrome 22+, Firefox 22+, Edge 14+)
3. Verify permission is granted
4. Test in incognito mode

---

### Issue 3: Preferences Not Saving

**Symptoms:**
- Changes revert on page reload
- "Saved!" message doesn't appear

**Diagnosis:**
```javascript
// Check if preferences are being updated
import { getUserPreferences } from '@/lib/notifications'
console.log(getUserPreferences())
```

**Fixes:**
1. Check localStorage is enabled
2. Verify wallet address is set: `localStorage.setItem('walletAddress', '0x123...')`
3. Check API route `/api/notifications/preferences` is working
4. Look for console errors

---

### Issue 4: API Routes Failing

**Symptoms:**
- Network errors in console
- 404 or 500 responses
- Email/Telegram/Discord not working

**Diagnosis:**
```bash
# Check if API routes exist
ls frontend/app/api/notifications/
# Should show: email/, telegram/, discord/, preferences/
```

**Fixes:**
1. Verify API route files exist
2. Check `.env` variables are set
3. Restart dev server
4. Check API route syntax (Next.js 14 App Router format)

---

### Issue 5: TypeScript Errors

**Symptoms:**
- Red squiggly lines in VS Code
- Build fails with type errors

**Diagnosis:**
```bash
# Check TypeScript compilation
cd frontend
npx tsc --noEmit
```

**Fixes:**
1. Install missing types: `npm install --save-dev @types/node`
2. Check `tsconfig.json` is correct
3. Restart TypeScript server in VS Code
4. Clear `.next` folder: `rm -rf .next`

---

## 📊 Performance Testing

### Test 1: Load Test (Many Notifications)

```javascript
// Generate 100 notifications
import { sendNotification, NotificationTemplates } from '@/lib/notifications'

for (let i = 0; i < 100; i++) {
  await sendNotification(
    NotificationTemplates.paymentExecuted(`${i * 100}`, 'USDC', `0x${i}`)
  )
}

// Check performance
console.time('render')
// Open notification center
console.timeEnd('render') // Should be < 100ms
```

**Expected:**
- ✅ Renders in < 100ms
- ✅ Smooth scrolling
- ✅ No memory leaks

---

### Test 2: Memory Leak Test

```javascript
// Monitor memory usage
console.memory // Chrome only

// Generate and clear notifications repeatedly
for (let i = 0; i < 10; i++) {
  // Generate 50 notifications
  for (let j = 0; j < 50; j++) {
    await sendNotification(NotificationTemplates.paymentExecuted('100', 'USDC', '0x123'))
  }
  
  // Clear all
  clearAllNotifications()
  
  console.log('Iteration', i, 'Memory:', console.memory.usedJSHeapSize)
}

// Memory should not continuously increase
```

---

## ✅ Test Completion Checklist

### Core Functionality
- [ ] Browser notifications work
- [ ] In-app notifications display correctly
- [ ] Notification center opens/closes
- [ ] Unread count updates
- [ ] Mark as read works
- [ ] Delete notifications works
- [ ] Clear all works
- [ ] Filter tabs work

### Preferences
- [ ] Channel toggles work
- [ ] Priority selection works
- [ ] Quiet hours work
- [ ] Preferences save
- [ ] Preferences persist on reload

### API Integration
- [ ] Email API responds
- [ ] Telegram API responds
- [ ] Discord API responds
- [ ] Preferences API saves data

### Edge Cases
- [ ] Works with 0 notifications
- [ ] Works with 100+ notifications
- [ ] Works with permission denied
- [ ] Works without wallet connected
- [ ] Works in incognito mode

### Performance
- [ ] Renders quickly (< 100ms)
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] No console errors

---

## 🚀 Production Readiness

### Before Deployment:
1. [ ] All tests passing
2. [ ] No console errors
3. [ ] TypeScript compiles without errors
4. [ ] API routes secured with authentication
5. [ ] Rate limiting enabled
6. [ ] Error tracking configured (Sentry)
7. [ ] Analytics tracking added
8. [ ] Documentation updated

### Environment Variables Required:
```bash
# Email (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxx

# Telegram (optional)
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx

# Discord (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
```

---

## 📝 Test Results Template

```markdown
## Phase 3 Test Results

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** Development / Staging / Production

### Test Summary
- Total Tests: 12
- Passed: X
- Failed: Y
- Skipped: Z

### Failed Tests
1. Test Name: [Description]
   - Issue: [What went wrong]
   - Fix Applied: [How it was fixed]
   - Status: [Fixed / In Progress / Blocked]

### Performance Metrics
- Notification render time: Xms
- API response time: Xms
- Memory usage: XMB

### Notes
[Any additional observations]

### Sign-off
- [ ] All critical tests passing
- [ ] Ready for next phase
```

---

## 🔧 Debug Tools

### Browser Console Commands

```javascript
// Import notification functions
import { 
  getNotifications, 
  sendNotification, 
  markAsRead, 
  clearAllNotifications,
  getUserPreferences,
  updateUserPreferences,
  NotificationTemplates
} from '@/lib/notifications'

// Get all notifications
getNotifications()

// Get unread only
getNotifications({ unreadOnly: true })

// Send test notification
sendNotification(NotificationTemplates.paymentExecuted('1000', 'USDC', '0x123'))

// Clear all
clearAllNotifications()

// Check preferences
getUserPreferences()

// Reset preferences
localStorage.removeItem('walletAddress')
location.reload()
```

### Network Monitoring

```javascript
// Monitor all fetch requests
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('Fetch:', args[0])
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Response:', response.status, args[0])
      return response
    })
}
```

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check browser console for errors
2. Verify all files are present
3. Restart dev server
4. Clear browser cache and localStorage
5. Test in incognito mode
6. Check GitHub issues

---

**Last Updated:** 2025-01-14
**Version:** 1.0.0
**Status:** ✅ Ready for Testing