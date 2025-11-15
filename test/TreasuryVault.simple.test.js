const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TreasuryVault - Core Functionality Tests", function () {
  let vault, usdc, eurc, autoSwap;
  let owner, supplier1, supplier2;

  beforeEach(async function () {
    [owner, supplier1, supplier2] = await ethers.getSigners();

    // Deploy mock tokens
    const Token = await ethers.getContractFactory("MockERC20");
    usdc = await Token.deploy("USDC", "USDC", 6);
    eurc = await Token.deploy("EURC", "EURC", 6);

    // Deploy AutoSwap
    const AutoSwap = await ethers.getContractFactory("AutoSwap");
    autoSwap = await AutoSwap.deploy(await usdc.getAddress(), await eurc.getAddress());

    // Deploy vault
    const Vault = await ethers.getContractFactory("TreasuryVault");
    vault = await Vault.deploy(
      await usdc.getAddress(),
      await eurc.getAddress(),
      await autoSwap.getAddress()
    );

    // Mint tokens to vault
    await usdc.mint(await vault.getAddress(), ethers.parseUnits("1000000", 6));
    await eurc.mint(await vault.getAddress(), ethers.parseUnits("1000000", 6));
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should set token addresses correctly", async function () {
      expect(await vault.usdcAddress()).to.equal(await usdc.getAddress());
      expect(await vault.eurcAddress()).to.equal(await eurc.getAddress());
    });

    it("Should have correct initial approval threshold", async function () {
      expect(await vault.approvalThreshold()).to.equal(ethers.parseUnits("10000", 6));
    });

    it("Should set deployer as initial approver", async function () {
      expect(await vault.approvers(owner.address)).to.be.true;
    });

    it("Should have initial balance", async function () {
      const balance = await vault.getBalance(await usdc.getAddress());
      expect(balance).to.equal(ethers.parseUnits("1000000", 6));
    });
  });

  describe("Payment Scheduling", function () {
    it("Should schedule a payment", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        amount,
        604800,
        "Test payment"
      );

      const payment = await vault.getPayment(0);
      expect(payment.recipient).to.equal(supplier1.address);
      expect(payment.amount).to.equal(amount);
      expect(payment.active).to.be.true;
    });

    it("Should increment payment count", async function () {
      expect(await vault.paymentCount()).to.equal(0);
      
      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        604800,
        "Payment 1"
      );
      
      expect(await vault.paymentCount()).to.equal(1);
    });

    it("Should not require approval for small payments", async function () {
      const smallAmount = ethers.parseUnits("5000", 6);
      
      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        smallAmount,
        604800,
        "Small payment"
      );

      const payment = await vault.getPayment(0);
      expect(payment.requiresApproval).to.be.false;
      expect(payment.approved).to.be.true;
    });
  });

  describe("Payment Execution", function () {
    it("Should execute payment after time passes", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        amount,
        2, // 2 seconds
        "Test payment"
      );

      // Wait for payment to be ready
      await time.increase(3);

      const initialBalance = await usdc.balanceOf(supplier1.address);
      await vault.executePayment(0);
      const finalBalance = await usdc.balanceOf(supplier1.address);

      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should update next execution time after payment", async function () {
      const frequency = 604800; // 1 week
      
      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        frequency,
        "Recurring payment"
      );

      await time.increase(frequency + 1);
      
      const paymentBefore = await vault.getPayment(0);
      const nextTimeBefore = paymentBefore.nextExecutionTime;
      
      await vault.executePayment(0);
      
      const paymentAfter = await vault.getPayment(0);
      const nextTimeAfter = paymentAfter.nextExecutionTime;
      
      expect(nextTimeAfter).to.be.greaterThan(nextTimeBefore);
    });
  });

  describe("Batch Payments", function () {
    it("Should execute multiple payments in batch", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // Schedule 3 payments
      for (let i = 0; i < 3; i++) {
        await vault.schedulePayment(
          supplier1.address,
          await usdc.getAddress(),
          amount,
          2,
          `Payment ${i}`
        );
      }

      await time.increase(3);

      const initialBalance = await usdc.balanceOf(supplier1.address);
      await vault.batchExecutePayments([0, 1, 2]);
      const finalBalance = await usdc.balanceOf(supplier1.address);

      expect(finalBalance - initialBalance).to.equal(amount * 3n);
    });

    it("Should skip payments not ready in batch", async function () {
      const amount = ethers.parseUnits("100", 6);
      
      // Schedule 2 ready payments
      await vault.schedulePayment(supplier1.address, await usdc.getAddress(), amount, 2, "Ready 1");
      await vault.schedulePayment(supplier1.address, await usdc.getAddress(), amount, 2, "Ready 2");
      
      // Schedule 1 future payment
      await vault.schedulePayment(supplier1.address, await usdc.getAddress(), amount, 86400, "Future");

      await time.increase(3);

      const initialBalance = await usdc.balanceOf(supplier1.address);
      await vault.batchExecutePayments([0, 1, 2]);
      const finalBalance = await usdc.balanceOf(supplier1.address);

      // Only 2 payments should execute
      expect(finalBalance - initialBalance).to.equal(amount * 2n);
    });
  });

  describe("Supplier Management", function () {
    it("Should add supplier", async function () {
      await vault.addSupplier(supplier1.address, "Test Supplier", "USDC");

      const supplier = await vault.getSupplier(supplier1.address);
      expect(supplier.name).to.equal("Test Supplier");
      expect(supplier.preferredCurrency).to.equal("USDC");
      expect(supplier.active).to.be.true;
      expect(supplier.totalPaid).to.equal(0);
    });

    it("Should track supplier payment stats", async function () {
      await vault.addSupplier(supplier1.address, "Test Supplier", "USDC");

      const amount = ethers.parseUnits("100", 6);
      await vault.schedulePayment(supplier1.address, await usdc.getAddress(), amount, 2, "Payment 1");

      await time.increase(3);
      await vault.executePayment(0);

      const supplier = await vault.getSupplier(supplier1.address);
      expect(supplier.totalPaid).to.equal(amount);
    });
  });

  describe("Approval Workflow", function () {
    it("Should add and remove approvers", async function () {
      expect(await vault.approvers(supplier1.address)).to.be.false;
      
      await vault.addApprover(supplier1.address);
      expect(await vault.approvers(supplier1.address)).to.be.true;
      
      await vault.removeApprover(supplier1.address);
      expect(await vault.approvers(supplier1.address)).to.be.false;
    });

    it("Should update approval threshold", async function () {
      const newThreshold = ethers.parseUnits("20000", 6);
      
      await vault.setApprovalThreshold(newThreshold);
      
      expect(await vault.approvalThreshold()).to.equal(newThreshold);
    });
  });

  describe("Payment Cancellation", function () {
    it("Should cancel active payment", async function () {
      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        604800,
        "Test payment"
      );

      let payment = await vault.getPayment(0);
      expect(payment.active).to.be.true;

      await vault.cancelPayment(0);

      payment = await vault.getPayment(0);
      expect(payment.active).to.be.false;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to withdraw funds", async function () {
      const amount = ethers.parseUnits("1000", 6);

      const initialBalance = await usdc.balanceOf(owner.address);
      await vault.withdraw(await usdc.getAddress(), amount);
      const finalBalance = await usdc.balanceOf(owner.address);

      expect(finalBalance - initialBalance).to.equal(amount);
    });
  });
});