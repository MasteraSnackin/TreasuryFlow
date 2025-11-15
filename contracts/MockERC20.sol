// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockERC20 - Test token for development
/// @notice Mintable ERC20 token for testing USDC/EURC functionality
contract MockERC20 is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_;
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /// @notice Mint tokens to any address (for testing)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /// @notice Burn tokens from any address (for testing)
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
    
    /// @notice Faucet function - anyone can mint small amounts for testing
    function faucet(uint256 amount) external {
        require(amount <= 10000 * 10**_decimals, "Max 10k per request");
        _mint(msg.sender, amount);
    }
}