# 🔗 TreasuryFlow - Complete Page URLs

## Base URL
When running locally: `http://localhost:3000`

---

## 📄 All Available Pages

### 1. 🏠 Homepage / Landing
**URL**: `http://localhost:3000/`
**Features**:
- Landing page with "Connect Wallet" button
- Redirects to dashboard after wallet connection

---

### 2. 📊 Dashboard (Main App)
**URL**: `http://localhost:3000/dashboard`
**Features**:
- Balance cards (USDC, EURC, Total)
- Quick action buttons:
  - Schedule Payment
  - Execute Batch
  - CCTP Bridge
  - View Analytics
- Scheduled payments list
- Treasury chart
- Health score
- Recent transactions

**Demo Mode**: `http://localhost:3000/dashboard?demo=true`

---

### 3. 📈 Analytics
**URL**: `http://localhost:3000/analytics`
**Features**:
- Cash flow analysis charts
- Spending breakdown (doughnut chart)
- 30-day ML forecast
- Key metrics dashboard
- Time range selector (7d, 30d, 90d, 1y)
- CSV export
- AI-generated insights

---

### 4. 🌉 CCTP Bridge
**URL**: `http://localhost:3000/bridge`
**Features**:
- Cross-chain USDC transfers
- Chain selector (7+ chains)
- Amount input
- Fee calculation
- Transfer history
- FAQ section
- Technical details

**Supported Chains**:
- Ethereum
- Arbitrum
- Polygon
- Optimism
- Base
- Avalanche
- Arc Network

---

### 5. 🔐 Multi-Sig Approvals
**URL**: `http://localhost:3000/approvals`
**Features**:
- Pending approval requests
- Approval workflow
- Payment details
- Approve/Reject buttons
- Approval history
- Multi-signature management

---

### 6. 📝 Audit Logs
**URL**: `http://localhost:3000/audit`
**Features**:
- Complete audit trail
- Action logging
- Timestamp tracking
- User identification
- Search and filter
- Export capabilities
- Compliance reporting

---

### 7. ⚙️ Settings
**URL**: `http://localhost:3000/settings`
**Features**:
- Security settings
- Two-Factor Authentication (2FA)
- Account information
- Notification preferences
- Email notifications
- Security alerts
- Approval requests

---

### 8. 🧪 Analytics Test Page
**URL**: `http://localhost:3000/analytics-test`
**Features**:
- Test suite for Phase 4 analytics
- Tab navigation:
  - Advanced Analytics
  - Spending Patterns
  - Supplier Performance
  - Tax Reporting
- Component testing
- Debug information

---

### 9. 🔔 Notifications Test
**URL**: `http://localhost:3000/notifications-test`
**Features**:
- Notification system testing
- Browser notification permission
- Test notification buttons
- Notification center
- Statistics dashboard
- Debug information

---

### 10. 🎨 Phase 1 Testing Dashboard
**URL**: `http://localhost:3000/test-phase1`
**Features**:
- Dark mode testing
- Loading skeleton testing
- Keyboard shortcuts testing
- Command palette (Cmd/Ctrl + K)
- Empty states testing
- Confirmation dialogs testing
- Complete testing checklist

---

## 🎯 Quick Access URLs

### For Demo/Presentation
```
Main Dashboard (Demo Mode):
http://localhost:3000/dashboard?demo=true

Analytics:
http://localhost:3000/analytics

CCTP Bridge:
http://localhost:3000/bridge

Multi-Sig Approvals:
http://localhost:3000/approvals

Audit Logs:
http://localhost:3000/audit
```

### For Testing
```
Phase 1 Tests:
http://localhost:3000/test-phase1

Analytics Tests:
http://localhost:3000/analytics-test

Notifications Tests:
http://localhost:3000/notifications-test
```

---

## 🚀 Navigation Flow

### From Homepage
1. **Connect Wallet** → Dashboard
2. **Demo Mode** → Dashboard with sample data

### From Dashboard
- **Schedule Payment** → Modal (stays on dashboard)
- **Execute Batch** → Modal (stays on dashboard)
- **CCTP Bridge** → Modal (stays on dashboard)
- **View Analytics** → `/analytics` page

### Navigation Menu (if implemented)
- Dashboard
- Analytics
- Bridge
- Approvals
- Audit
- Settings

---

## 📱 Mobile URLs (Same as Desktop)

All URLs work on mobile devices with responsive design:
- `http://localhost:3000/dashboard`
- `http://localhost:3000/analytics`
- `http://localhost:3000/bridge`
- etc.

---

## 🔗 URL Parameters

### Demo Mode
Add to any URL: `?demo=true`

Examples:
- `http://localhost:3000/dashboard?demo=true`
- `http://localhost:3000/analytics?demo=true`
- `http://localhost:3000/bridge?demo=true`

### Enable Demo Mode Permanently
In browser console:
```javascript
localStorage.setItem('demoMode', 'true')
```

Then refresh any page.

### Disable Demo Mode
```javascript
localStorage.removeItem('demoMode')
```

---

## 🎬 Demo Presentation URLs (In Order)

### 5-Minute Demo Flow

**1. Start** (30 seconds)
```
http://localhost:3000/dashboard?demo=true
```
Show: Balances, UI, quick actions

**2. Schedule Payment** (1 minute)
```
Stay on dashboard, click "Schedule Payment"
```
Show: AI invoice upload, currency recommendation

**3. Execute Batch** (30 seconds)
```
Stay on dashboard, click "Execute Batch"
```
Show: Multiple payments, gas savings

**4. CCTP Bridge** (1 minute)
```
http://localhost:3000/bridge
```
Show: Multi-chain support, fee calculation

**5. Analytics** (1 minute)
```
http://localhost:3000/analytics
```
Show: Charts, forecasts, export

**6. Security Features** (1 minute)
```
http://localhost:3000/approvals
http://localhost:3000/audit
http://localhost:3000/settings
```
Show: Multi-sig, audit logs, 2FA

---

## 🎥 Video Recording URLs

### For Bounty Videos

**Video 1: Core Treasury Features**
```
http://localhost:3000/dashboard?demo=true
```
Show: Balances, scheduling, batch execution

**Video 2: Circle CCTP Integration**
```
http://localhost:3000/bridge
```
Show: Cross-chain transfers, attestation

**Video 3: AI & Analytics**
```
http://localhost:3000/dashboard (Schedule Payment)
http://localhost:3000/analytics
```
Show: AI invoice, currency recommendation, forecasts

**Video 4: Security & Compliance**
```
http://localhost:3000/approvals
http://localhost:3000/audit
http://localhost:3000/settings
```
Show: Multi-sig, audit logs, 2FA

---

## 📸 Screenshot URLs

### For Documentation/Presentation

**Dashboard**:
```
http://localhost:3000/dashboard?demo=true
```

**Analytics**:
```
http://localhost:3000/analytics
```

**Bridge**:
```
http://localhost:3000/bridge
```

**Approvals**:
```
http://localhost:3000/approvals
```

**Audit Logs**:
```
http://localhost:3000/audit
```

**Settings**:
```
http://localhost:3000/settings
```

**Dark Mode** (any page):
Toggle theme button in top right

**Mobile View**:
Resize browser window or use DevTools device emulation

---

## 🔍 Testing URLs

### Comprehensive Testing

**All Features Test**:
```
http://localhost:3000/test-phase1
```

**Analytics Components**:
```
http://localhost:3000/analytics-test
```

**Notification System**:
```
http://localhost:3000/notifications-test
```

---

## 🌐 Production URLs (After Deployment)

When deployed to Vercel/production:

```
https://treasuryflow.vercel.app/
https://treasuryflow.vercel.app/dashboard
https://treasuryflow.vercel.app/analytics
https://treasuryflow.vercel.app/bridge
https://treasuryflow.vercel.app/approvals
https://treasuryflow.vercel.app/audit
https://treasuryflow.vercel.app/settings
```

Add `?demo=true` for demo mode on production too.

---

## 🎯 Quick Reference Card

### Essential URLs
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/dashboard` | Main app interface |
| Analytics | `/analytics` | Charts & insights |
| Bridge | `/bridge` | Cross-chain transfers |
| Approvals | `/approvals` | Multi-sig workflow |
| Audit | `/audit` | Compliance logs |
| Settings | `/settings` | User preferences |

### Demo Mode
Add `?demo=true` to any URL or set in localStorage

### Testing
| Test | URL |
|------|-----|
| Phase 1 | `/test-phase1` |
| Analytics | `/analytics-test` |
| Notifications | `/notifications-test` |

---

## 💡 Pro Tips

1. **Bookmark Demo URLs** for quick access during presentations
2. **Use Demo Mode** to avoid wallet connection issues
3. **Test Dark Mode** on all pages before recording
4. **Check Mobile View** by resizing browser
5. **Clear Cache** if styles don't load: `Ctrl+Shift+R`

---

## 🚀 Start Testing Now

```bash
cd frontend
npm run dev
```

Then visit any URL above!

---

**Last Updated**: 2025-11-15
**Total Pages**: 10 main pages + 3 test pages
**All URLs Working**: ✅