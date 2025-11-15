// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TreasuryVaultV2.sol";
import "./CCTPBridge.sol";
import "./YieldStrategy.sol";

/// @title TreasuryVaultV3 - Advanced Treasury with CCTP & Yield
/// @notice Enhanced treasury with cross-chain transfers and automated yield generation
/// @dev Extends V2 with CCTP bridge integration and yield strategies
contract TreasuryVaultV3 is TreasuryVaultV2 {
    
    // Additional structures for V3
    struct DepartmentBudget {
        string name;
        uint256 monthlyLimit;
        uint256 currentSpent;
        uint256 lastResetTime;
        bool active;
        address[] authorizedSpenders;
    }
    
    struct ConditionalPayment {
        uint256 paymentId;
        bytes32 conditionHash;
        bool conditionMet;
        uint256 conditionCheckTime;
        string conditionDescription;
    }
    
    struct CrossChainPayment {
        uint256 paymentId;
        uint32 destinationDomain;
        uint64 bridgeNonce;
        BridgeStatus status;
    }
    
    enum BridgeStatus {
        NotBridged,
        Pending,
        Completed,
        Failed
    }
    
    // V3 State variables
    CCTPBridge public cctpBridge;
    YieldStrategy public yieldStrategy;
    
    // Department budgets
    mapping(uint256 => DepartmentBudget) public departments;
    mapping(address => uint256) public addressToDepartment;
    uint256 public departmentCount;
    
    // Conditional payments
    mapping(uint256 => ConditionalPayment) public conditionalPayments;
    
    // Cross-chain payments
    mapping(uint256 => CrossChainPayment) public crossChainPayments;
    
    // Yield management
    bool public autoYieldEnabled;
    uint256 public yieldThreshold = 10000e6; // $10K minimum for yield
    uint256 public targetIdlePercent = 20; // Keep 20% idle for payments
    
    // Dynamic fee optimization
    uint256 public lastGasPrice;
    uint256 public optimalGasPrice;
    uint256 public gasCheckInterval = 1 hours;
    uint256 public lastGasCheck;
    
    // Events
    event DepartmentCreated(uint256 indexed departmentId, string name, uint256 monthlyLimit);
    event DepartmentBudgetUpdated(uint256 indexed departmentId, uint256 newLimit);
    event DepartmentSpent(uint256 indexed departmentId, uint256 amount, uint256 remaining);
    event ConditionalPaymentCreated(uint256 indexed paymentId, bytes32 conditionHash);
    event ConditionalPaymentExecuted(uint256 indexed paymentId);
    event CrossChainPaymentInitiated(uint256 indexed paymentId, uint32 destinationDomain, uint64 bridgeNonce);
    event CrossChainPaymentCompleted(uint256 indexed paymentId);
    event YieldDeposited(uint256 amount, uint256 positionId);
    event YieldWithdrawn(uint256 amount);
    event AutoYieldToggled(bool enabled);
    event GasPriceOptimized(uint256 oldPrice, uint256 newPrice);
    
    constructor(
        address _usdcAddress,
        address _eurcAddress,
        address _autoSwapContract,
        address _cctpBridge,
        address _yieldStrategy
    ) TreasuryVaultV2(_usdcAddress, _eurcAddress, _autoSwapContract) {
        require(_cctpBridge != address(0), "Invalid CCTP bridge");
        require(_yieldStrategy != address(0), "Invalid yield strategy");
        
        cctpBridge = CCTPBridge(_cctpBridge);
        yieldStrategy = YieldStrategy(_yieldStrategy);
    }
    
    /// @notice Create department with budget
    function createDepartment(
        string memory name,
        uint256 monthlyLimit,
        address[] memory authorizedSpenders
    ) external onlyOwner returns (uint256 departmentId) {
        departmentId = departmentCount++;
        
        departments[departmentId] = DepartmentBudget({
            name: name,
            monthlyLimit: monthlyLimit,
            currentSpent: 0,
            lastResetTime: block.timestamp,
            active: true,
            authorizedSpenders: authorizedSpenders
        });
        
        // Map spenders to department
        for (uint256 i = 0; i < authorizedSpenders.length; i++) {
            addressToDepartment[authorizedSpenders[i]] = departmentId;
        }
        
        emit DepartmentCreated(departmentId, name, monthlyLimit);
        return departmentId;
    }
    
    /// @notice Schedule payment with department budget check
    function schedulePaymentWithBudget(
        address _recipient,
        address _token,
        uint256 _amount,
        uint256 _frequency,
        string memory _description,
        uint256 _departmentId
    ) external returns (uint256) {
        // Check department budget
        DepartmentBudget storage dept = departments[_departmentId];
        require(dept.active, "Department not active");
        require(_isDepartmentAuthorized(_departmentId, msg.sender), "Not authorized");
        
        // Reset monthly budget if needed
        if (block.timestamp >= dept.lastResetTime + 30 days) {
            dept.currentSpent = 0;
            dept.lastResetTime = block.timestamp;
        }
        
        // Check budget limit
        require(
            dept.currentSpent + _amount <= dept.monthlyLimit,
            "Exceeds department budget"
        );
        
        // Update spent amount
        dept.currentSpent += _amount;
        
        emit DepartmentSpent(_departmentId, _amount, dept.monthlyLimit - dept.currentSpent);
        
        // Schedule payment using parent function
        return this.schedulePayment(_recipient, _token, _amount, _frequency, _description);
    }
    
    /// @notice Schedule cross-chain payment via CCTP
    function scheduleCrossChainPayment(
        address _recipient,
        address _token,
        uint256 _amount,
        uint32 _destinationDomain,
        string memory _description
    ) external onlyOwner returns (uint256 paymentId) {
        require(_token == usdcAddress, "Only USDC for cross-chain");
        
        // Create payment record
        paymentId = paymentCount++;
        
        scheduledPayments[paymentId] = Payment({
            recipient: _recipient,
            token: _token,
            amount: _amount,
            nextExecutionTime: block.timestamp,
            frequency: 0, // One-time payment
            active: true,
            requiresApproval: _amount >= approvalThreshold,
            approved: _amount < approvalThreshold,
            description: _description,
            approvalCount: 0,
            requiredApprovals: _amount >= approvalThreshold ? requiredApprovals : 0,
            approvalDeadline: _amount >= approvalThreshold ? block.timestamp + approvalTimelock : 0
        });
        
        // Create cross-chain record
        crossChainPayments[paymentId] = CrossChainPayment({
            paymentId: paymentId,
            destinationDomain: _destinationDomain,
            bridgeNonce: 0,
            status: BridgeStatus.NotBridged
        });
        
        emit PaymentScheduled(paymentId, _recipient, _amount, _description, 
                            _amount >= approvalThreshold ? requiredApprovals : 0);
        
        return paymentId;
    }
    
    /// @notice Execute cross-chain payment
    function executeCrossChainPayment(uint256 _paymentId) external nonReentrant {
        Payment storage payment = scheduledPayments[_paymentId];
        CrossChainPayment storage crossChain = crossChainPayments[_paymentId];
        
        require(payment.active, "Payment not active");
        require(!payment.requiresApproval || payment.approved, "Needs approval");
        require(crossChain.status == BridgeStatus.NotBridged, "Already bridged");
        
        // Approve CCTP bridge
        IERC20(payment.token).approve(address(cctpBridge), payment.amount);
        
        // Initiate bridge transfer
        uint64 nonce = cctpBridge.bridgeUSDC(
            payment.amount,
            crossChain.destinationDomain,
            payment.recipient
        );
        
        // Update status
        crossChain.bridgeNonce = nonce;
        crossChain.status = BridgeStatus.Pending;
        payment.active = false; // Mark as processed
        
        emit CrossChainPaymentInitiated(_paymentId, crossChain.destinationDomain, nonce);
    }
    
    /// @notice Create conditional payment
    function scheduleConditionalPayment(
        address _recipient,
        address _token,
        uint256 _amount,
        uint256 _frequency,
        string memory _description,
        bytes32 _conditionHash,
        string memory _conditionDescription
    ) external onlyOwner returns (uint256 paymentId) {
        // Schedule regular payment
        paymentId = this.schedulePayment(_recipient, _token, _amount, _frequency, _description);
        
        // Add conditional logic
        conditionalPayments[paymentId] = ConditionalPayment({
            paymentId: paymentId,
            conditionHash: _conditionHash,
            conditionMet: false,
            conditionCheckTime: 0,
            conditionDescription: _conditionDescription
        });
        
        // Mark payment as requiring condition check
        scheduledPayments[paymentId].approved = false;
        
        emit ConditionalPaymentCreated(paymentId, _conditionHash);
        return paymentId;
    }
    
    /// @notice Check and execute conditional payment
    function executeConditionalPayment(
        uint256 _paymentId,
        bytes memory _conditionProof
    ) external nonReentrant {
        ConditionalPayment storage conditional = conditionalPayments[_paymentId];
        require(!conditional.conditionMet, "Condition already met");
        
        // Verify condition (simplified - production would have more complex logic)
        bytes32 proofHash = keccak256(_conditionProof);
        require(proofHash == conditional.conditionHash, "Condition not met");
        
        // Mark condition as met
        conditional.conditionMet = true;
        conditional.conditionCheckTime = block.timestamp;
        
        // Approve payment for execution
        scheduledPayments[_paymentId].approved = true;
        
        emit ConditionalPaymentExecuted(_paymentId);
        
        // Execute payment
        this.executePayment(_paymentId);
    }
    
    /// @notice Deposit idle funds to yield strategy
    function depositToYield(uint256 amount) external onlyOwner returns (uint256 positionId) {
        require(amount >= yieldThreshold, "Below yield threshold");
        
        // Check we maintain enough idle funds
        uint256 totalBalance = IERC20(usdcAddress).balanceOf(address(this));
        uint256 minIdle = (totalBalance * targetIdlePercent) / 100;
        require(totalBalance - amount >= minIdle, "Insufficient idle funds");
        
        // Approve yield strategy
        IERC20(usdcAddress).approve(address(yieldStrategy), amount);
        
        // Deposit to yield
        positionId = yieldStrategy.depositToYield(
            address(0), // Protocol address would be set
            usdcAddress,
            amount,
            YieldStrategy.PositionType.Lending
        );
        
        emit YieldDeposited(amount, positionId);
        return positionId;
    }
    
    /// @notice Withdraw from yield strategy
    function withdrawFromYield(uint256 positionId) external onlyOwner returns (uint256 amount) {
        amount = yieldStrategy.withdrawFromYield(positionId);
        emit YieldWithdrawn(amount);
        return amount;
    }
    
    /// @notice Auto-manage yield on idle funds
    function autoManageYield() external {
        require(autoYieldEnabled, "Auto-yield disabled");
        
        uint256 totalBalance = IERC20(usdcAddress).balanceOf(address(this));
        uint256 targetIdle = (totalBalance * targetIdlePercent) / 100;
        
        if (totalBalance > targetIdle + yieldThreshold) {
            // Deposit excess to yield
            uint256 excessAmount = totalBalance - targetIdle;
            this.depositToYield(excessAmount);
        }
    }
    
    /// @notice Toggle auto-yield
    function setAutoYield(bool enabled) external onlyOwner {
        autoYieldEnabled = enabled;
        emit AutoYieldToggled(enabled);
    }
    
    /// @notice Optimize gas price for batch payments
    function optimizeGasPrice() external returns (uint256 optimal) {
        require(block.timestamp >= lastGasCheck + gasCheckInterval, "Too soon");
        
        // Get current gas price
        uint256 currentGas = tx.gasprice;
        
        // Calculate optimal (simplified - production would use oracle)
        if (currentGas < lastGasPrice) {
            // Gas is cheaper, good time for batch execution
            optimalGasPrice = currentGas;
        } else {
            // Gas is more expensive, wait
            optimalGasPrice = lastGasPrice;
        }
        
        lastGasPrice = currentGas;
        lastGasCheck = block.timestamp;
        
        emit GasPriceOptimized(lastGasPrice, optimalGasPrice);
        return optimalGasPrice;
    }
    
    /// @notice Check if gas price is optimal for execution
    function isOptimalGasPrice() external view returns (bool) {
        return tx.gasprice <= optimalGasPrice * 110 / 100; // Within 10% of optimal
    }
    
    /// @notice Get department budget status
    function getDepartmentStatus(uint256 departmentId) external view returns (
        string memory name,
        uint256 monthlyLimit,
        uint256 currentSpent,
        uint256 remaining,
        uint256 percentUsed,
        bool active
    ) {
        DepartmentBudget memory dept = departments[departmentId];
        
        // Reset if needed (view function, doesn't modify state)
        uint256 spent = dept.currentSpent;
        if (block.timestamp >= dept.lastResetTime + 30 days) {
            spent = 0;
        }
        
        return (
            dept.name,
            dept.monthlyLimit,
            spent,
            dept.monthlyLimit - spent,
            dept.monthlyLimit > 0 ? (spent * 100) / dept.monthlyLimit : 0,
            dept.active
        );
    }
    
    /// @notice Get cross-chain payment status
    function getCrossChainStatus(uint256 paymentId) external view returns (
        uint32 destinationDomain,
        uint64 bridgeNonce,
        BridgeStatus status
    ) {
        CrossChainPayment memory cc = crossChainPayments[paymentId];
        return (cc.destinationDomain, cc.bridgeNonce, cc.status);
    }
    
    /// @notice Get yield statistics
    function getYieldStats() external view returns (
        uint256 totalDeposited,
        uint256 totalYieldEarned,
        uint256 currentAPY,
        uint256 totalValue
    ) {
        return (
            yieldStrategy.totalDeposited(),
            yieldStrategy.totalYieldEarned(),
            yieldStrategy.getCurrentAPY(),
            yieldStrategy.getTotalValue()
        );
    }
    
    /// @notice Internal helper to check department authorization
    function _isDepartmentAuthorized(uint256 departmentId, address spender) internal view returns (bool) {
        if (spender == owner()) return true;
        
        DepartmentBudget storage dept = departments[departmentId];
        for (uint256 i = 0; i < dept.authorizedSpenders.length; i++) {
            if (dept.authorizedSpenders[i] == spender) {
                return true;
            }
        }
        return false;
    }
    
    /// @notice Update department budget
    function updateDepartmentBudget(uint256 departmentId, uint256 newLimit) external onlyOwner {
        departments[departmentId].monthlyLimit = newLimit;
        emit DepartmentBudgetUpdated(departmentId, newLimit);
    }
    
    /// @notice Set yield parameters
    function setYieldParams(uint256 threshold, uint256 idlePercent) external onlyOwner {
        require(idlePercent <= 100, "Invalid percentage");
        yieldThreshold = threshold;
        targetIdlePercent = idlePercent;
    }
    
    /// @notice Emergency: Withdraw all yield positions
    function emergencyWithdrawAllYield() external onlyOwner {
        yieldStrategy.emergencyWithdrawAll();
    }
}