# 🚀 TreasuryFlow V3.0 - Complete Setup Guide

This guide will walk you through setting up TreasuryFlow V3.0 from scratch.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **Git** for version control
- **MetaMask** or compatible Web3 wallet
- **Arc Testnet USDC** (get from [faucet](https://faucet.arc.network))
- **Code Editor** (VS Code recommended)

### Optional (for full features):
- Circle Developer account (for Programmable Wallets)
- Anthropic API key (for AI invoice extraction)
- Telegram/Discord webhooks (for notifications)

## 🔧 Step 1: Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/treasuryflow.git
cd treasuryflow
```

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## ⚙️ Step 2: Environment Configuration

### Create Environment File

```bash
cp .env.example .env
```

### Configure Required Variables

Edit `.env` and add these **required** values:

```bash
# Arc Network
ARC_TESTNET_RPC_URL=https://rpc-testnet.arc.network
DEPLOYER_PRIVATE_KEY=your_wallet_private_key_without_0x

# These will be filled after deployment
NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=
NEXT_PUBLIC_AUTO_SWAP_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=
NEXT_PUBLIC_EURC_ADDRESS=
```

⚠️ **IMPORTANT**: Never commit your `.env` file or share your private key!

### Optional Configuration

For full features, also add:

```bash
# Circle Programmable Wallets
NEXT_PUBLIC_CIRCLE_APP_ID=your_circle_app_id
CIRCLE_API_KEY=your_circle_api_key

# AI Features
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 📜 Step 3: Deploy Smart Contracts

### Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 3 Solidity files successfully
```

### Run Tests (Recommended)

```bash
npm run test
```

All tests should pass:
```
✓ Should set the correct owner
✓ Should schedule a basic payment
✓ Should execute batch payments
... (more tests)

45 passing (2s)
```

### Deploy to Arc Testnet

```bash
npm run deploy
```

Expected output:
```
🚀 TreasuryFlow V3.0 Deployment
================================

Deploying contracts with account: 0x742d...
✅ USDC deployed to: 0x...
✅ EURC deployed to: 0x...
✅ AutoSwap deployed to: 0x...
✅ TreasuryVault deployed to: 0x...

📝 Add these to your .env file:
NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=0x...
NEXT_PUBLIC_AUTO_SWAP_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_EURC_ADDRESS=0x...
```

### Update Environment Variables

Copy the contract addresses from the deployment output and paste them into your `.env` file.

## 🌐 Step 4: Configure MetaMask

### Add Arc Testnet to MetaMask

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter these details:

```
Network Name: Arc Testnet
RPC URL: https://rpc-testnet.arc.network
Chain ID: 42170
Currency Symbol: ETH
Block Explorer: https://testnet.arcscan.com
```

### Get Test USDC

1. Visit [Arc Faucet](https://faucet.arc.network)
2. Connect your wallet
3. Request USDC (for gas fees)
4. Wait for confirmation

## 🎨 Step 5: Run Frontend

### Start Development Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.3s
```

### Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the TreasuryFlow landing page!

## 🔗 Step 6: Connect Wallet & Test

### Connect Your Wallet

1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Ensure you're on Arc Testnet
4. Your address should appear in the header

### Test Core Features

#### 1. View Balances

- Navigate to Dashboard
- You should see your USDC and EURC balances
- Balances should match your vault contract

#### 2. Schedule a Payment

```
1. Click "Schedule Payment"
2. Enter recipient address
3. Enter amount (e.g., 100 USDC)
4. Set frequency (e.g., Monthly)
5. Add description
6. Click "Schedule"
7. Approve transaction in MetaMask
8. Wait for confirmation
```

#### 3. Execute Payment

```
1. Go to "Payments" tab
2. Find your scheduled payment
3. Wait until "Next Execution" time passes
4. Click "Execute"
5. Approve transaction
6. Payment should complete in ~2 seconds
```

## 🧪 Step 7: Verify Deployment

### Check Contract on Explorer

1. Visit [Arc Testnet Explorer](https://testnet.arcscan.com)
2. Search for your TreasuryVault address
3. Verify contract is deployed
4. Check recent transactions

### Verify Contract Code (Optional)

```bash
npx hardhat verify --network arcTestnet \
  YOUR_VAULT_ADDRESS \
  YOUR_USDC_ADDRESS \
  YOUR_EURC_ADDRESS \
  YOUR_AUTOSWAP_ADDRESS
```

## 🎯 Step 8: Enable Optional Features

### AI Invoice Extraction

1. Get Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to `.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-your-key
   ```
3. Restart dev server
4. Upload invoice in "Payments" tab
5. AI will extract payment details automatically

### Circle Programmable Wallets

1. Sign up at [Circle Developer Console](https://console.circle.com)
2. Create new app
3. Get App ID and API Key
4. Add to `.env`:
   ```bash
   NEXT_PUBLIC_CIRCLE_APP_ID=your_app_id
   CIRCLE_API_KEY=your_api_key
   ```
5. Restart dev server
6. Users can now create embedded wallets

### Telegram Notifications

1. Create Telegram bot with [@BotFather](https://t.me/botfather)
2. Get bot token
3. Get your chat ID (use [@userinfobot](https://t.me/userinfobot))
4. Add to `.env`:
   ```bash
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```
5. You'll receive payment notifications in Telegram

## 🐛 Troubleshooting

### "Cannot connect to Arc network"

**Solution**: 
- Check RPC URL in `.env`
- Ensure Arc Testnet is added to MetaMask
- Try alternative RPC: `https://rpc-testnet.arc.network`

### "Transaction failed: insufficient funds"

**Solution**:
- Get more USDC from faucet for gas fees
- Check your wallet balance
- Ensure you're on Arc Testnet

### "Contract not found"

**Solution**:
- Verify contract addresses in `.env` match deployment
- Check you're on correct network (Arc Testnet)
- Re-deploy if necessary

### "Invoice extraction not working"

**Solution**:
- Add `ANTHROPIC_API_KEY` to `.env`
- Restart dev server
- Check API key is valid
- Ensure file is PDF, PNG, or JPG

### "Slow performance"

**Solution**:
- Clear browser cache
- Check network connection
- Enable caching in production
- Use production build: `npm run build && npm start`

### TypeScript Errors

**Solution**:
- Run `npm install` in both root and frontend
- Delete `node_modules` and reinstall
- Check Node.js version (18+ required)

## 📊 Step 9: Production Deployment

### Build for Production

```bash
cd frontend
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy Contracts to Mainnet

```bash
# Update .env with mainnet RPC
ARC_MAINNET_RPC_URL=https://rpc.arc.network

# Deploy
npm run deploy:mainnet
```

⚠️ **WARNING**: Mainnet deployment uses real funds. Test thoroughly on testnet first!

## 🎓 Next Steps

1. **Read Documentation**: Check out [API_DOCS.md](./API_DOCS.md)
2. **Join Community**: [Discord](https://discord.gg/treasuryflow)
3. **Explore Features**: Try batch payments, auto-rebalancing
4. **Customize**: Modify UI, add features
5. **Deploy Production**: When ready, deploy to mainnet

## 📞 Support

Need help? We're here for you:

- **Documentation**: [docs.treasuryflow.com](https://docs.treasuryflow.com)
- **Discord**: [discord.gg/treasuryflow](https://discord.gg/treasuryflow)
- **Email**: support@treasuryflow.com
- **GitHub Issues**: [github.com/treasuryflow/issues](https://github.com/treasuryflow/treasuryflow/issues)

## ✅ Setup Checklist

Use this checklist to track your progress:

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] `.env` file configured
- [ ] Contracts compiled
- [ ] Tests passing
- [ ] Contracts deployed to testnet
- [ ] Contract addresses added to `.env`
- [ ] MetaMask configured with Arc Testnet
- [ ] Test USDC obtained from faucet
- [ ] Frontend running locally
- [ ] Wallet connected successfully
- [ ] Test payment scheduled
- [ ] Test payment executed
- [ ] Contracts verified on explorer
- [ ] Optional features configured (if desired)

## 🎉 Congratulations!

You've successfully set up TreasuryFlow V3.0! You now have a fully functional smart treasury management system.

**What you can do now:**
- Schedule recurring payments
- Execute batch payments
- Upload invoices with AI extraction
- Monitor treasury health
- Auto-rebalance currencies
- Track supplier payments

Happy treasury managing! 🚀

---

**Built with ❤️ for Arc DeFi Hackathon 2025**