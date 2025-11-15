# 🚀 Deploy to Arc Testnet - Step by Step

Follow these exact steps to deploy your contracts to Arc Testnet.

---

## ⏱️ Time Required: 15-20 minutes

---

## Step 1: Get Testnet USDC (5 minutes)

### 1.1 Add Arc Testnet to MetaMask

**Quick Add:**
1. Visit: https://chainlist.org/chain/42161
2. Click "Add to MetaMask"
3. Approve in MetaMask

**Or Manual:**
- Network Name: `Arc Testnet`
- RPC URL: `https://rpc-testnet.arc.network`
- Chain ID: `42161`
- Currency: `USDC`
- Explorer: `https://explorer-testnet.arc.network`

### 1.2 Get Testnet USDC

1. Visit: **https://faucet.arc.network**
2. Connect your MetaMask wallet
3. Click "Request USDC"
4. Wait 30 seconds
5. Check MetaMask - you should have 10 USDC

✅ **Checkpoint**: You have at least 10 USDC in your wallet

---

## Step 2: Export Your Private Key (2 minutes)

⚠️ **IMPORTANT**: This is for TESTNET only. Never share this key!

### From MetaMask:
1. Click the three dots (⋮) next to your account name
2. Select "Account Details"
3. Click "Show Private Key"
4. Enter your MetaMask password
5. Click to reveal and copy the private key
6. It should start with `0x` and be 66 characters long

✅ **Checkpoint**: You have copied your private key

---

## Step 3: Configure Environment (3 minutes)

### 3.1 Create .env file

In your terminal, run:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### 3.2 Edit .env file

Open `.env` in your text editor and add your private key:

```env
# Arc Testnet Configuration
ARC_TESTNET_RPC_URL=https://rpc-testnet.arc.network
ARC_TESTNET_CHAIN_ID=42161

# Your Private Key (PASTE HERE)
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE_PASTE_THE_FULL_KEY

# Token Addresses (Arc Testnet - DO NOT CHANGE)
USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
EURC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

**Replace `0xYOUR_PRIVATE_KEY_HERE_PASTE_THE_FULL_KEY` with your actual private key!**

### 3.3 Save the file

Make sure to save `.env` after editing!

✅ **Checkpoint**: Your `.env` file has your private key

---

## Step 4: Verify Setup (2 minutes)

Run this command to check everything is configured correctly:

```bash
npm run check-setup
```

**Expected output:**
```
🔍 Checking Arc Testnet Setup...
==================================================

✅ Network Connection:
   • Name: Arc Testnet
   • Chain ID: 42161

✅ Deployer Account:
   • Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f5678
   • Balance: 10.00 USDC

✅ Gas Information:
   • Gas Price: 0.000001 USDC per gas
   • Estimated deployment cost: ~2 USDC

✅ Network Status:
   • Current Block: 12345678
   • RPC: Responsive

==================================================
✅ Setup verification complete!

🚀 Ready to deploy! Run: npm run deploy
==================================================
```

**If you see errors:**
- Check your private key is correct in `.env`
- Ensure you have USDC in your wallet
- Verify you're connected to Arc Testnet

✅ **Checkpoint**: Setup check passed

---

## Step 5: Deploy Contracts (5 minutes)

### 5.1 Run deployment

```bash
npm run deploy
```

### 5.2 Wait for deployment

This will take 2-3 minutes. You'll see:

```
🚀 Deploying TreasuryFlow to Arc Testnet...
========================================

📋 Deployment Configuration:
  • Network: Arc Testnet
  • Chain ID: 42161
  • Deployer: 0x742d35Cc6634C0532925a3b844Bc9e7595f5678
  • Balance: 10.00 USDC

🔨 Deploying MockERC20 (USDC)...
✅ USDC deployed to: 0x1234567890abcdef...
   TX: 0xabcdef1234567890...

🔨 Deploying MockERC20 (EURC)...
✅ EURC deployed to: 0x5678901234abcdef...
   TX: 0xefgh1234567890ab...

🔨 Deploying AutoSwap...
✅ AutoSwap deployed to: 0x9012345678abcdef...
   TX: 0xijkl1234567890ab...

🔨 Deploying TreasuryVault...
✅ TreasuryVault deployed to: 0x3456789012abcdef...
   TX: 0xmnop1234567890ab...

💰 Minting test tokens...
✅ Minted 1,000,000 USDC to vault
✅ Minted 1,000,000 EURC to vault

💧 Adding liquidity to AutoSwap...
✅ Added 100,000 USDC
✅ Added 100,000 EURC

========================================
✅ DEPLOYMENT SUCCESSFUL!
========================================

📊 Deployment Summary:
  • USDC: 0x1234567890abcdef...
  • EURC: 0x5678901234abcdef...
  • AutoSwap: 0x9012345678abcdef...
  • TreasuryVault: 0x3456789012abcdef...

💾 Saved to: deployments/arcTestnet.json

🔗 View on Explorer:
https://explorer-testnet.arc.network/address/0x3456789012abcdef...

⏱️  Total deployment time: 45 seconds
💰 Total gas used: 1.85 USDC
```

### 5.3 Copy your contract addresses

**IMPORTANT**: Copy these addresses! You'll need them for the next step.

- **TreasuryVault**: `0x3456789012abcdef...` (your actual address)
- **AutoSwap**: `0x9012345678abcdef...` (your actual address)
- **USDC**: `0x1234567890abcdef...` (your actual address)
- **EURC**: `0x5678901234abcdef...` (your actual address)

✅ **Checkpoint**: Contracts deployed successfully

---

## Step 6: Update Frontend (3 minutes)

### 6.1 Edit frontend/.env.local

```bash
cd frontend
notepad .env.local
```

Or use your preferred editor:
```bash
code .env.local
```

### 6.2 Update with your contract addresses

Replace the file content with:

```env
# Arc Testnet Configuration
NEXT_PUBLIC_ARC_TESTNET_RPC_URL=https://rpc-testnet.arc.network
NEXT_PUBLIC_ARC_TESTNET_CHAIN_ID=42161

# YOUR DEPLOYED CONTRACT ADDRESSES (paste from deployment output)
NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=0xYOUR_VAULT_ADDRESS_HERE
NEXT_PUBLIC_AUTO_SWAP_ADDRESS=0xYOUR_AUTOSWAP_ADDRESS_HERE
NEXT_PUBLIC_USDC_ADDRESS=0xYOUR_USDC_ADDRESS_HERE
NEXT_PUBLIC_EURC_ADDRESS=0xYOUR_EURC_ADDRESS_HERE

# DISABLE DEMO MODE (important!)
NEXT_PUBLIC_DEMO_MODE=false

# Circle Configuration (optional - can add later)
NEXT_PUBLIC_CIRCLE_APP_ID=
```

**Replace the `0xYOUR_..._ADDRESS_HERE` with your actual addresses from Step 5.3!**

### 6.3 Save and restart dev server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

✅ **Checkpoint**: Frontend configured with real contracts

---

## Step 7: Test Your Deployment (5 minutes)

### 7.1 Open the app

Visit: http://localhost:3002 (or whatever port it's running on)

### 7.2 Connect your wallet

1. Click "Connect Wallet" button
2. Select MetaMask
3. Approve the connection
4. **Make sure you're on Arc Testnet in MetaMask!**

### 7.3 Check balances

You should see:
- **USDC Balance**: 1,000,000.00
- **EURC Balance**: 1,000,000.00

If you see these balances, your deployment is working! 🎉

### 7.4 Schedule a test payment

1. Go to "Payments" tab
2. Click "Schedule Payment"
3. Fill in:
   - **Recipient**: Your own wallet address (for testing)
   - **Name**: "Test Payment"
   - **Amount**: 100
   - **Currency**: USDC
   - **Frequency**: Weekly
   - **Description**: "Testing deployment"
4. Click "Continue" through the wizard
5. Click "Schedule Payment"
6. **Approve the transaction in MetaMask**
7. Wait for confirmation (~5 seconds)

### 7.5 Execute the payment

1. Find your scheduled payment in the list
2. Click "Execute" button
3. Approve the transaction in MetaMask
4. Wait for confirmation
5. Check your wallet - you should receive 100 USDC!

### 7.6 View on Explorer

1. Click the transaction hash
2. View on Arc Explorer
3. See your transaction details

✅ **Checkpoint**: Successfully tested payment execution

---

## 🎉 Congratulations!

You've successfully deployed TreasuryFlow to Arc Testnet!

### What you've accomplished:

✅ Deployed 4 smart contracts to Arc Testnet
✅ Funded vault with 1M USDC and 1M EURC
✅ Connected frontend to real blockchain
✅ Executed a real payment transaction
✅ Verified everything on Arc Explorer

---

## 📊 Your Deployment Info

**Contract Addresses:**
- TreasuryVault: [Your address from deployment]
- AutoSwap: [Your address from deployment]
- USDC: [Your address from deployment]
- EURC: [Your address from deployment]

**Explorer Links:**
- Vault: https://explorer-testnet.arc.network/address/[YOUR_VAULT_ADDRESS]
- Transactions: https://explorer-testnet.arc.network/address/[YOUR_VAULT_ADDRESS]#transactions

**Deployment File:**
- Location: `deployments/arcTestnet.json`
- Contains all addresses and transaction hashes

---

## 🎯 Next Steps

### For Demo/Presentation:
1. ✅ Take screenshots of your dashboard
2. ✅ Record a video walkthrough
3. ✅ Note your contract addresses
4. ✅ Prepare to show live transactions

### For Further Development:
1. Add more suppliers
2. Test batch payments
3. Try currency swaps
4. Set up approval workflows
5. Monitor gas costs

### For Hackathon Submission:
1. Document your contract addresses
2. Include explorer links
3. Show transaction history
4. Demonstrate live functionality
5. Highlight gas savings

---

## 🆘 Troubleshooting

### "Transaction failed"
- Check you have enough USDC for gas
- Verify you're on Arc Testnet
- Try increasing gas limit

### "Contract not found"
- Verify addresses in frontend/.env.local
- Check deployment was successful
- Restart dev server

### "Wrong network"
- Switch MetaMask to Arc Testnet
- Refresh the page
- Reconnect wallet

### "Insufficient funds"
- Get more USDC from faucet
- Check vault balance with: `npm run check-balance`

---

## 📞 Need Help?

- **Check deployment**: `npm run check-balance`
- **View contracts**: https://explorer-testnet.arc.network
- **Get more USDC**: https://faucet.arc.network
- **Arc Discord**: https://discord.gg/arc

---

**🚀 Your TreasuryFlow is now LIVE on Arc Testnet!**

**Ready to win the hackathon! 🏆**