# 🚀 Deploy TreasuryFlow to Vercel

## Two Deployment Methods

### Method 1: Vercel Web Interface (Recommended - Easiest)
### Method 2: Vercel CLI (Advanced)

---

## 🌐 Method 1: Deploy via Vercel Web Interface (5 minutes)

This is the **easiest and recommended** method for deploying TreasuryFlow.

### Step 1: Sign Up / Log In to Vercel

1. Visit **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Repository

1. Once logged in, click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Find **"MasteraSnackin/TreasuryFlow"** in the list
4. Click **"Import"**

### Step 3: Configure Project Settings

Vercel will auto-detect Next.js. Configure these settings:

#### Framework Preset:
- **Framework:** Next.js (auto-detected)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `.next` (auto-filled)
- **Install Command:** `npm install` (auto-filled)

#### Environment Variables:

Click **"Environment Variables"** and add these:

```bash
# Required for production
NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=0xYourDeployedVaultAddress
NEXT_PUBLIC_AUTO_SWAP_ADDRESS=0xYourAutoSwapAddress
NEXT_PUBLIC_USDC_ADDRESS=0xYourUSDCAddress
NEXT_PUBLIC_EURC_ADDRESS=0xYourEURCAddress

# Arc Network (use testnet for now)
NEXT_PUBLIC_ARC_RPC_URL=https://rpc-testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=42161
NEXT_PUBLIC_ARC_EXPLORER=https://explorer-testnet.arc.network

# Circle (optional - for full features)
NEXT_PUBLIC_CIRCLE_APP_ID=your_circle_app_id
CIRCLE_API_KEY=your_circle_api_key

# AI Features (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Demo Mode (enable for testing without wallet)
NEXT_PUBLIC_DEMO_MODE=true
```

**Note:** For initial deployment, you can set `NEXT_PUBLIC_DEMO_MODE=true` to test without blockchain connection.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll see a success screen with your live URL!

### Step 5: Access Your Deployed App

Your app will be live at:
```
https://treasury-flow-[random-id].vercel.app
```

You can also set a custom domain later.

---

## 💻 Method 2: Deploy via Vercel CLI (Advanced)

### Prerequisites

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```
Follow the prompts to authenticate.

### Deployment Steps

#### 1. Navigate to Frontend Directory
```bash
cd c:/Users/first/OneDrive/Desktop/Hackathon/TreasuryFlowv1/frontend
```

#### 2. Create vercel.json Configuration

Create `frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

#### 3. Set Environment Variables

Create `frontend/.env.production`:
```bash
# Arc Network
NEXT_PUBLIC_ARC_RPC_URL=https://rpc-testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=42161
NEXT_PUBLIC_ARC_EXPLORER=https://explorer-testnet.arc.network

# Smart Contracts (update with your deployed addresses)
NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=0xYourVaultAddress
NEXT_PUBLIC_AUTO_SWAP_ADDRESS=0xYourAutoSwapAddress
NEXT_PUBLIC_USDC_ADDRESS=0xYourUSDCAddress
NEXT_PUBLIC_EURC_ADDRESS=0xYourEURCAddress

# Demo Mode
NEXT_PUBLIC_DEMO_MODE=true
```

#### 4. Deploy to Vercel

**For first deployment:**
```bash
vercel
```

This will:
- Ask you to link to existing project or create new one
- Choose: **Create new project**
- Project name: `treasuryflow`
- Confirm settings

**For production deployment:**
```bash
vercel --prod
```

#### 5. Add Environment Variables via CLI

```bash
# Add each environment variable
vercel env add NEXT_PUBLIC_DEMO_MODE production
# Enter value: true

vercel env add NEXT_PUBLIC_ARC_RPC_URL production
# Enter value: https://rpc-testnet.arc.network

# Repeat for all variables...
```

---

## 🔧 Post-Deployment Configuration

### 1. Custom Domain (Optional)

#### Via Vercel Dashboard:
1. Go to your project settings
2. Click **"Domains"**
3. Add your custom domain (e.g., `treasuryflow.com`)
4. Follow DNS configuration instructions

#### Via CLI:
```bash
vercel domains add treasuryflow.com
```

### 2. Environment Variables Management

#### Update via Dashboard:
1. Go to project **Settings** → **Environment Variables**
2. Edit or add new variables
3. Redeploy to apply changes

#### Update via CLI:
```bash
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

### 3. Enable Analytics

1. Go to project **Analytics** tab
2. Enable **Vercel Analytics**
3. Add to your app:
```bash
npm install @vercel/analytics
```

Update `frontend/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 🎯 Quick Start (Recommended Path)

### For Immediate Deployment:

1. **Use Method 1 (Web Interface)**
   - Fastest and easiest
   - No CLI installation needed
   - Visual configuration

2. **Enable Demo Mode**
   - Set `NEXT_PUBLIC_DEMO_MODE=true`
   - Test without blockchain connection
   - Perfect for showcasing UI/UX

3. **Deploy in 5 Minutes**
   - Import from GitHub
   - Configure root directory: `frontend`
   - Add environment variables
   - Click Deploy!

---

## 📋 Deployment Checklist

### Before Deployment:
- [ ] GitHub repository updated with latest code
- [ ] Environment variables prepared
- [ ] Smart contracts deployed (or use demo mode)
- [ ] Build tested locally (`npm run build`)

### During Deployment:
- [ ] Root directory set to `frontend`
- [ ] Framework detected as Next.js
- [ ] Environment variables added
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`

### After Deployment:
- [ ] Visit deployed URL
- [ ] Test all pages (Dashboard, Payments, Bridge, Analytics)
- [ ] Verify demo mode works
- [ ] Check console for errors
- [ ] Test on mobile devices

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Solution: Ensure all dependencies in package.json
cd frontend
npm install
npm run build  # Test locally first
```

**Error: "Environment variable not found"**
```bash
# Solution: Add missing variables in Vercel dashboard
# Or set NEXT_PUBLIC_DEMO_MODE=true for testing
```

### Deployment Succeeds but App Doesn't Work

**Issue: Blank page or errors**
```bash
# Check browser console for errors
# Verify environment variables are set
# Enable demo mode for testing
```

**Issue: "Cannot connect to wallet"**
```bash
# This is expected without proper RPC URL
# Enable demo mode: NEXT_PUBLIC_DEMO_MODE=true
```

### Slow Build Times

```bash
# Optimize by:
# 1. Remove unused dependencies
# 2. Use Vercel's caching
# 3. Minimize bundle size
```

---

## 🚀 Continuous Deployment

Once connected to GitHub, Vercel automatically:
- ✅ Deploys on every push to `master`
- ✅ Creates preview deployments for PRs
- ✅ Runs build checks
- ✅ Provides deployment URLs

### Disable Auto-Deploy (if needed):
1. Go to project **Settings** → **Git**
2. Toggle **"Production Branch"** settings
3. Choose manual deployment

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard Provides:

1. **Analytics**
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

2. **Logs**
   - Build logs
   - Function logs
   - Error tracking

3. **Performance**
   - Core Web Vitals
   - Lighthouse scores
   - Load times

4. **Deployments**
   - Deployment history
   - Rollback capability
   - Preview URLs

---

## 🎉 Success Indicators

Your deployment is successful when:

1. ✅ Build completes without errors
2. ✅ Deployment URL is accessible
3. ✅ Dashboard page loads correctly
4. ✅ All navigation links work
5. ✅ Demo mode displays data (if enabled)
6. ✅ No console errors (or only expected ones)
7. ✅ Mobile responsive design works
8. ✅ All pages render correctly

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs
- **Environment Variables:** https://vercel.com/docs/environment-variables

---

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs:**
   - Go to deployment → View Function Logs
   - Look for error messages

2. **Vercel Community:**
   - https://github.com/vercel/vercel/discussions

3. **Next.js Discord:**
   - https://nextjs.org/discord

---

## 🎯 Recommended Deployment Flow

```
1. Push latest code to GitHub ✅ (Already done!)
   ↓
2. Go to vercel.com
   ↓
3. Import GitHub repository
   ↓
4. Set root directory: frontend
   ↓
5. Add environment variables
   ↓
6. Enable demo mode (NEXT_PUBLIC_DEMO_MODE=true)
   ↓
7. Click Deploy
   ↓
8. Wait 2-3 minutes
   ↓
9. Visit your live URL! 🎉
```

---

**Last Updated:** 2025-11-16
**Status:** ✅ Ready to Deploy
**Estimated Time:** 5-10 minutes
**Difficulty:** Easy (Web Interface) / Medium (CLI)