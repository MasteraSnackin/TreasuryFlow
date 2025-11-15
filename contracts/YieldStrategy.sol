// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Yield protocol interfaces
interface ILendingPool {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getReserveData(address asset) external view returns (uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp);
}

interface ILiquidityPool {
    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external returns (uint256 liquidity);
    function removeLiquidity(address tokenA, address tokenB, uint256 liquidity) external returns (uint256 amountA, uint256 amountB);
    function getReserves() external view returns (uint256 reserveA, uint256 reserveB);
}

/// @title YieldStrategy - Automated Yield Generation for Treasury
/// @notice Generates yield on idle treasury funds through DeFi protocols
/// @dev Integrates with lending protocols and liquidity pools on Arc Network
contract YieldStrategy is Ownable, ReentrancyGuard {
    
    struct YieldPosition {
        address protocol;
        address token;
        uint256 principal;
        uint256 yieldEarned;
        uint256 depositTime;
        uint256 lastHarvestTime;
        PositionType positionType;
        bool active;
    }
    
    enum PositionType {
        Lending,
        LiquidityPool,
        Staking
    }
    
    enum RiskLevel {
        Low,      // Conservative: Only blue-chip protocols
        Medium,   // Balanced: Mix of established protocols
        High      // Aggressive: Higher yield, higher risk
    }
    
    // State variables
    address public treasuryVault;
    address public usdcAddress;
    address public eurcAddress;
    
    // Yield positions
    mapping(uint256 => YieldPosition) public positions;
    uint256 public positionCount;
    
    // Protocol whitelist
    mapping(address => bool) public whitelistedProtocols;
    mapping(address => RiskLevel) public protocolRiskLevel;
    
    // Strategy parameters
    uint256 public minDepositAmount = 1000e6; // $1,000 minimum
    uint256 public maxSinglePositionPercent = 30; // Max 30% in single position
    uint256 public targetYieldAPY = 500; // 5% target APY (basis points)
    RiskLevel public currentRiskLevel = RiskLevel.Low;
    
    // Statistics
    uint256 public totalDeposited;
    uint256 public totalYieldEarned;
    uint256 public totalWithdrawn;
    uint256 public lastRebalanceTime;
    
    // Events
    event YieldDeposited(uint256 indexed positionId, address protocol, address token, uint256 amount);
    event YieldWithdrawn(uint256 indexed positionId, address protocol, uint256 principal, uint256 yield);
    event YieldHarvested(uint256 indexed positionId, uint256 yieldAmount);
    event ProtocolWhitelisted(address indexed protocol, RiskLevel riskLevel);
    event ProtocolRemoved(address indexed protocol);
    event RiskLevelUpdated(RiskLevel newLevel);
    event AutoRebalanced(uint256 totalValue, uint256 timestamp);
    
    constructor(
        address _treasuryVault,
        address _usdcAddress,
        address _eurcAddress
    ) Ownable(msg.sender) {
        require(_treasuryVault != address(0), "Invalid treasury");
        require(_usdcAddress != address(0), "Invalid USDC");
        require(_eurcAddress != address(0), "Invalid EURC");
        
        treasuryVault = _treasuryVault;
        usdcAddress = _usdcAddress;
        eurcAddress = _eurcAddress;
    }
    
    /// @notice Deposit funds into yield-generating protocol
    /// @param protocol Address of the yield protocol
    /// @param token Token to deposit (USDC or EURC)
    /// @param amount Amount to deposit
    /// @param positionType Type of yield position
    function depositToYield(
        address protocol,
        address token,
        uint256 amount,
        PositionType positionType
    ) external onlyOwner nonReentrant returns (uint256 positionId) {
        require(whitelistedProtocols[protocol], "Protocol not whitelisted");
        require(token == usdcAddress || token == eurcAddress, "Unsupported token");
        require(amount >= minDepositAmount, "Amount below minimum");
        
        // Check position size limits
        uint256 totalValue = getTotalValue();
        require(
            amount <= (totalValue * maxSinglePositionPercent) / 100,
            "Position too large"
        );
        
        // Transfer tokens from treasury
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        // Deposit to protocol based on type
        if (positionType == PositionType.Lending) {
            _depositToLending(protocol, token, amount);
        } else if (positionType == PositionType.LiquidityPool) {
            _depositToLiquidityPool(protocol, token, amount);
        }
        
        // Create position record
        positionId = positionCount++;
        positions[positionId] = YieldPosition({
            protocol: protocol,
            token: token,
            principal: amount,
            yieldEarned: 0,
            depositTime: block.timestamp,
            lastHarvestTime: block.timestamp,
            positionType: positionType,
            active: true
        });
        
        totalDeposited += amount;
        
        emit YieldDeposited(positionId, protocol, token, amount);
        return positionId;
    }
    
    /// @notice Withdraw funds from yield position
    /// @param positionId ID of the position to withdraw
    function withdrawFromYield(uint256 positionId) external onlyOwner nonReentrant returns (uint256 totalAmount) {
        YieldPosition storage position = positions[positionId];
        require(position.active, "Position not active");
        
        // Harvest any pending yield first
        _harvestYield(positionId);
        
        // Withdraw from protocol
        uint256 withdrawnAmount;
        if (position.positionType == PositionType.Lending) {
            withdrawnAmount = _withdrawFromLending(position.protocol, position.token, position.principal);
        } else if (position.positionType == PositionType.LiquidityPool) {
            withdrawnAmount = _withdrawFromLiquidityPool(position.protocol, position.token, position.principal);
        }
        
        // Calculate total (principal + yield)
        totalAmount = position.principal + position.yieldEarned;
        
        // Transfer back to treasury
        IERC20(position.token).transfer(treasuryVault, totalAmount);
        
        // Update statistics
        totalWithdrawn += totalAmount;
        position.active = false;
        
        emit YieldWithdrawn(positionId, position.protocol, position.principal, position.yieldEarned);
        return totalAmount;
    }
    
    /// @notice Harvest yield from a position without withdrawing principal
    /// @param positionId ID of the position
    function harvestYield(uint256 positionId) external onlyOwner nonReentrant returns (uint256 yieldAmount) {
        return _harvestYield(positionId);
    }
    
    function _harvestYield(uint256 positionId) internal returns (uint256 yieldAmount) {
        YieldPosition storage position = positions[positionId];
        require(position.active, "Position not active");
        
        // Calculate yield earned since last harvest
        yieldAmount = _calculateYieldEarned(positionId);
        
        if (yieldAmount > 0) {
            position.yieldEarned += yieldAmount;
            position.lastHarvestTime = block.timestamp;
            totalYieldEarned += yieldAmount;
            
            emit YieldHarvested(positionId, yieldAmount);
        }
        
        return yieldAmount;
    }
    
    /// @notice Harvest all active positions
    function harvestAll() external onlyOwner returns (uint256 totalHarvested) {
        for (uint256 i = 0; i < positionCount; i++) {
            if (positions[i].active) {
                totalHarvested += _harvestYield(i);
            }
        }
        return totalHarvested;
    }
    
    /// @notice Auto-rebalance positions based on risk level and performance
    function autoRebalance() external onlyOwner nonReentrant {
        require(block.timestamp >= lastRebalanceTime + 1 days, "Too soon to rebalance");
        
        uint256 totalValue = getTotalValue();
        
        // Harvest all positions first
        for (uint256 i = 0; i < positionCount; i++) {
            if (positions[i].active) {
                _harvestYield(i);
            }
        }
        
        // Rebalance logic based on risk level
        // This is simplified - production would have more sophisticated logic
        if (currentRiskLevel == RiskLevel.Low) {
            // Ensure no position exceeds 20% of total
            _enforcePositionLimits(20);
        } else if (currentRiskLevel == RiskLevel.Medium) {
            _enforcePositionLimits(30);
        } else {
            _enforcePositionLimits(40);
        }
        
        lastRebalanceTime = block.timestamp;
        emit AutoRebalanced(totalValue, block.timestamp);
    }
    
    function _enforcePositionLimits(uint256 maxPercent) internal {
        uint256 totalValue = getTotalValue();
        uint256 maxPositionSize = (totalValue * maxPercent) / 100;
        
        for (uint256 i = 0; i < positionCount; i++) {
            if (positions[i].active && positions[i].principal > maxPositionSize) {
                // Position too large, would need to withdraw excess
                // Simplified for this implementation
            }
        }
    }
    
    /// @notice Calculate yield earned for a position
    function _calculateYieldEarned(uint256 positionId) internal view returns (uint256) {
        YieldPosition memory position = positions[positionId];
        
        if (!position.active) return 0;
        
        // Time since last harvest
        uint256 timeElapsed = block.timestamp - position.lastHarvestTime;
        
        // Simplified yield calculation (5% APY)
        // Production would query actual protocol rates
        uint256 annualYield = (position.principal * targetYieldAPY) / 10000;
        uint256 yieldEarned = (annualYield * timeElapsed) / 365 days;
        
        return yieldEarned;
    }
    
    /// @notice Get total value across all positions
    function getTotalValue() public view returns (uint256 total) {
        for (uint256 i = 0; i < positionCount; i++) {
            if (positions[i].active) {
                total += positions[i].principal + _calculateYieldEarned(i);
            }
        }
        return total;
    }
    
    /// @notice Get current APY across all positions
    function getCurrentAPY() external view returns (uint256 apy) {
        if (totalDeposited == 0) return 0;
        
        uint256 totalValue = getTotalValue();
        uint256 totalGain = totalValue > totalDeposited ? totalValue - totalDeposited : 0;
        
        // Annualized return
        uint256 avgTimeDeposited = _getAverageTimeDeposited();
        if (avgTimeDeposited == 0) return 0;
        
        apy = (totalGain * 365 days * 10000) / (totalDeposited * avgTimeDeposited);
        return apy;
    }
    
    function _getAverageTimeDeposited() internal view returns (uint256) {
        uint256 totalTime;
        uint256 activePositions;
        
        for (uint256 i = 0; i < positionCount; i++) {
            if (positions[i].active) {
                totalTime += block.timestamp - positions[i].depositTime;
                activePositions++;
            }
        }
        
        return activePositions > 0 ? totalTime / activePositions : 0;
    }
    
    /// @notice Get position details
    function getPosition(uint256 positionId) external view returns (
        address protocol,
        address token,
        uint256 principal,
        uint256 yieldEarned,
        uint256 currentValue,
        uint256 apy,
        bool active
    ) {
        YieldPosition memory pos = positions[positionId];
        uint256 pendingYield = _calculateYieldEarned(positionId);
        
        return (
            pos.protocol,
            pos.token,
            pos.principal,
            pos.yieldEarned + pendingYield,
            pos.principal + pos.yieldEarned + pendingYield,
            _calculatePositionAPY(positionId),
            pos.active
        );
    }
    
    function _calculatePositionAPY(uint256 positionId) internal view returns (uint256) {
        YieldPosition memory pos = positions[positionId];
        if (!pos.active || pos.principal == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - pos.depositTime;
        if (timeElapsed == 0) return 0;
        
        uint256 totalYield = pos.yieldEarned + _calculateYieldEarned(positionId);
        return (totalYield * 365 days * 10000) / (pos.principal * timeElapsed);
    }
    
    /// @notice Whitelist a yield protocol
    function whitelistProtocol(address protocol, RiskLevel riskLevel) external onlyOwner {
        require(protocol != address(0), "Invalid protocol");
        whitelistedProtocols[protocol] = true;
        protocolRiskLevel[protocol] = riskLevel;
        emit ProtocolWhitelisted(protocol, riskLevel);
    }
    
    /// @notice Remove protocol from whitelist
    function removeProtocol(address protocol) external onlyOwner {
        whitelistedProtocols[protocol] = false;
        emit ProtocolRemoved(protocol);
    }
    
    /// @notice Update risk level
    function setRiskLevel(RiskLevel newLevel) external onlyOwner {
        currentRiskLevel = newLevel;
        emit RiskLevelUpdated(newLevel);
    }
    
    /// @notice Update strategy parameters
    function setStrategyParams(
        uint256 _minDeposit,
        uint256 _maxPositionPercent,
        uint256 _targetAPY
    ) external onlyOwner {
        require(_maxPositionPercent <= 100, "Invalid percentage");
        minDepositAmount = _minDeposit;
        maxSinglePositionPercent = _maxPositionPercent;
        targetYieldAPY = _targetAPY;
    }
    
    // Internal protocol interaction functions
    function _depositToLending(address protocol, address token, uint256 amount) internal {
        IERC20(token).approve(protocol, amount);
        ILendingPool(protocol).deposit(token, amount, address(this), 0);
    }
    
    function _withdrawFromLending(address protocol, address token, uint256 amount) internal returns (uint256) {
        return ILendingPool(protocol).withdraw(token, amount, address(this));
    }
    
    function _depositToLiquidityPool(address protocol, address token, uint256 amount) internal {
        // Simplified - would need to handle token pairs
        IERC20(token).approve(protocol, amount);
    }
    
    function _withdrawFromLiquidityPool(address protocol, address token, uint256 amount) internal returns (uint256) {
        // Simplified - would need to handle LP tokens
        return amount;
    }
    
    /// @notice Emergency withdraw all positions
    function emergencyWithdrawAll() external onlyOwner {
        for (uint256 i = 0; i < positionCount; i++) {
            if (positions[i].active) {
                this.withdrawFromYield(i);
            }
        }
    }
}