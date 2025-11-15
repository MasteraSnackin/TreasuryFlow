const { ethers } = require("hardhat")

async function main() {
  console.log("\n💰 Checking Vault Balances...")
  console.log("=" .repeat(50))

  // Get deployment info
  const fs = require('fs')
  const path = require('path')
  const deploymentPath = path.join(__dirname, '../deployments/arcTestnet.json')

  if (!fs.existsSync(deploymentPath)) {
    console.log("\n❌ No deployment found!")
    console.log("   Run: npm run deploy")
    process.exit(1)
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'))

  console.log("\n📋 Contract Addresses:")
  console.log(`   • Vault: ${deployment.treasuryVault}`)
  console.log(`   • USDC: ${deployment.usdc}`)
  console.log(`   • EURC: ${deployment.eurc}`)

  // Get contracts
  const usdc = await ethers.getContractAt("MockERC20", deployment.usdc)
  const eurc = await ethers.getContractAt("MockERC20", deployment.eurc)
  const vault = await ethers.getContractAt("TreasuryVault", deployment.treasuryVault)

  // Check balances
  const usdcBalance = await usdc.balanceOf(deployment.treasuryVault)
  const eurcBalance = await eurc.balanceOf(deployment.treasuryVault)

  console.log("\n💵 Vault Balances:")
  console.log(`   • USDC: ${ethers.formatUnits(usdcBalance, 6)}`)
  console.log(`   • EURC: ${ethers.formatUnits(eurcBalance, 6)}`)

  // Check payment count
  const paymentCount = await vault.paymentCount()
  console.log("\n📊 Vault Statistics:")
  console.log(`   • Total Payments: ${paymentCount}`)

  // Check owner
  const owner = await vault.owner()
  console.log(`   • Owner: ${owner}`)

  console.log("\n🔗 View on Explorer:")
  console.log(`   https://explorer-testnet.arc.network/address/${deployment.treasuryVault}`)

  console.log("\n" + "=".repeat(50) + "\n")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })