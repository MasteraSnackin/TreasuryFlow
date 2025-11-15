const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("TreasuryVault V3.0 - Comprehensive Tests", function () {
  
  async function deployFixture() {
    const [owner, supplier1, supplier2, approver, user] = await ethers.getSigners();

    // Deploy mock tokens
    const Token = await ethers.getContractFactory("MockERC20");
    const usdc = await Token.deploy("USDC", "USDC", 6);
    const eurc = await Token.deploy("EURC", "EURC", 6);

    // Deploy AutoSwap
    const AutoSwap = await ethers.getContractFactory("AutoSwap");
    const autoSwap = await AutoSwap.deploy(await usdc.getAddress(), await eurc.getAddress());

    // Deploy vault
    const Vault = await ethers.getContractFactory("TreasuryVault");
    const vault = await Vault.deploy(
      await usdc.getAddress(),
      await eurc.getAddress(),
      await autoSwap.getAddress()
    );

    // Mint tokens
    await usdc.mint(await vault.getAddress(), ethers.parseUnits("1000000", 6));
    await eurc.mint(await vault.getAddress(), ethers.parseUnits("1000000", 6));

    return { vault, usdc, eurc, autoSwap, owner, supplier1, supplier2, approver, user };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { vault, owner } = await loadFixture(deployFixture);
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should set token addresses correctly", async function () {
      const { vault, usdc, eurc } = await loadFixture(deployFixture);
      expect(await vault.usdcAddress()).to.equal(await usdc.getAddress());
      expect(await vault.eurcAddress()).to.equal(await eurc.getAddress());
    });

    it("Should have correct initial approval threshold", async function () {
      const { vault } = await loadFixture(deployFixture);
      expect(await vault.approvalThreshold()).to.equal(ethers.parseUnits("10000", 6));
    });

    it("Should set deployer as initial approver", async function () {
      const { vault, owner } = await loadFixture(deployFixture);
      expect(await vault.approvers(owner.address)).to.be.true;
    });
  });

  describe("Payment Scheduling", function () {
    it("Should schedule a basic payment", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);
      const amount = ethers.parseUnits("100", 6);

      await expect(
        vault.schedulePayment(
          supplier1.address,
          await usdc.getAddress(),
          amount,
          604800, // weekly
          "Test payment"
        )
      ).to.emit(vault, "PaymentScheduled")
        .withArgs(0, supplier1.address, amount, "Test payment");

      const payment = await vault.getPayment(0);
      expect(payment.recipient).to.equal(supplier1.address);
      expect(payment.amount).to.equal(amount);
      expect(payment.active).to.be.true;
    });

    it("Should require approval for large payments", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);
      const largeAmount = ethers.parseUnits("15000", 6);

      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        largeAmount,
        604800,
        "Large payment"
      );

      const payment = await vault.getPayment(0);
      expect(payment.requiresApproval).to.be.true;
      expect(payment.approved).to.be.false;
    });

    it("Should not require approval for small payments", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);
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

    it("Should reject invalid recipient", async function () {
      const { vault, usdc } = await loadFixture(deployFixture);

      await expect(
        vault.schedulePayment(
          ethers.ZeroAddress,
          await usdc.getAddress(),
          100,
          604800,
          "Test"
        )
      ).to.be.revertedWith("Invalid recipient");
    });

    it("Should reject zero amount", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);

      await expect(
        vault.schedulePayment(
          supplier1.address,
          await usdc.getAddress(),
          0,
          604800,
          "Test"
        )
      ).to.be.revertedWith("Amount must be positive");
    });

    it("Should reject unsupported token", async function () {
      const { vault, supplier1 } = await loadFixture(deployFixture);
      const randomToken = ethers.Wallet.createRandom().address;

      await expect(
        vault.schedulePayment(
          supplier1.address,
          randomToken,
          ethers.parseUnits("100", 6),
          604800,
          "Test"
        )
      ).to.be.revertedWith("Unsupported token");
    });
  });

  describe("Payment Execution", function () {
    it("Should execute payment when ready", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);
      const amount = ethers.parseUnits("100", 6);

      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        amount,
        1, // 1 second
        "Test payment"
      );

      await time.increase(2);

      const initialBalance = await usdc.balanceOf(supplier1.address);
      await vault.executePayment(0);
      const finalBalance = await usdc.balanceOf(supplier1.address);

      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should not execute payment before ready", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);

      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        86400, // 1 day
        "Test payment"
      );

      await expect(vault.executePayment(0)).to.be.revertedWith("Not ready");
    });

    it("Should not execute unapproved large payment", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);

      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("15000", 6),
        1,
        "Large payment"
      );

      await time.increase(2);

      await expect(vault.executePayment(0)).to.be.revertedWith("Needs approval");
    });

    it("Should execute after approval", async function () {
      const { vault, usdc, supplier1, owner } = await loadFixture(deployFixture);
      const amount = ethers.parseUnits("15000", 6);

      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        amount,
        1,
        "Large payment"
      );

      await vault.approvePayment(0);
      await time.increase(2);

      const initialBalance = await usdc.balanceOf(supplier1.address);
      await vault.executePayment(0);
      const finalBalance = await usdc.balanceOf(supplier1.address);

      expect(finalBalance - initialBalance).to.equal(amount);
    });
  });

  describe("Batch Payment Execution", function () {
    it("Should execute multiple payments in batch", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);
      const amount = ethers.parseUnits("100", 6);

      // Schedule 5 payments
      for (let i = 0; i < 5; i++) {
        await vault.schedulePayment(
          supplier1.address,
          await usdc.getAddress(),
          amount,
          1,
          `Payment ${i}`
        );
      }

      await time.increase(2);

      const initialBalance = await usdc.balanceOf(supplier1.address);
      await vault.batchExecutePayments([0, 1, 2, 3, 4]);
      const finalBalance = await usdc.balanceOf(supplier1.address);

      expect(finalBalance - initialBalance).to.equal(amount * 5n);
    });

    it("Should emit BatchPaymentExecuted event", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);

      for (let i = 0; i < 3; i++) {
        await vault.schedulePayment(
          supplier1.address,
          await usdc.getAddress(),
          ethers.parseUnits("100", 6),
          1,
          `Payment ${i}`
        );
      }

      await time.increase(2);

      await expect(vault.batchExecutePayments([0, 1, 2]))
        .to.emit(vault, "BatchPaymentExecuted");
    });

    it("Should enforce max batch size", async function () {
      const { vault } = await loadFixture(deployFixture);
      const tooMany = Array.from({ length: 51 }, (_, i) => i);

      await expect(
        vault.batchExecutePayments(tooMany)
      ).to.be.revertedWith("Max 50 payments");
    });

    it("Should skip payments not ready", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);

      // Schedule 3 ready payments
      for (let i = 0; i < 3; i++) {
        await vault.schedulePayment(
          supplier1.address,
          await usdc.getAddress(),
          ethers.parseUnits("100", 6),
          1,
          `Ready payment ${i}`
        );
      }

      // Schedule 1 future payment
      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        86400,
        "Future payment"
      );

      await time.increase(2);

      const initialBalance = await usdc.balanceOf(supplier1.address);
      await vault.batchExecutePayments([0, 1, 2, 3]);
      const finalBalance = await usdc.balanceOf(supplier1.address);

      // Only 3 payments should execute
      expect(finalBalance - initialBalance).to.equal(ethers.parseUnits("300", 6));
    });
  });

  describe("Supplier Management", function () {
    it("Should add supplier", async function () {
      const { vault, supplier1 } = await loadFixture(deployFixture);

      await expect(
        vault.addSupplier(supplier1.address, "Test Supplier", "USDC")
      ).to.emit(vault, "SupplierAdded")
        .withArgs(supplier1.address, "Test Supplier");

      const supplier = await vault.getSupplier(supplier1.address);
      expect(supplier.name).to.equal("Test Supplier");
      expect(supplier.preferredCurrency).to.equal("USDC");
      expect(supplier.active).to.be.true;
    });

    it("Should track supplier payment stats", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);

      await vault.addSupplier(supplier1.address, "Test Supplier", "USDC");

      const amount = ethers.parseUnits("100", 6);
      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        amount,
        1,
        "Payment 1"
      );

      await time.increase(2);
      await vault.executePayment(0);

      const supplier = await vault.getSupplier(supplier1.address);
      expect(supplier.totalPaid).to.equal(amount);
      expect(supplier.paymentCount).to.equal(1);
    });
  });

  describe("Approval Workflow", function () {
    it("Should allow approver to approve payment", async function () {
      const { vault, usdc, supplier1, owner } = await loadFixture(deployFixture);

      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("15000", 6),
        1,
        "Large payment"
      );

      await expect(vault.approvePayment(0))
        .to.emit(vault, "PaymentApproved")
        .withArgs(0, owner.address);

      const payment = await vault.getPayment(0);
      expect(payment.approved).to.be.true;
    });

    it("Should reject approval from non-approver", async function () {
      const { vault, usdc, supplier1, user } = await loadFixture(deployFixture);

      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("15000", 6),
        1,
        "Large payment"
      );

      await expect(
        vault.connect(user).approvePayment(0)
      ).to.be.revertedWith("Not an approver");
    });

    it("Should add and remove approvers", async function () {
      const { vault, approver } = await loadFixture(deployFixture);

      await vault.addApprover(approver.address);
      expect(await vault.approvers(approver.address)).to.be.true;

      await vault.removeApprover(approver.address);
      expect(await vault.approvers(approver.address)).to.be.false;
    });
  });

  describe("Payment Cancellation", function () {
    it("Should cancel active payment", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);

      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        604800,
        "Test payment"
      );

      await expect(vault.cancelPayment(0))
        .to.emit(vault, "PaymentCancelled")
        .withArgs(0);

      const payment = await vault.getPayment(0);
      expect(payment.active).to.be.false;
    });

    it("Should not execute cancelled payment", async function () {
      const { vault, usdc, supplier1 } = await loadFixture(deployFixture);

      await vault.schedulePayment(
        supplier1.address,
        await usdc.getAddress(),
        ethers.parseUnits("100", 6),
        1,
        "Test payment"
      );

      await vault.cancelPayment(0);
      await time.increase(2);

      await expect(vault.executePayment(0)).to.be.revertedWith("Payment not active");
    });
  });

  describe("Access Control", function () {
    it("Should prevent non-owner from scheduling", async function () {
      const { vault, usdc, user, supplier1 } = await loadFixture(deployFixture);

      await expect(
        vault.connect(user).schedulePayment(
          supplier1.address,
          await usdc.getAddress(),
          ethers.parseUnits("100", 6),
          604800,
          "Test"
        )
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from adding suppliers", async function () {
      const { vault, user, supplier1 } = await loadFixture(deployFixture);

      await expect(
        vault.connect(user).addSupplier(supplier1.address, "Test", "USDC")
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to withdraw funds", async function () {
      const { vault, usdc, owner } = await loadFixture(deployFixture);
      const amount = ethers.parseUnits("1000", 6);

      const initialBalance = await usdc.balanceOf(owner.address);
      await vault.withdraw(await usdc.getAddress(), amount);
      const finalBalance = await usdc.balanceOf(owner.address);

      expect(finalBalance - initialBalance).to.equal(amount);
    });
  });
});