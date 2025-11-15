const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TreasuryFlow V2 with Multi-Sig...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy Mock Tokens
  console.log("📦 Deploying Mock Tokens...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  
  const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  console.log("✅ USDC deployed to:", usdc.target);

  const eurc = await MockERC20.deploy("Euro Coin", "EURC", 6);
  await eurc.waitForDeployment();
  console.log("✅ EURC deployed to:", eurc.target);

  // Deploy AutoSwap
  console.log("\n🔄 Deploying AutoSwap...");
  const AutoSwap = await hre.ethers.getContractFactory("AutoSwap");
  const autoSwap = await AutoSwap.deploy(usdc.target, eurc.target);
  await autoSwap.waitForDeployment();
  console.log("✅ AutoSwap deployed to:", autoSwap.target);

  // Deploy TreasuryVaultV2
  console.log("\n🏦 Deploying TreasuryVaultV2 (Multi-Sig)...");
  const TreasuryVaultV2 = await hre.ethers.getContractFactory("TreasuryVaultV2");
  const vault = await TreasuryVaultV2.deploy(
    usdc.target,
    eurc.target,
    autoSwap.target
  );
  await vault.waitForDeployment();
  console.log("✅ TreasuryVaultV2 deployed to:", vault.target);

  // Mint tokens to vault
  console.log("\n💰 Minting tokens to vault...");
  const mintAmount = hre.ethers.parseUnits("1000000", 6); // 1M tokens
  await usdc.mint(vault.target, mintAmount);
  await eurc.mint(vault.target, mintAmount);
  console.log("✅ Minted 1,000,000 USDC to vault");
  console.log("✅ Minted 1,000,000 EURC to vault");

  // Get balances
  const usdcBalance = await usdc.balanceOf(vault.target);
  const eurcBalance = await eurc.balanceOf(vault.target);
  console.log("\n📊 Vault Balances:");
  console.log("  USDC:", hre.ethers.formatUnits(usdcBalance, 6));
  console.log("  EURC:", hre.ethers.formatUnits(eurcBalance, 6));

  // Get multi-sig configuration
  console.log("\n🔐 Multi-Sig Configuration:");
  const requiredApprovals = await vault.requiredApprovals();
  const approvalThreshold = await vault.approvalThreshold();
  const approvalTimelock = await vault.approvalTimelock();
  const approvers = await vault.getApprovers();
  
  console.log("  Required Approvals:", requiredApprovals.toString());
  console.log("  Approval Threshold:", hre.ethers.formatUnits(approvalThreshold, 6), "USDC");
  console.log("  Approval Timelock:", approvalTimelock.toString(), "seconds");
  console.log("  Approvers:", approvers.length);
  approvers.forEach((addr, i) => {
    console.log(`    ${i + 1}. ${addr}`);
  });

  // Save deployment info
  const deployment = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      TreasuryVaultV2: vault.target,
      USDC: usdc.target,
      EURC: eurc.target,
      AutoSwap: autoSwap.target
    },
    configuration: {
      requiredApprovals: requiredApprovals.toString(),
      approvalThreshold: hre.ethers.formatUnits(approvalThreshold, 6),
      approvalTimelock: approvalTimelock.toString()
    }
  };

  const fs = require('fs');
  const deploymentPath = `./deployments/${hre.network.name}-v2-${Date.now()}.json`;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentPath);

  // Create .env update instructions
  console.log("\n📝 Update your .env file with:");
  console.log("─────────────────────────────────────────────────");
  console.log(`NEXT_PUBLIC_TREASURY_VAULT_V2_ADDRESS=${vault.target}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdc.target}`);
  console.log(`NEXT_PUBLIC_EURC_ADDRESS=${eurc.target}`);
  console.log(`NEXT_PUBLIC_AUTO_SWAP_ADDRESS=${autoSwap.target}`);
  console.log("─────────────────────────────────────────────────");

  console.log("\n✅ Deployment Complete!");
  console.log("\n🧪 Test the multi-sig system:");
  console.log("  npx hardhat test test/TreasuryVaultV2.multisig.test.js");
  
  console.log("\n📚 View documentation:");
  console.log("  PHASE2_MULTISIG_COMPLETE.md");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });