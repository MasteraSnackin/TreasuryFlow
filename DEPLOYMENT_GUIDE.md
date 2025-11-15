# 🚀 TreasuryFlow - Arc Testnet Deployment Guide

## 📋 Prerequisites Checklist

Before deploying, make sure you have:
- [ ] MetaMask installed
- [ ] Arc Testnet added to MetaMask
- [ ] Testnet USDC in your wallet (for gas fees)
- [ ] Your wallet private key ready

---

## Step 1: Add Arc Testnet to MetaMask

### Option A: Automatic (Recommended)
Visit: https://chainlist.org/chain/42161
Click "Add to MetaMask"

### Option B: Manual
1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter these details:
   - **Network Name**: Arc Testnet
   - **RPC URL**: https://rpc-testnet.arc.network
   - **Chain ID**: 42161
   - **Currency Symbol**: USDC
   - **Block Explorer**: https://explorer-testnet.arc.network

---

## Step 2: Get Testnet USDC

### Visit the Faucet
1. Go to: **https://faucet.arc.network**
2. Connect your MetaMask wallet
3. Click "Request Testnet USDC"
4. Wait for confirmation (usually < 30 seconds)
5. Check your wallet - you should have ~100 USDC

**Note**: You need USDC for gas fees on Arc Network!

---

## Step 3: Configure Deployment

### Edit `.env` file in project root:

```bash
# Open .env file
# Add your wallet private key (KEEP THIS SECRET!)

DEPLOYER_PRIVATE_KEY=your_private_key_here_without_0x

# Example (DO NOT USE THIS):
# DEPLOYER_PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### How to Get Your Private Key:
1. Open MetaMask
2. Click three dots → Account Details
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key (without 0x prefix)

⚠️ **SECURITY WARNING**: 
- Never commit .env to git
- Never share your private key
- Use a test wallet, not your main wallet

---

## Step 4: Deploy Contracts

### Run Deployment Script:

```bash
# From project root directory
npm run deploy
```

### What Happens:
1. ✅ Connects to Arc Testnet
2. ✅ Deploys MockERC20 (USDC)
3. ✅ Deploys MockERC20 (EURC)
4. ✅ Deploys AutoSwap contract
5. ✅ Deploys TreasuryVault contract
6. ✅ Mints test tokens
7. ✅ Adds liquidity to AutoSwap
8. ✅ Saves deployment info

### Expected Output:
```
🚀 Deploying TreasuryFlow to Arc Testnet...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Network: Arc Testnet
💰 Deployer: 0x742d35Cc6634C0532925a3b844Bc9e7595f5678
💵 Balance: 100.00 USDC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Deploying Contracts...

✅ USDC deployed: 0x1234...
✅ EURC deployed: 0x5678...
✅ AutoSwap deployed: 0x9abc...
✅ TreasuryVault deployed: 0xdef0...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Deployment Complete!

Contract Addresses:
  USDC: 0x1234567890abcdef1234567890abcdef12345678
  EURC: 0x567890abcdef1234567890abcdef1234567890ab
  AutoSwap: 0x9abcdef1234567890abcdef1234567890abcdef1
  TreasuryVault: 0xdef0123456789abcdef0123456789abcdef01234

Deployment saved to: deployments/arc-testnet-latest.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 5: Update Frontend Configuration

### Edit `frontend/.env.local`:

```bash
# Copy the contract addresses from deployment output

NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=0xdef0123456789abcdef0123456789abcdef01234
NEXT_PUBLIC_AUTO_SWAP_ADDRESS=0x9abcdef1234567890abcdef1234567890abcdef1
NEXT_PUBLIC_USDC_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
NEXT_PUBLIC_EURC_ADDRESS=0x567890abcdef1234567890abcdef1234567890ab

# Disable demo mode to use real contracts
NEXT_PUBLIC_DEMO_MODE=false
```

### Restart Dev Server:
```bash
# Stop current server (Ctrl+C)
# Start again
cd frontend
npm run dev
```

---

## Step 6: Verify Deployment

### Check on Arc Explorer:
1. Visit: https://explorer-testnet.arc.network
2. Search for your TreasuryVault address
3. Verify contract is deployed
4. Check transactions

### Test in Application:
1. Open: http://localhost:3002
2. Click "Connect Wallet"
3. Connect MetaMask
4. Switch to Arc Testnet
5. View real balances
6. Try scheduling a payment

---

## Step 7: Verify Contracts (Optional but Recommended)

### Verify on Arc Explorer:

```bash
# Verify TreasuryVault
npx hardhat verify --network arcTestnet \
  0xYOUR_VAULT_ADDRESS \
  0xUSDC_ADDRESS \
  0xEURC_ADDRESS \
  0xAUTOSWAP_ADDRESS

# Verify AutoSwap
npx hardhat verify --network arcTestnet \
  0xYOUR_AUTOSWAP_ADDRESS \
  0xUSDC_ADDRESS \
  0xEURC_ADDRESS
```

### Benefits of Verification:
- ✅ Source code visible on explorer
- ✅ Users can read contract
- ✅ Increases trust
- ✅ Professional appearance

---

## 🎯 Post-Deployment Checklist

After successful deployment:

- [ ] Contract addresses saved
- [ ] Frontend .env.local updated
- [ ] Dev server restarted
- [ ] Wallet connected to app
- [ ] Real balances visible
- [ ] Can schedule payments
- [ ] Contracts verified on explorer
- [ ] Deployment info saved

---

## 🐛 Troubleshooting

### "Insufficient funds for gas"
**Solution**: Get more testnet USDC from faucet

### "Network mismatch"
**Solution**: Switch MetaMask to Arc Testnet

### "Deployment failed"
**Solution**: Check your private key in .env

### "Cannot connect to RPC"
**Solution**: Check internet connection, try again

### "Transaction reverted"
**Solution**: Check you have enough USDC for gas

---

## 📊 What You Get After Deployment

### Real Blockchain Features:
- ✅ Actual smart contracts on Arc Testnet
- ✅ Real transaction hashes
- ✅ Verifiable on block explorer
- ✅ True decentralization
- ✅ Production-like environment

### Demo Improvements:
- ✅ Connect real wallet
- ✅ Execute real transactions
- ✅ Show on Arc Explorer
- ✅ More impressive for judges
- ✅ Proves technical capability

---

## 🎬 Demo Script (With Testnet)

### Enhanced Demo:
1. **Show Landing Page**
2. **Connect Wallet** (real MetaMask)
3. **View Real Balances** (from deployed contracts)
4. **Schedule Payment** (real transaction)
5. **Show on Explorer** (verify on Arc)
6. **Execute Payment** (another real transaction)
7. **Show Transaction History** (real blockchain data)

**Impact**: 10x more impressive than demo mode!

---

## 💡 Pro Tips

### For Hackathons:
- Deploy early to avoid last-minute issues
- Keep deployment info handy
- Have backup wallet with USDC
- Test all features after deployment
- Record demo with real transactions

### For Production:
- Use multi-sig wallet
- Enable contract upgrades
- Set up monitoring
- Configure alerts
- Implement emergency pause

---

## 🚀 Ready to Deploy?

### Quick Command:
```bash
# Make sure you're in project root
npm run deploy
```

### Time Required:
- Configuration: 5 minutes
- Deployment: 5 minutes
- Verification: 5 minutes
- Testing: 10 minutes
**Total: ~25 minutes**

---

## 📞 Need Help?

**Common Issues**:
- Private key format: Remove "0x" prefix
- Gas fees: Need USDC, not ETH
- Network: Must be on Arc Testnet
- RPC: Use https://rpc-testnet.arc.network

**Still stuck?** Check:
1. .env file has correct private key
2. Wallet has testnet USDC
3. MetaMask on Arc Testnet
4. Internet connection stable

---

**Ready to deploy? Let's do it!** 🚀