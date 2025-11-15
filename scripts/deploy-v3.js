const hre = require("hardhat")
const fs = require("fs")
const path = require("path")

async function main() {
  console.log("🚀 Deploying TreasuryFlow V3 Contracts to Arc Network...")
  console.log("=" .repeat(60))

  const [deployer] = await hre.ethers.getSigners()
  console.log("📝 Deploying with account:", deployer.address)
  
  const balance = await hre.ethers.provider.getBalance(deployer.address)
  console.log("💰 Account balance:", hre.ethers.formatUnits(balance, 6), "USDC")
  console.log("")

  // Token addresses on Arc Network
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
  const EURC_ADDRESS = process.env.EURC_ADDRESS || "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c"
  
  // Circle CCTP addresses on Arc
  const TOKEN_MESSENGER = "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5"
  const MESSAGE_TRANSMITTER = "0x0a992d191DEeC32aFe36203Ad87D7d289a738F81"

  console.log("📍 Using Token Addresses:")
  console.log("   USDC:", USDC_ADDRESS)
  console.log("   EURC:", EURC_ADDRESS)
  console.log("")

  // 1. Deploy AutoSwap
  console.log("1️⃣  Deploying AutoSwap...")
  const AutoSwap = await hre.ethers.getContractFactory("AutoSwap")
  const autoSwap = await AutoSwap.deploy(USDC_ADDRESS, EURC_ADDRESS)
  await autoSwap.waitForDeployment()
  console.log("   ✅ AutoSwap deployed to:", autoSwap.target)
  console.log("")

  // 2. Deploy CCTPBridge
  console.log("2️⃣  Deploying CCTPBridge...")
  const CCTPBridge = await hre.ethers.getContractFactory("CCTPBridge")
  const cctpBridge = await CCTPBridge.deploy(
    USDC_ADDRESS,
    TOKEN_MESSENGER,
    MESSAGE_TRANSMITTER
  )
  await cctpBridge.waitForDeployment()
  console.log("   ✅ CCTPBridge deployed to:", cctpBridge.target)
  console.log("")

  // 3. Deploy TreasuryVaultV3 first (without YieldStrategy)
  console.log("3️⃣  Deploying TreasuryVaultV3...")
  const TreasuryVaultV3 = await hre.ethers.getContractFactory("TreasuryVaultV3")
  const vault = await TreasuryVaultV3.deploy(
    USDC_ADDRESS,
    EURC_ADDRESS,
    autoSwap.target,
    cctpBridge.target,
    hre.ethers.ZeroAddress // Placeholder for YieldStrategy
  )
  await vault.waitForDeployment()
  console.log("   ✅ TreasuryVaultV3 deployed to:", vault.target)
  console.log("")

  // 4. Deploy YieldStrategy with vault address
  console.log("4️⃣  Deploying YieldStrategy...")
  const YieldStrategy = await hre.ethers.getContractFactory("YieldStrategy")
  const yieldStrategy = await YieldStrategy.deploy(
    vault.target,  // treasuryVault address
    USDC_ADDRESS,
    EURC_ADDRESS
  )
  await yieldStrategy.waitForDeployment()
  console.log("   ✅ YieldStrategy deployed to:", yieldStrategy.target)
  console.log("")

  // 5. Update vault with YieldStrategy address
  console.log("5️⃣  Linking YieldStrategy to Vault...")
  await vault.setYieldStrategy(yieldStrategy.target)
  console.log("   ✅ YieldStrategy linked to vault")
  console.log("")

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TreasuryVaultV3: vault.target,
      AutoSwap: autoSwap.target,
      CCTPBridge: cctpBridge.target,
      YieldStrategy: yieldStrategy.target,
      USDC: USDC_ADDRESS,
      EURC: EURC_ADDRESS
    }
  }

  const deploymentsDir = path.join(__dirname, "../deployments")
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir)
  }

  const filename = `${hre.network.name}-v3-${Date.now()}.json`
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  )

  console.log("=" .repeat(60))
  console.log("✅ DEPLOYMENT COMPLETE!")
  console.log("=" .repeat(60))
  console.log("")
  console.log("📋 Contract Addresses:")
  console.log("   TreasuryVaultV3:", vault.target)
  console.log("   AutoSwap:", autoSwap.target)
  console.log("   CCTPBridge:", cctpBridge.target)
  console.log("   YieldStrategy:", yieldStrategy.target)
  console.log("")
  console.log("💾 Deployment info saved to:", filename)
  console.log("")
  console.log("🔍 Next Steps:")
  console.log("   1. Verify contracts on Arc Explorer")
  console.log("   2. Update frontend .env with new addresses")
  console.log("   3. Test all features on testnet")
  console.log("   4. Prepare for mainnet deployment")
  console.log("")
  console.log("📝 Verification Commands:")
  console.log(`   npx hardhat verify --network ${hre.network.name} ${vault.target} ${USDC_ADDRESS} ${EURC_ADDRESS} ${autoSwap.target} ${cctpBridge.target} ${yieldStrategy.target}`)
  console.log(`   npx hardhat verify --network ${hre.network.name} ${autoSwap.target} ${USDC_ADDRESS} ${EURC_ADDRESS}`)
  console.log(`   npx hardhat verify --network ${hre.network.name} ${cctpBridge.target} ${USDC_ADDRESS} ${TOKEN_MESSENGER} ${MESSAGE_TRANSMITTER}`)
  console.log(`   npx hardhat verify --network ${hre.network.name} ${yieldStrategy.target} ${USDC_ADDRESS} ${EURC_ADDRESS}`)
  console.log("")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })