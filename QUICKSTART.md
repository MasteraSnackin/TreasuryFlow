# 🚀 TreasuryFlow - Quick Start Guide

Get TreasuryFlow running in **5 minutes**!

---

## ⚡ Prerequisites

- Node.js 18+ installed
- Git installed
- MetaMask browser extension

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/treasuryflow.git
cd treasuryflow

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..

# 3. Copy environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
```

---

## 🔧 Configuration

Edit `.env` file:
```bash
# Add your wallet private key (for deployment only)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Arc Network RPC (already configured)
ARC_TESTNET_RPC_URL=https://rpc-testnet.arc.network
```

---

## 🚀 Run the Application

### Option 1: Quick Demo (Recommended)
```bash
# Start the frontend with demo mode
cd frontend
npm run dev
```
Visit **http://localhost:3000** 🎉

### Option 2: Full Setup with Blockchain
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy

# Terminal 3: Start frontend
cd frontend
npm run dev
```

---

## ✅ Verify Installation

### 1. Check Smart Contracts
```bash
npm test
# Expected: ✅ 18 passing tests
```

### 2. Check Frontend
```bash
cd frontend
npm run build
# Expected: ✅ Build successful
```

---

## 🎯 What You Get

### Smart Contracts
- ✅ TreasuryVault - Multi-currency treasury management
- ✅ AutoSwap - USDC/EURC exchange
- ✅ MockERC20 - Test tokens

### Frontend
- ✅ Beautiful dashboard
- ✅ Payment scheduler
- ✅ Wallet connection
- ✅ Real-time balances

### Features
- 💰 90% cheaper than traditional banking
- ⚡ < 2 second settlement
- 🤖 AI-powered invoice processing (coming soon)
- 🔒 Multi-sig security
- 📊 Real-time analytics

---

## 🧪 Test the Application

### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve MetaMask connection
- Switch to Arc Testnet if needed

### 2. View Dashboard
- See your USDC/EURC balances
- View scheduled payments
- Check recent transactions

### 3. Schedule a Payment
- Click "Schedule Payment"
- Enter recipient address
- Set amount and frequency
- Confirm transaction

---

## 🐛 Troubleshooting

### "Cannot connect to wallet"
**Solution**: Install MetaMask and add Arc Testnet:
- Network Name: Arc Testnet
- RPC URL: https://rpc-testnet.arc.network
- Chain ID: 42161
- Currency: USDC

### "Insufficient funds"
**Solution**: Get testnet USDC from faucet:
- Visit: https://faucet.arc.network
- Enter your wallet address
- Claim testnet USDC

### "Contract not found"
**Solution**: Deploy contracts first:
```bash
npm run deploy
```

### "Build errors"
**Solution**: Clear cache and reinstall:
```bash
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

---

## 📚 Next Steps

1. **Read Documentation**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. **Explore Code**: Check [contracts/](./contracts/) and [frontend/](./frontend/)
3. **Run Tests**: `npm test`
4. **Deploy to Testnet**: See deployment guide
5. **Join Community**: Discord, Telegram (links in README)

---

## 🎉 You're Ready!

Your TreasuryFlow instance is now running at:
**http://localhost:3000**

### Quick Actions
- 💸 Schedule your first payment
- 📊 View treasury analytics
- 🔄 Swap currencies
- 📥 Upload invoices (AI-powered)

---

## 📞 Need Help?

- **Documentation**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Issues**: GitHub Issues
- **Email**: support@treasuryflow.com
- **Discord**: discord.gg/treasuryflow

---

**Built with ❤️ for Arc DeFi Hackathon 2025**

*Estimated setup time: 5 minutes*
*Difficulty: Easy 🟢*