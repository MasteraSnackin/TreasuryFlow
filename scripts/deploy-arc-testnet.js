// Deploy TreasuryFlow to Arbitrum Sepolia (Arc Testnet) with Real Circle USDC
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Real Circle USDC on Arbitrum Sepolia
const ARBITRUM_SEPOLIA_USDC = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const ARBITRUM_SEPOLIA_EURC = "0x0000000000000000000000000000000000000000"; // Not deployed yet, use zero address

async function main() {
  console.log("🚀 Deploying TreasuryFlow to Arbitrum Sepolia (Arc Testnet)");
  console.log("=" .repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.log("\n❌ ERROR: No ETH balance!");
    console.log("Get testnet ETH from: https://faucet.quicknode.com/arbitrum/sepolia");
    process.exit(1);
  }
  
  console.log("\n📍 Using Real Circle USDC:", ARBITRUM_SEPOLIA_USDC);
  console.log("📍 EURC not available on testnet, using zero address");
  
  // Deploy AutoSwap first
  console.log("\n🔄 Deploying AutoSwap...");
  const AutoSwap = await hre.ethers.getContractFactory("AutoSwap");
  const autoSwap = await AutoSwap.deploy(
    ARBITRUM_SEPOLIA_USDC,
    ARBITRUM_SEPOLIA_EURC
  );
  await autoSwap.waitForDeployment();
  const autoSwapAddress = await autoSwap.getAddress();
  console.log("✅ AutoSwap deployed to:", autoSwapAddress);
  
  // Deploy TreasuryVaultV2
  console.log("\n🏦 Deploying TreasuryVaultV2...");
  const TreasuryVaultV2 = await hre.ethers.getContractFactory("TreasuryVaultV2");
  const vault = await TreasuryVaultV2.deploy(
    ARBITRUM_SEPOLIA_USDC,
    ARBITRUM_SEPOLIA_EURC,
    autoSwapAddress
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ TreasuryVaultV2 deployed to:", vaultAddress);
  
  // Deploy YieldStrategy
  console.log("\n📈 Deploying YieldStrategy...");
  const YieldStrategy = await hre.ethers.getContractFactory("YieldStrategy");
  const yieldStrategy = await YieldStrategy.deploy(
    vaultAddress,
    ARBITRUM_SEPOLIA_USDC,
    ARBITRUM_SEPOLIA_EURC
  );
  await yieldStrategy.waitForDeployment();
  const yieldAddress = await yieldStrategy.getAddress();
  console.log("✅ YieldStrategy deployed to:", yieldAddress);
  
  // Deploy CCTPBridge
  console.log("\n🌉 Deploying CCTPBridge...");
  // Circle CCTP contracts on Arbitrum Sepolia
  const TOKEN_MESSENGER = "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5";
  const MESSAGE_TRANSMITTER = "0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872";
  
  const CCTPBridge = await hre.ethers.getContractFactory("CCTPBridge");
  const cctpBridge = await CCTPBridge.deploy(
    TOKEN_MESSENGER,
    MESSAGE_TRANSMITTER,
    ARBITRUM_SEPOLIA_USDC
  );
  await cctpBridge.waitForDeployment();
  const bridgeAddress = await cctpBridge.getAddress();
  console.log("✅ CCTPBridge deployed to:", bridgeAddress);
  
  // Save deployment info
  const deployment = {
    network: "arbitrum-sepolia",
    chainId: 421614,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      TreasuryVaultV2: vaultAddress,
      AutoSwap: autoSwapAddress,
      YieldStrategy: yieldAddress,
      CCTPBridge: bridgeAddress,
      USDC: ARBITRUM_SEPOLIA_USDC,
      EURC: ARBITRUM_SEPOLIA_EURC
    },
    circleContracts: {
      TokenMessenger: TOKEN_MESSENGER,
      MessageTransmitter: MESSAGE_TRANSMITTER
    }
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `arbitrum-sepolia-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployment Summary:");
  console.log("  Network: Arbitrum Sepolia (Arc Testnet)");
  console.log("  Chain ID: 421614");
  console.log("  Deployer:", deployer.address);
  console.log("\n📦 Deployed Contracts:");
  console.log("  TreasuryVaultV2:", vaultAddress);
  console.log("  AutoSwap:", autoSwapAddress);
  console.log("  YieldStrategy:", yieldAddress);
  console.log("  CCTPBridge:", bridgeAddress);
  console.log("\n💰 Using Real Circle USDC:");
  console.log("  USDC:", ARBITRUM_SEPOLIA_USDC);
  console.log("\n🔗 Verify on Explorer:");
  console.log("  https://sepolia.arbiscan.io/address/" + vaultAddress);
  console.log("\n💾 Deployment saved to:", filename);
  
  console.log("\n📝 Next Steps:");
  console.log("  1. Get testnet USDC from Circle faucet");
  console.log("  2. Transfer USDC to vault:", vaultAddress);
  console.log("  3. Test payment scheduling");
  console.log("  4. Verify contracts on Arbiscan");
  
  console.log("\n🎉 Ready for Arc DeFi Hackathon submission!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });