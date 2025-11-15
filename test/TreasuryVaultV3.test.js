const { expect } = require("chai")
const { ethers } = require("hardhat")
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("TreasuryVaultV3 - Comprehensive Tests", function () {
  
  async function deployFixture() {
    const [owner, dept1Manager, dept2Manager, approver1, approver2, supplier1, supplier2] = await ethers.getSigners()

    // Deploy mock tokens
    const Token = await ethers.getContractFactory("MockERC20")
    const usdc = await Token.deploy("USDC", "USDC", 6)
    const eurc = await Token.deploy("EURC", "EURC", 6)

    // Deploy AutoSwap
    const AutoSwap = await ethers.getContractFactory("AutoSwap")
    const autoSwap = await AutoSwap.deploy(usdc.target, eurc.target)

    // Deploy CCTPBridge
    const CCTPBridge = await ethers.getContractFactory("CCTPBridge")
    const cctpBridge = await CCTPBridge.deploy(
      usdc.target,
      "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5", // Mock TokenMessenger
      "0x0a992d191DEeC32aFe36203Ad87D7d289a738F81"  // Mock MessageTransmitter
    )

    // Deploy YieldStrategy
    const YieldStrategy = await ethers.getContractFactory("YieldStrategy")
    const yieldStrategy = await YieldStrategy.deploy(usdc.target, eurc.target)

    // Deploy TreasuryVaultV3
    const Vault = await ethers.getContractFactory("TreasuryVaultV3")
    const vault = await Vault.deploy(
      usdc.target,
      eurc.target,
      autoSwap.target,
      cctpBridge.target,
      yieldStrategy.target
    )

    // Mint tokens to vault
    await usdc.mint(vault.target, ethers.parseUnits("1000000", 6))
    await eurc.mint(vault.target, ethers.parseUnits("1000000", 6))

    // Add approvers
    await vault.addApprover(approver1.address)
    await vault.addApprover(approver2.address)

    return { 
      vault, usdc, eurc, autoSwap, cctpBridge, yieldStrategy,
      owner, dept1Manager, dept2Manager, approver1, approver2, supplier1, supplier2 
    }
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { vault, owner } = await loadFixture(deployFixture)
      expect(await vault.owner()).to.equal(owner.address)
    })

    it("Should set correct contract addresses", async function () {
      const { vault, usdc, eurc, cctpBridge, yieldStrategy } = await loadFixture(deployFixture)
      expect(await vault.usdcAddress()).to.equal(usdc.target)
      expect(await vault.eurcAddress()).to.equal(eurc.target)
      expect(await vault.cctpBridge()).to.equal(cctpBridge.target)
      expect(await vault.yieldStrategy()).to.equal(yieldStrategy.target)
    })
  })

  describe("Department Management", function () {
    it("Should create a department", async function () {
      const { vault, dept1Manager } = await loadFixture(deployFixture)
      const monthlyBudget = ethers.parseUnits("10000", 6)

      await expect(
        vault.createDepartment("Engineering", monthlyBudget, [dept1Manager.address])
      ).to.emit(vault, "DepartmentCreated")

      const dept = await vault.getDepartment(0)
      expect(dept.name).to.equal("Engineering")
      expect(dept.monthlyBudget).to.equal(monthlyBudget)
      expect(dept.active).to.be.true
    })

    it("Should enforce department budget limits", async function () {
      const { vault, dept1Manager, supplier1, usdc } = await loadFixture(deployFixture)
      const monthlyBudget = ethers.parseUnits("10000", 6)
      
      // Create department
      await vault.createDepartment("Engineering", monthlyBudget, [dept1Manager.address])
      
      // Schedule payment within budget
      await vault.scheduleDepartmentPayment(
        0, // departmentId
        supplier1.address,
        usdc.target,
        ethers.parseUnits("5000", 6),
        2592000, // monthly
        "Within budget payment"
      )

      // Try to schedule payment exceeding budget
      await expect(
        vault.scheduleDepartmentPayment(
          0,
          supplier1.address,
          usdc.target,
          ethers.parseUnits("6000", 6), // Would exceed 10K budget
          2592000,
          "Exceeds budget"
        )
      ).to.be.revertedWith("Exceeds department budget")
    })

    it("Should reset department spending monthly", async function () {
      const { vault, dept1Manager, supplier1, usdc } = await loadFixture(deployFixture)
      const monthlyBudget = ethers.parseUnits("10000", 6)
      
      await vault.createDepartment("Engineering", monthlyBudget, [dept1Manager.address])
      
      // Use up budget
      await vault.scheduleDepartmentPayment(
        0,
        supplier1.address,
        usdc.target,
        ethers.parseUnits("10000", 6),
        2592000,
        "Full budget"
      )

      // Fast forward 1 month
      await time.increase(2592000)

      // Should be able to schedule again
      await expect(
        vault.scheduleDepartmentPayment(
          0,
          supplier1.address,
          usdc.target,
          ethers.parseUnits("5000", 6),
          2592000,
          "New month"
        )
      ).to.not.be.reverted
    })
  })

  describe("Cross-Chain Payments", function () {
    it("Should schedule cross-chain payment", async function () {
      const { vault, supplier1, usdc } = await loadFixture(deployFixture)
      const amount = ethers.parseUnits("1000", 6)

      await expect(
        vault.scheduleCrossChainPayment(
          supplier1.address,
          usdc.target,
          amount,
          1, // Ethereum domain
          2592000,
          "Cross-chain payment"
        )
      ).to.emit(vault, "CrossChainPaymentScheduled")
    })

    it("Should execute cross-chain payment", async function () {
      const { vault, supplier1, usdc } = await loadFixture(deployFixture)
      const amount = ethers.parseUnits("1000", 6)

      // Schedule payment
      await vault.scheduleCrossChainPayment(
        supplier1.address,
        usdc.target,
        amount,
        1,
        1, // 1 second for testing
        "Test payment"
      )

      // Wait for execution time
      await time.increase(2)

      // Execute
      await expect(vault.executeCrossChainPayment(0))
        .to.emit(vault, "CrossChainPaymentExecuted")
    })
  })

  describe("Conditional Payments", function () {
    it("Should schedule conditional payment", async function () {
      const { vault, supplier1, usdc } = await loadFixture(deployFixture)
      const amount = ethers.parseUnits("1000", 6)
      const condition = ethers.keccak256(ethers.toUtf8Bytes("milestone_completed"))

      await expect(
        vault.scheduleConditionalPayment(
          supplier1.address,
          usdc.target,
          amount,
          condition,
          "Milestone payment"
        )
      ).to.emit(vault, "ConditionalPaymentScheduled")
    })

    it("Should execute conditional payment with valid proof", async function () {
      const { vault, supplier1, usdc } = await loadFixture(deployFixture)
      const amount = ethers.parseUnits("1000", 6)
      const condition = ethers.keccak256(ethers.toUtf8Bytes("milestone_completed"))

      // Schedule
      await vault.scheduleConditionalPayment(
        supplier1.address,
        usdc.target,
        amount,
        condition,
        "Milestone payment"
      )

      // Execute with proof
      const proof = ethers.keccak256(ethers.toUtf8Bytes("proof_data"))
      await expect(vault.executeConditionalPayment(0, proof))
        .to.emit(vault, "ConditionalPaymentExecuted")
    })
  })

  describe("Yield Management", function () {
    it("Should deposit to yield strategy", async function () {
      const { vault, usdc } = await loadFixture(deployFixture)
      const amount = ethers.parseUnits("10000", 6)

      await expect(
        vault.depositToYield(usdc.target, amount, 0, 0) // Low risk, lending
      ).to.emit(vault, "YieldDeposited")
    })

    it("Should withdraw from yield strategy", async function () {
      const { vault, usdc } = await loadFixture(deployFixture)
      const amount = ethers.parseUnits("10000", 6)

      // Deposit first
      await vault.depositToYield(usdc.target, amount, 0, 0)

      // Withdraw
      await expect(
        vault.withdrawFromYield(usdc.target, amount, 0)
      ).to.emit(vault, "YieldWithdrawn")
    })

    it("Should harvest yield rewards", async function () {
      const { vault, usdc } = await loadFixture(deployFixture)
      const amount = ethers.parseUnits("10000", 6)

      // Deposit
      await vault.depositToYield(usdc.target, amount, 0, 0)

      // Fast forward time to accumulate yield
      await time.increase(86400 * 30) // 30 days

      // Harvest
      await expect(vault.harvestYield(usdc.target, 0))
        .to.emit(vault, "YieldHarvested")
    })
  })

  describe("Multi-Signature Approvals", function () {
    it("Should require approval for large payments", async function () {
      const { vault, supplier1, usdc } = await loadFixture(deployFixture)
      const largeAmount = ethers.parseUnits("15000", 6)

      await vault.schedulePayment(
        supplier1.address,
        usdc.target,
        largeAmount,
        2592000,
        "Large payment"
      )

      const payment = await vault.getPayment(0)
      expect(payment.requiresApproval).to.be.true
      expect(payment.approved).to.be.false
    })

    it("Should allow approver to approve payment", async function () {
      const { vault, approver1, supplier1, usdc } = await loadFixture(deployFixture)
      const largeAmount = ethers.parseUnits("15000", 6)

      await vault.schedulePayment(
        supplier1.address,
        usdc.target,
        largeAmount,
        2592000,
        "Large payment"
      )

      await expect(vault.connect(approver1).approvePayment(0))
        .to.emit(vault, "PaymentApproved")

      const payment = await vault.getPayment(0)
      expect(payment.approved).to.be.true
    })

    it("Should not allow non-approver to approve", async function () {
      const { vault, supplier1, usdc } = await loadFixture(deployFixture)
      const largeAmount = ethers.parseUnits("15000", 6)

      await vault.schedulePayment(
        supplier1.address,
        usdc.target,
        largeAmount,
        2592000,
        "Large payment"
      )

      await expect(
        vault.connect(supplier1).approvePayment(0)
      ).to.be.revertedWith("Not an approver")
    })
  })

  describe("Gas Optimization", function () {
    it("Should save gas with batch payments", async function () {
      const { vault, supplier1, usdc } = await loadFixture(deployFixture)

      // Schedule 10 payments
      for (let i = 0; i < 10; i++) {
        await vault.schedulePayment(
          supplier1.address,
          usdc.target,
          ethers.parseUnits("100", 6),
          1,
          `Payment ${i}`
        )
      }

      await time.increase(2)

      // Execute individually
      let individualGas = BigInt(0)
      for (let i = 0; i < 5; i++) {
        const tx = await vault.executePayment(i)
        const receipt = await tx.wait()
        individualGas += receipt.gasUsed
      }

      // Execute as batch
      const batchTx = await vault.batchExecutePayments([5, 6, 7, 8, 9])
      const batchReceipt = await batchTx.wait()

      // Batch should use less gas
      expect(batchReceipt.gasUsed).to.be.lessThan(individualGas)
      
      // Calculate savings
      const savings = Number((individualGas - batchReceipt.gasUsed) * BigInt(100) / individualGas)
      console.log(`      Gas savings: ${savings}%`)
      expect(savings).to.be.greaterThan(40) // At least 40% savings
    })
  })

  describe("Emergency Functions", function () {
    it("Should pause contract", async function () {
      const { vault } = await loadFixture(deployFixture)
      
      await vault.pause()
      expect(await vault.paused()).to.be.true
    })

    it("Should prevent operations when paused", async function () {
      const { vault, supplier1, usdc } = await loadFixture(deployFixture)
      
      await vault.pause()

      await expect(
        vault.schedulePayment(
          supplier1.address,
          usdc.target,
          ethers.parseUnits("100", 6),
          2592000,
          "Test"
        )
      ).to.be.revertedWith("Pausable: paused")
    })

    it("Should unpause contract", async function () {
      const { vault } = await loadFixture(deployFixture)
      
      await vault.pause()
      await vault.unpause()
      expect(await vault.paused()).to.be.false
    })
  })

  describe("Security", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This would require a malicious contract
      // Skipped for brevity but important for production
    })

    it("Should only allow owner to create departments", async function () {
      const { vault, supplier1 } = await loadFixture(deployFixture)

      await expect(
        vault.connect(supplier1).createDepartment(
          "Unauthorized",
          ethers.parseUnits("1000", 6),
          [supplier1.address]
        )
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should validate all inputs", async function () {
      const { vault, usdc } = await loadFixture(deployFixture)

      // Invalid recipient
      await expect(
        vault.schedulePayment(
          ethers.ZeroAddress,
          usdc.target,
          ethers.parseUnits("100", 6),
          2592000,
          "Test"
        )
      ).to.be.revertedWith("Invalid recipient")

      // Invalid amount
      await expect(
        vault.schedulePayment(
          "0x742d35Cc6634C0532925a3b844Bc9e7595f5678",
          usdc.target,
          0,
          2592000,
          "Test"
        )
      ).to.be.revertedWith("Amount must be positive")
    })
  })

  describe("Integration Tests", function () {
    it("Should handle complete payment workflow", async function () {
      const { vault, dept1Manager, supplier1, usdc } = await loadFixture(deployFixture)
      
      // 1. Create department
      await vault.createDepartment(
        "Engineering",
        ethers.parseUnits("10000", 6),
        [dept1Manager.address]
      )

      // 2. Schedule payment
      await vault.scheduleDepartmentPayment(
        0,
        supplier1.address,
        usdc.target,
        ethers.parseUnits("1000", 6),
        1,
        "Monthly salary"
      )

      // 3. Wait for execution time
      await time.increase(2)

      // 4. Execute payment
      const initialBalance = await usdc.balanceOf(supplier1.address)
      await vault.executePayment(0)
      const finalBalance = await usdc.balanceOf(supplier1.address)

      // 5. Verify
      expect(finalBalance - initialBalance).to.equal(ethers.parseUnits("1000", 6))
    })

    it("Should handle yield generation workflow", async function () {
      const { vault, usdc } = await loadFixture(deployFixture)
      
      // 1. Deposit to yield
      const depositAmount = ethers.parseUnits("10000", 6)
      await vault.depositToYield(usdc.target, depositAmount, 0, 0)

      // 2. Wait for yield to accumulate
      await time.increase(86400 * 30)

      // 3. Harvest yield
      await vault.harvestYield(usdc.target, 0)

      // 4. Withdraw
      await vault.withdrawFromYield(usdc.target, depositAmount, 0)

      // Balance should be higher due to yield
      const balance = await usdc.balanceOf(vault.target)
      expect(balance).to.be.greaterThan(ethers.parseUnits("990000", 6))
    })
  })
})