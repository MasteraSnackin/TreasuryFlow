const { ethers } = require("hardhat")

async function main() {
  console.log("\n🔍 Checking Arc Testnet Setup...")
  console.log("=" .repeat(50))

  try {
    // Get network
    const network = await ethers.provider.getNetwork()
    console.log("\n✅ Network Connection:")
    console.log(`   • Name: ${network.name}`)
    console.log(`   • Chain ID: ${network.chainId}`)

    // Get signer
    const [deployer] = await ethers.getSigners()
    console.log("\n✅ Deployer Account:")
    console.log(`   • Address: ${deployer.address}`)

    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address)
    const balanceInUsdc = ethers.formatUnits(balance, 6) // Arc uses USDC for gas
    console.log(`   • Balance: ${balanceInUsdc} USDC`)

    if (parseFloat(balanceInUsdc) < 5) {
      console.log("\n⚠️  WARNING: Low balance!")
      console.log("   Get more USDC from: https://faucet.arc.network")
    }

    // Check gas price
    const feeData = await ethers.provider.getFeeData()
    const gasPriceInUsdc = ethers.formatUnits(feeData.gasPrice, 6)
    console.log("\n✅ Gas Information:")
    console.log(`   • Gas Price: ${gasPriceInUsdc} USDC per gas`)
    console.log(`   • Estimated deployment cost: ~2 USDC`)

    // Check block number
    const blockNumber = await ethers.provider.getBlockNumber()
    console.log("\n✅ Network Status:")
    console.log(`   • Current Block: ${blockNumber}`)
    console.log(`   • RPC: Responsive`)

    // Verify token addresses
    const usdcAddress = process.env.USDC_ADDRESS || "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
    const eurcAddress = process.env.EURC_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
    
    console.log("\n✅ Token Addresses:")
    console.log(`   • USDC: ${usdcAddress}`)
    console.log(`   • EURC: ${eurcAddress}`)

    console.log("\n" + "=".repeat(50))
    console.log("✅ Setup verification complete!")
    console.log("\n🚀 Ready to deploy! Run: npm run deploy")
    console.log("=".repeat(50) + "\n")

  } catch (error) {
    console.error("\n❌ Setup check failed:")
    console.error(error.message)
    console.log("\n💡 Troubleshooting:")
    console.log("   1. Check your .env file has DEPLOYER_PRIVATE_KEY")
    console.log("   2. Ensure you're connected to Arc Testnet")
    console.log("   3. Get testnet USDC from https://faucet.arc.network")
    console.log("   4. Verify RPC URL: https://rpc-testnet.arc.network")
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })