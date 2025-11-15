const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 TreasuryFlow V3.0 Deployment");
  console.log("================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy Mock Tokens (for testnet)
  console.log("📝 Deploying Mock Tokens...");
  
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  
  const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ USDC deployed to:", usdcAddress);
  
  const eurc = await MockERC20.deploy("Euro Coin", "EURC", 6);
  await eurc.waitForDeployment();
  const eurcAddress = await eurc.getAddress();
  console.log("✅ EURC deployed to:", eurcAddress);
  console.log("");

  // Deploy AutoSwap
  console.log("🔄 Deploying AutoSwap...");
  const AutoSwap = await hre.ethers.getContractFactory("AutoSwap");
  const autoSwap = await AutoSwap.deploy(usdcAddress, eurcAddress);
  await autoSwap.waitForDeployment();
  const autoSwapAddress = await autoSwap.getAddress();
  console.log("✅ AutoSwap deployed to:", autoSwapAddress);
  console.log("");

  // Deploy TreasuryVault
  console.log("🏦 Deploying TreasuryVault...");
  const TreasuryVault = await hre.ethers.getContractFactory("TreasuryVault");
  const vault = await TreasuryVault.deploy(
    usdcAddress,
    eurcAddress,
    autoSwapAddress
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ TreasuryVault deployed to:", vaultAddress);
  console.log("");

  // Mint initial tokens to vault for testing
  console.log("💰 Minting test tokens...");
  const mintAmount = hre.ethers.parseUnits("1000000", 6); // 1M tokens
  
  await usdc.mint(vaultAddress, mintAmount);
  console.log("✅ Minted 1,000,000 USDC to vault");
  
  await eurc.mint(vaultAddress, mintAmount);
  console.log("✅ Minted 1,000,000 EURC to vault");
  
  // Add liquidity to AutoSwap
  await usdc.mint(autoSwapAddress, mintAmount);
  await eurc.mint(autoSwapAddress, mintAmount);
  console.log("✅ Added liquidity to AutoSwap");
  console.log("");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TreasuryVault: vaultAddress,
      AutoSwap: autoSwapAddress,
      USDC: usdcAddress,
      EURC: eurcAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also save as latest
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("📄 Deployment info saved to:", filename);
  console.log("");

  // Print summary
  console.log("================================");
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("================================\n");
  console.log("📋 Contract Addresses:");
  console.log("  TreasuryVault:", vaultAddress);
  console.log("  AutoSwap:     ", autoSwapAddress);
  console.log("  USDC:         ", usdcAddress);
  console.log("  EURC:         ", eurcAddress);
  console.log("");
  console.log("🔗 Next Steps:");
  console.log("  1. Update .env with contract addresses");
  console.log("  2. Verify contracts on explorer:");
  console.log(`     npx hardhat verify --network ${hre.network.name} ${vaultAddress} ${usdcAddress} ${eurcAddress} ${autoSwapAddress}`);
  console.log("  3. Test the deployment:");
  console.log("     npm run test");
  console.log("  4. Start the frontend:");
  console.log("     npm run dev");
  console.log("");

  // Generate .env update instructions
  console.log("📝 Add these to your .env file:");
  console.log(`NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`NEXT_PUBLIC_AUTO_SWAP_ADDRESS=${autoSwapAddress}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_EURC_ADDRESS=${eurcAddress}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });