// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title AutoSwap - Automated Currency Exchange
/// @notice Handles USDC <-> EURC swaps with configurable rates
/// @dev Simplified DEX for treasury rebalancing
contract AutoSwap is Ownable, ReentrancyGuard {
    
    address public usdcAddress;
    address public eurcAddress;
    
    // Exchange rate: 1 USDC = exchangeRate EURC (scaled by 1e6)
    uint256 public exchangeRate = 920000; // 0.92 EURC per USDC
    uint256 public feePercent = 8; // 0.08% fee (scaled by 10000)
    
    uint256 public totalSwapVolume;
    uint256 public totalFeesCollected;
    
    event Swapped(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    event ExchangeRateUpdated(uint256 newRate);
    event FeeUpdated(uint256 newFee);
    
    constructor(address _usdcAddress, address _eurcAddress) Ownable(msg.sender) {
        require(_usdcAddress != address(0), "Invalid USDC");
        require(_eurcAddress != address(0), "Invalid EURC");
        usdcAddress = _usdcAddress;
        eurcAddress = _eurcAddress;
    }
    
    /// @notice Swap USDC for EURC
    function swapUSDCtoEURC(uint256 _amountIn) external nonReentrant returns (uint256 amountOut) {
        require(_amountIn > 0, "Amount must be positive");
        
        IERC20 usdc = IERC20(usdcAddress);
        IERC20 eurc = IERC20(eurcAddress);
        
        // Transfer USDC from user
        require(usdc.transferFrom(msg.sender, address(this), _amountIn), "Transfer failed");
        
        // Calculate output amount with fee
        uint256 fee = (_amountIn * feePercent) / 10000;
        uint256 amountAfterFee = _amountIn - fee;
        amountOut = (amountAfterFee * exchangeRate) / 1e6;
        
        // Check liquidity
        require(eurc.balanceOf(address(this)) >= amountOut, "Insufficient liquidity");
        
        // Transfer EURC to user
        require(eurc.transfer(msg.sender, amountOut), "Transfer failed");
        
        totalSwapVolume += _amountIn;
        totalFeesCollected += fee;
        
        emit Swapped(msg.sender, usdcAddress, eurcAddress, _amountIn, amountOut, fee);
    }
    
    /// @notice Swap EURC for USDC
    function swapEURCtoUSDC(uint256 _amountIn) external nonReentrant returns (uint256 amountOut) {
        require(_amountIn > 0, "Amount must be positive");
        
        IERC20 usdc = IERC20(usdcAddress);
        IERC20 eurc = IERC20(eurcAddress);
        
        // Transfer EURC from user
        require(eurc.transferFrom(msg.sender, address(this), _amountIn), "Transfer failed");
        
        // Calculate output amount with fee
        uint256 fee = (_amountIn * feePercent) / 10000;
        uint256 amountAfterFee = _amountIn - fee;
        amountOut = (amountAfterFee * 1e6) / exchangeRate;
        
        // Check liquidity
        require(usdc.balanceOf(address(this)) >= amountOut, "Insufficient liquidity");
        
        // Transfer USDC to user
        require(usdc.transfer(msg.sender, amountOut), "Transfer failed");
        
        totalSwapVolume += amountOut;
        totalFeesCollected += fee;
        
        emit Swapped(msg.sender, eurcAddress, usdcAddress, _amountIn, amountOut, fee);
    }
    
    /// @notice Get quote for USDC -> EURC swap
    function getQuoteUSDCtoEURC(uint256 _amountIn) external view returns (uint256 amountOut, uint256 fee) {
        fee = (_amountIn * feePercent) / 10000;
        uint256 amountAfterFee = _amountIn - fee;
        amountOut = (amountAfterFee * exchangeRate) / 1e6;
    }
    
    /// @notice Get quote for EURC -> USDC swap
    function getQuoteEURCtoUSDC(uint256 _amountIn) external view returns (uint256 amountOut, uint256 fee) {
        fee = (_amountIn * feePercent) / 10000;
        uint256 amountAfterFee = _amountIn - fee;
        amountOut = (amountAfterFee * 1e6) / exchangeRate;
    }
    
    /// @notice Update exchange rate (owner only)
    function setExchangeRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Rate must be positive");
        exchangeRate = _newRate;
        emit ExchangeRateUpdated(_newRate);
    }
    
    /// @notice Update fee percentage (owner only)
    function setFeePercent(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        feePercent = _newFee;
        emit FeeUpdated(_newFee);
    }
    
    /// @notice Add liquidity (owner only)
    function addLiquidity(address _token, uint256 _amount) external onlyOwner {
        require(_token == usdcAddress || _token == eurcAddress, "Invalid token");
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
    }
    
    /// @notice Remove liquidity (owner only)
    function removeLiquidity(address _token, uint256 _amount) external onlyOwner {
        require(_token == usdcAddress || _token == eurcAddress, "Invalid token");
        require(IERC20(_token).transfer(owner(), _amount), "Transfer failed");
    }
    
    /// @notice Get contract balances
    function getBalances() external view returns (uint256 usdcBalance, uint256 eurcBalance) {
        usdcBalance = IERC20(usdcAddress).balanceOf(address(this));
        eurcBalance = IERC20(eurcAddress).balanceOf(address(this));
    }
}