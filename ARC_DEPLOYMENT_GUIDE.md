# 🚀 Arc Network Deployment Guide - Real Circle USDC

## Overview

This guide explains how to deploy TreasuryFlow to Arc Network (Arbitrum Sepolia testnet) with **real Circle USDC stablecoins**.

---

## 🎯 What We're Deploying

### Smart Contracts (1,917 lines):
1. **TreasuryVaultV2** (447 lines) - Multi-sig treasury with automated payments
2. **AutoSwap** (140 lines) - USDC ↔ EURC automated swaps
3. **YieldStrategy** (404 lines) - Automated DeFi yield generation
4. **CCTPBridge** (322 lines) - Cross-chain USDC transfers via Circle CCTP

### Using Real Circle Stablecoins:
- ✅ **Real USDC**: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` (Arbitrum Sepolia)
- ✅ **Real Circle CCTP**: TokenMessenger + MessageTransmitter contracts
- ❌ **No Mock Tokens** - Production-ready deployment

---

## 📋 Prerequisites

### 1. Get Testnet ETH
```bash
# Visit Arbitrum Sepolia faucet
https://faucet.quicknode.com/arbitrum/sepolia

# Or use Alchemy faucet
https://sepoliafaucet.com/
```

### 2. Get Testnet USDC
```bash
# Circle USDC Faucet (if available)
https://faucet.circle.com

# Or bridge from Ethereum Sepolia
https://bridge.arbitrum.io/
```

### 3. Set Up Environment
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your private key
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

**⚠️ IMPORTANT**: Never commit your `.env` file or share your private key!

---

## 🔧 Deployment Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Compile Contracts
```bash
npx hardhat compile
```

Expected output:
```
Compiled 15 Solidity files successfully
```

### Step 3: Deploy to Arbitrum Sepolia
```bash
npx hardhat run scripts/deploy-arc-testnet.js --network arbitrumSepolia
```

Expected output:
```
🚀 Deploying TreasuryFlow to Arbitrum Sepolia (Arc Testnet)
============================================================
📝 Deploying with account: 0x...
💰 Account balance: 0.1 ETH

📍 Using Real Circle USDC: 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d

🔄 Deploying AutoSwap...
✅ AutoSwap deployed to: 0x...

🏦 Deploying TreasuryVaultV2...
✅ TreasuryVaultV2 deployed to: 0x...

📈 Deploying YieldStrategy...
✅ YieldStrategy deployed to: 0x...

🌉 Deploying CCTPBridge...
✅ CCTPBridge deployed to: 0x...

============================================================
✅ DEPLOYMENT SUCCESSFUL!
============================================================
```

### Step 4: Verify Contracts on Arbiscan
```bash
# Verify TreasuryVaultV2
npx hardhat verify --network arbitrumSepolia <VAULT_ADDRESS> \
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" \
  "0x0000000000000000000000000000000000000000" \
  <AUTOSWAP_ADDRESS>

# Verify AutoSwap
npx hardhat verify --network arbitrumSepolia <AUTOSWAP_ADDRESS> \
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" \
  "0x0000000000000000000000000000000000000000"

# Verify YieldStrategy
npx hardhat verify --network arbitrumSepolia <YIELD_ADDRESS> \
  <VAULT_ADDRESS> \
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" \
  "0x0000000000000000000000000000000000000000"

# Verify CCTPBridge
npx hardhat verify --network arbitrumSepolia <BRIDGE_ADDRESS> \
  "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5" \
  "0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872" \
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
```

---

## 🧪 Testing with Real USDC

### 1. Get USDC Balance
```javascript
const usdc = await ethers.getContractAt(
  "IERC20",
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
);
const balance = await usdc.balanceOf(YOUR_ADDRESS);
console.log("USDC Balance:", ethers.formatUnits(balance, 6));
```

### 2. Transfer USDC to Vault
```javascript
const vault = await ethers.getContractAt("TreasuryVaultV2", VAULT_ADDRESS);
await usdc.transfer(VAULT_ADDRESS, ethers.parseUnits("1000", 6)); // 1000 USDC
```

### 3. Schedule a Payment
```javascript
await vault.schedulePayment(
  RECIPIENT_ADDRESS,
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // USDC
  ethers.parseUnits("100", 6), // 100 USDC
  604800, // Weekly (7 days)
  "Weekly contractor payment"
);
```

### 4. Execute Payment
```javascript
await vault.executePayment(0); // Execute payment ID 0
```

---

## 📊 Network Information

### Arbitrum Sepolia (Arc Testnet)
- **Chain ID**: 421614
- **RPC URL**: https://sepolia-rollup.arbitrum.io/rpc
- **Explorer**: https://sepolia.arbiscan.io
- **Faucet**: https://faucet.quicknode.com/arbitrum/sepolia

### Real Circle Contracts
- **USDC**: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`
- **TokenMessenger**: `0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5`
- **MessageTransmitter**: `0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872`

---

## 🔍 Verification

### Check Deployment
```bash
# View on Arbiscan
https://sepolia.arbiscan.io/address/<YOUR_VAULT_ADDRESS>

# Check USDC balance
https://sepolia.arbiscan.io/token/0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d?a=<YOUR_VAULT_ADDRESS>
```

### Verify Contract Source Code
```bash
# After verification, you'll see:
✅ Contract Source Code Verified
✅ Read Contract functions available
✅ Write Contract functions available
```

---

## 🎯 Advanced Features to Test

### 1. Multi-Signature Approval
```javascript
// Add approver
await vault.addApprover(APPROVER_ADDRESS);

// Schedule large payment (requires approval)
await vault.schedulePayment(
  RECIPIENT,
  USDC_ADDRESS,
  ethers.parseUnits("15000", 6), // $15,000 - requires approval
  2592000, // Monthly
  "Large supplier payment"
);

// Approve payment
await vault.connect(approver).approvePayment(PAYMENT_ID);
```

### 2. Batch Payments
```javascript
// Execute multiple payments at once
await vault.batchExecutePayments([0, 1, 2, 3, 4]);
```

### 3. USDC ↔ EURC Swap (when EURC available)
```javascript
await autoSwap.swapUSDCtoEURC(ethers.parseUnits("1000", 6));
```

### 4. Cross-Chain USDC Transfer
```javascript
await cctpBridge.bridgeUSDC(
  ethers.parseUnits("500", 6), // 500 USDC
  0, // Ethereum Sepolia domain
  RECIPIENT_ADDRESS
);
```

---

## 🐛 Troubleshooting

### Issue: "Insufficient funds for gas"
**Solution**: Get more testnet ETH from faucet

### Issue: "USDC transfer failed"
**Solution**: Ensure vault has USDC balance

### Issue: "Payment not ready"
**Solution**: Wait for `nextExecutionTime` to pass

### Issue: "Needs approval"
**Solution**: Get required approvers to approve payment

### Issue: "Network error"
**Solution**: Check RPC URL and internet connection

---

## 📈 Gas Costs (Arbitrum Sepolia)

| Operation | Gas Used | Cost (ETH) | Cost (USD) |
|-----------|----------|------------|------------|
| Deploy Vault | ~3,500,000 | ~0.0035 | ~$7 |
| Schedule Payment | ~150,000 | ~0.00015 | ~$0.30 |
| Execute Payment | ~85,000 | ~0.000085 | ~$0.17 |
| Batch (10 payments) | ~450,000 | ~0.00045 | ~$0.90 |
| Approve Payment | ~45,000 | ~0.000045 | ~$0.09 |

**Total Deployment Cost**: ~$7-10 (one-time)
**Operational Costs**: < $1 per month

---

## ✅ Success Criteria

After deployment, you should have:

1. ✅ **4 Contracts Deployed** on Arbitrum Sepolia
2. ✅ **Using Real Circle USDC** (not mock tokens)
3. ✅ **Verified on Arbiscan** (source code visible)
4. ✅ **Funded with USDC** (ready for payments)
5. ✅ **Tested Payment Execution** (at least one successful payment)

---

## 🎉 Next Steps

1. **Update Frontend** - Point to deployed contracts
2. **Test All Features** - Schedule, approve, execute payments
3. **Record Demo Video** - Show working application
4. **Submit to Hackathon** - Include deployment addresses
5. **Write Blog Post** - Share your experience

---

## 📚 Resources

- **Arbitrum Docs**: https://docs.arbitrum.io
- **Circle CCTP Docs**: https://developers.circle.com/stablecoins/docs/cctp-getting-started
- **Hardhat Docs**: https://hardhat.org/docs
- **OpenZeppelin**: https://docs.openzeppelin.com

---

## 🏆 Hackathon Submission Checklist

- [ ] Contracts deployed to Arbitrum Sepolia
- [ ] Using real Circle USDC (not mock)
- [ ] Contracts verified on Arbiscan
- [ ] At least one successful payment executed
- [ ] Demo video recorded
- [ ] GitHub repository updated
- [ ] Documentation complete
- [ ] Deployment addresses documented

---

**Built for Arc DeFi Hackathon 2025**
**Demonstrating Advanced Programmable Logic with Real Circle Stablecoins**