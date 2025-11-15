const { expect } = require("chai")
const { ethers } = require("hardhat")
const { time } = require("@nomicfoundation/hardhat-network-helpers")

describe("TreasuryVaultV2 - Multi-Signature Tests", function () {
  let vault, usdc, eurc, autoSwap
  let owner, approver1, approver2, approver3, supplier, user

  beforeEach(async function () {
    [owner, approver1, approver2, approver3, supplier, user] = await ethers.getSigners()

    // Deploy mock tokens
    const Token = await ethers.getContractFactory("MockERC20")
    usdc = await Token.deploy("USDC", "USDC", 6)
    eurc = await Token.deploy("EURC", "EURC", 6)

    // Deploy AutoSwap
    const AutoSwap = await ethers.getContractFactory("AutoSwap")
    autoSwap = await AutoSwap.deploy(usdc.target, eurc.target)

    // Deploy vault V2
    const Vault = await ethers.getContractFactory("TreasuryVaultV2")
    vault = await Vault.deploy(usdc.target, eurc.target, autoSwap.target)

    // Mint tokens to vault
    await usdc.mint(vault.target, ethers.parseUnits("1000000", 6))
    await eurc.mint(vault.target, ethers.parseUnits("1000000", 6))
  })

  describe("Multi-Sig Configuration", function () {
    it("Should initialize with owner as first approver", async function () {
      expect(await vault.isApprover(owner.address)).to.be.true
      const approvers = await vault.getApprovers()
      expect(approvers.length).to.equal(1)
      expect(approvers[0]).to.equal(owner.address)
    })

    it("Should add multiple approvers", async function () {
      await vault.addApprover(approver1.address)
      await vault.addApprover(approver2.address)
      await vault.addApprover(approver3.address)

      const approvers = await vault.getApprovers()
      expect(approvers.length).to.equal(4)
      expect(await vault.isApprover(approver1.address)).to.be.true
      expect(await vault.isApprover(approver2.address)).to.be.true
      expect(await vault.isApprover(approver3.address)).to.be.true
    })

    it("Should not add duplicate approvers", async function () {
      await vault.addApprover(approver1.address)
      await expect(
        vault.addApprover(approver1.address)
      ).to.be.revertedWith("Already an approver")
    })

    it("Should remove approver", async function () {
      await vault.addApprover(approver1.address)
      await vault.addApprover(approver2.address)
      await vault.addApprover(approver3.address)

      await vault.removeApprover(approver1.address)
      expect(await vault.isApprover(approver1.address)).to.be.false

      const approvers = await vault.getApprovers()
      expect(approvers.length).to.equal(3)
    })

    it("Should not remove approver if it breaks multi-sig", async function () {
      await vault.addApprover(approver1.address)
      await vault.setRequiredApprovals(2)

      await expect(
        vault.removeApprover(approver1.address)
      ).to.be.revertedWith("Cannot remove: would break multi-sig")
    })

    it("Should update required approvals", async function () {
      await vault.addApprover(approver1.address)
      await vault.addApprover(approver2.address)

      await vault.setRequiredApprovals(3)
      expect(await vault.requiredApprovals()).to.equal(3)
    })

    it("Should not set required approvals higher than approver count", async function () {
      await vault.addApprover(approver1.address)

      await expect(
        vault.setRequiredApprovals(5)
      ).to.be.revertedWith("Cannot require more approvals than approvers")
    })

    it("Should update approval timelock", async function () {
      await vault.setApprovalTimelock(2 * 60 * 60) // 2 hours
      expect(await vault.approvalTimelock()).to.equal(2 * 60 * 60)
    })

    it("Should not set timelock > 7 days", async function () {
      await expect(
        vault.setApprovalTimelock(8 * 24 * 60 * 60)
      ).to.be.revertedWith("Timelock must be <= 7 days")
    })
  })

  describe("Payment Approval Workflow", function () {
    beforeEach(async function () {
      // Add 3 approvers (owner + 2 more)
      await vault.addApprover(approver1.address)
      await vault.addApprover(approver2.address)
      await vault.setRequiredApprovals(2) // Require 2-of-3
    })

    it("Should require approval for large payments", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)

      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        604800,
        "Large payment"
      )

      const payment = await vault.getPayment(0)
      expect(payment.requiresApproval).to.be.true
      expect(payment.approved).to.be.false
    })

    it("Should not require approval for small payments", async function () {
      const smallAmount = ethers.parseUnits("5000", 6)

      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        smallAmount,
        604800,
        "Small payment"
      )

      const payment = await vault.getPayment(0)
      expect(payment.requiresApproval).to.be.false
      expect(payment.approved).to.be.true
    })

    it("Should track individual approvals", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        604800,
        "Large payment"
      )

      // First approval
      await vault.connect(owner).approvePayment(0)
      expect(await vault.hasApproved(0, owner.address)).to.be.true

      const status1 = await vault.getApprovalStatus(0)
      expect(status1.currentApprovals).to.equal(1)
      expect(status1.isApproved).to.be.false

      // Second approval
      await vault.connect(approver1).approvePayment(0)
      expect(await vault.hasApproved(0, approver1.address)).to.be.true

      const status2 = await vault.getApprovalStatus(0)
      expect(status2.currentApprovals).to.equal(2)
      expect(status2.isApproved).to.be.true
    })

    it("Should emit PaymentApproved event with counts", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        604800,
        "Large payment"
      )

      await expect(vault.connect(owner).approvePayment(0))
        .to.emit(vault, "PaymentApproved")
        .withArgs(0, owner.address, 1, 2)
    })

    it("Should not allow duplicate approvals", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        604800,
        "Large payment"
      )

      await vault.connect(owner).approvePayment(0)

      await expect(
        vault.connect(owner).approvePayment(0)
      ).to.be.revertedWith("Already approved by you")
    })

    it("Should not allow non-approvers to approve", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        604800,
        "Large payment"
      )

      await expect(
        vault.connect(user).approvePayment(0)
      ).to.be.revertedWith("Not an approver")
    })

    it("Should allow approval revocation", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        604800,
        "Large payment"
      )

      await vault.connect(owner).approvePayment(0)
      expect(await vault.hasApproved(0, owner.address)).to.be.true

      await vault.connect(owner).revokeApproval(0)
      expect(await vault.hasApproved(0, owner.address)).to.be.false

      const status = await vault.getApprovalStatus(0)
      expect(status.currentApprovals).to.equal(0)
    })

    it("Should not allow revocation if not approved", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        604800,
        "Large payment"
      )

      await expect(
        vault.connect(owner).revokeApproval(0)
      ).to.be.revertedWith("You haven't approved this")
    })

    it("Should not execute payment without sufficient approvals", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        1, // 1 second
        "Large payment"
      )

      // Only 1 approval (need 2)
      await vault.connect(owner).approvePayment(0)

      await time.increase(2)

      await expect(
        vault.executePayment(0)
      ).to.be.revertedWith("Needs approval")
    })

    it("Should execute payment with sufficient approvals", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        1,
        "Large payment"
      )

      // Get 2 approvals
      await vault.connect(owner).approvePayment(0)
      await vault.connect(approver1).approvePayment(0)

      await time.increase(3700) // Wait for timelock (1 hour + buffer)

      const initialBalance = await usdc.balanceOf(supplier.address)
      await vault.executePayment(0)
      const finalBalance = await usdc.balanceOf(supplier.address)

      expect(finalBalance - initialBalance).to.equal(largeAmount)
    })
  })

  describe("Timelock Enforcement", function () {
    beforeEach(async function () {
      await vault.addApprover(approver1.address)
      await vault.setRequiredApprovals(2)
      await vault.setApprovalTimelock(3600) // 1 hour
    })

    it("Should set approval deadline when payment scheduled", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        604800,
        "Large payment"
      )

      const payment = await vault.getPayment(0)
      const currentTime = await time.latest()
      expect(payment.nextExecutionTime).to.be.closeTo(
        currentTime + 604800,
        10
      )
    })

    it("Should enforce timelock after approval", async function () {
      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        1, // Ready immediately
        "Large payment"
      )

      // Get approvals
      await vault.connect(owner).approvePayment(0)
      await vault.connect(approver1).approvePayment(0)

      // Try to execute immediately (should fail - timelock not passed)
      await time.increase(2)
      await expect(
        vault.executePayment(0)
      ).to.be.revertedWith("Not ready")

      // Wait for timelock
      await time.increase(3600)

      // Should succeed now
      await vault.executePayment(0)
    })
  })

  describe("3-of-5 Multi-Sig Scenario", function () {
    beforeEach(async function () {
      // Add 4 more approvers (owner + 4 = 5 total)
      await vault.addApprover(approver1.address)
      await vault.addApprover(approver2.address)
      await vault.addApprover(approver3.address)
      await vault.addApprover(user.address)
      await vault.setRequiredApprovals(3) // Require 3-of-5
    })

    it("Should require 3 approvals", async function () {
      const largeAmount = ethers.parseUnits("50000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        1,
        "Very large payment"
      )

      // Get 2 approvals (not enough)
      await vault.connect(owner).approvePayment(0)
      await vault.connect(approver1).approvePayment(0)

      let status = await vault.getApprovalStatus(0)
      expect(status.isApproved).to.be.false

      // Get 3rd approval
      await vault.connect(approver2).approvePayment(0)

      status = await vault.getApprovalStatus(0)
      expect(status.isApproved).to.be.true
      expect(status.currentApprovals).to.equal(3)
    })

    it("Should list all approvers who approved", async function () {
      const largeAmount = ethers.parseUnits("50000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        1,
        "Very large payment"
      )

      await vault.connect(owner).approvePayment(0)
      await vault.connect(approver1).approvePayment(0)
      await vault.connect(approver3).approvePayment(0)

      const status = await vault.getApprovalStatus(0)
      expect(status.approvedBy.length).to.equal(3)
      expect(status.approvedBy).to.include(owner.address)
      expect(status.approvedBy).to.include(approver1.address)
      expect(status.approvedBy).to.include(approver3.address)
    })
  })

  describe("Security Edge Cases", function () {
    it("Should not approve cancelled payment", async function () {
      await vault.addApprover(approver1.address)
      await vault.setRequiredApprovals(2)

      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        604800,
        "Large payment"
      )

      await vault.cancelPayment(0)

      await expect(
        vault.connect(owner).approvePayment(0)
      ).to.be.revertedWith("Payment not active")
    })

    it("Should not execute cancelled payment even with approvals", async function () {
      await vault.addApprover(approver1.address)
      await vault.setRequiredApprovals(2)

      const largeAmount = ethers.parseUnits("15000", 6)
      await vault.schedulePayment(
        supplier.address,
        usdc.target,
        largeAmount,
        1,
        "Large payment"
      )

      await vault.connect(owner).approvePayment(0)
      await vault.connect(approver1).approvePayment(0)

      await vault.cancelPayment(0)

      await time.increase(3700)

      await expect(
        vault.executePayment(0)
      ).to.be.revertedWith("Payment not active")
    })
  })
})