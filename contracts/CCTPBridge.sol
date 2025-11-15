// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Circle CCTP TokenMessenger interface
interface ITokenMessenger {
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external returns (uint64 nonce);

    function replaceDepositForBurn(
        bytes calldata originalMessage,
        bytes calldata originalAttestation,
        bytes32 newDestinationCaller,
        bytes32 newMintRecipient
    ) external;
}

// Circle CCTP MessageTransmitter interface
interface IMessageTransmitter {
    function receiveMessage(
        bytes calldata message,
        bytes calldata attestation
    ) external returns (bool success);
}

/// @title CCTPBridge - Cross-Chain Transfer Protocol Bridge
/// @notice Enables cross-chain USDC transfers using Circle's CCTP
/// @dev Integrates with Circle's TokenMessenger for burning and minting USDC across chains
contract CCTPBridge is Ownable, ReentrancyGuard {
    
    struct BridgeTransfer {
        address sender;
        address recipient;
        uint256 amount;
        uint32 sourceDomain;
        uint32 destinationDomain;
        uint64 nonce;
        uint256 timestamp;
        BridgeStatus status;
        bytes32 messageHash;
    }
    
    enum BridgeStatus {
        Pending,
        Attested,
        Completed,
        Failed,
        Replaced
    }
    
    // State variables
    ITokenMessenger public tokenMessenger;
    IMessageTransmitter public messageTransmitter;
    address public usdcAddress;
    
    // Domain mappings (Chain ID => CCTP Domain)
    mapping(uint256 => uint32) public chainIdToDomain;
    mapping(uint32 => uint256) public domainToChainId;
    mapping(uint32 => bool) public supportedDomains;
    
    // Transfer tracking
    mapping(uint64 => BridgeTransfer) public transfers;
    mapping(address => uint64[]) public userTransfers;
    uint64 public transferCount;
    
    // Statistics
    uint256 public totalVolume;
    uint256 public totalTransfers;
    mapping(uint32 => uint256) public domainVolume;
    
    // Events
    event BridgeInitiated(
        uint64 indexed nonce,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint32 sourceDomain,
        uint32 destinationDomain,
        bytes32 messageHash
    );
    
    event BridgeCompleted(
        uint64 indexed nonce,
        address indexed recipient,
        uint256 amount
    );
    
    event BridgeFailed(
        uint64 indexed nonce,
        string reason
    );
    
    event DomainAdded(uint32 indexed domain, uint256 chainId);
    event DomainRemoved(uint32 indexed domain);
    
    constructor(
        address _tokenMessenger,
        address _messageTransmitter,
        address _usdcAddress
    ) Ownable(msg.sender) {
        require(_tokenMessenger != address(0), "Invalid TokenMessenger");
        require(_messageTransmitter != address(0), "Invalid MessageTransmitter");
        require(_usdcAddress != address(0), "Invalid USDC");
        
        tokenMessenger = ITokenMessenger(_tokenMessenger);
        messageTransmitter = IMessageTransmitter(_messageTransmitter);
        usdcAddress = _usdcAddress;
        
        // Initialize supported domains
        // Arc Network
        _addDomain(42161, 3); // Arc Mainnet
        _addDomain(42170, 3); // Arc Testnet
        
        // Ethereum
        _addDomain(1, 0); // Ethereum Mainnet
        _addDomain(11155111, 0); // Sepolia Testnet
        
        // Other chains
        _addDomain(137, 7); // Polygon
        _addDomain(43114, 1); // Avalanche
        _addDomain(10, 2); // Optimism
        _addDomain(42161, 3); // Arbitrum
        _addDomain(8453, 6); // Base
    }
    
    /// @notice Bridge USDC to another chain
    /// @param amount Amount of USDC to bridge
    /// @param destinationDomain CCTP domain of destination chain
    /// @param recipient Address to receive USDC on destination chain
    /// @return nonce Unique identifier for this bridge transfer
    function bridgeUSDC(
        uint256 amount,
        uint32 destinationDomain,
        address recipient
    ) external nonReentrant returns (uint64 nonce) {
        require(amount > 0, "Amount must be positive");
        require(recipient != address(0), "Invalid recipient");
        require(supportedDomains[destinationDomain], "Unsupported destination");
        
        // Get source domain
        uint32 sourceDomain = chainIdToDomain[block.chainid];
        require(sourceDomain != destinationDomain, "Cannot bridge to same chain");
        
        // Transfer USDC from user to this contract
        IERC20 usdc = IERC20(usdcAddress);
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Approve TokenMessenger to burn USDC
        require(
            usdc.approve(address(tokenMessenger), amount),
            "Approval failed"
        );
        
        // Convert recipient address to bytes32
        bytes32 mintRecipient = bytes32(uint256(uint160(recipient)));
        
        // Initiate burn on source chain
        nonce = tokenMessenger.depositForBurn(
            amount,
            destinationDomain,
            mintRecipient,
            usdcAddress
        );
        
        // Create transfer record
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                nonce,
                sourceDomain,
                destinationDomain,
                msg.sender,
                recipient,
                amount
            )
        );
        
        transfers[nonce] = BridgeTransfer({
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            sourceDomain: sourceDomain,
            destinationDomain: destinationDomain,
            nonce: nonce,
            timestamp: block.timestamp,
            status: BridgeStatus.Pending,
            messageHash: messageHash
        });
        
        userTransfers[msg.sender].push(nonce);
        
        // Update statistics
        totalVolume += amount;
        totalTransfers++;
        domainVolume[destinationDomain] += amount;
        
        emit BridgeInitiated(
            nonce,
            msg.sender,
            recipient,
            amount,
            sourceDomain,
            destinationDomain,
            messageHash
        );
        
        return nonce;
    }
    
    /// @notice Complete bridge transfer on destination chain
    /// @param message CCTP message from source chain
    /// @param attestation Circle attestation signature
    function completeBridge(
        bytes calldata message,
        bytes calldata attestation
    ) external nonReentrant returns (bool) {
        // Receive and validate message
        bool success = messageTransmitter.receiveMessage(message, attestation);
        
        if (success) {
            // Parse message to get nonce
            // Note: Actual message parsing would be more complex
            uint64 nonce = uint64(bytes8(message[0:8]));
            
            if (transfers[nonce].status == BridgeStatus.Pending) {
                transfers[nonce].status = BridgeStatus.Completed;
                
                emit BridgeCompleted(
                    nonce,
                    transfers[nonce].recipient,
                    transfers[nonce].amount
                );
            }
        }
        
        return success;
    }
    
    /// @notice Get transfer details
    function getTransfer(uint64 nonce) external view returns (
        address sender,
        address recipient,
        uint256 amount,
        uint32 sourceDomain,
        uint32 destinationDomain,
        uint256 timestamp,
        BridgeStatus status
    ) {
        BridgeTransfer memory t = transfers[nonce];
        return (
            t.sender,
            t.recipient,
            t.amount,
            t.sourceDomain,
            t.destinationDomain,
            t.timestamp,
            t.status
        );
    }
    
    /// @notice Get all transfers for a user
    function getUserTransfers(address user) external view returns (uint64[] memory) {
        return userTransfers[user];
    }
    
    /// @notice Get bridge statistics
    function getStatistics() external view returns (
        uint256 volume,
        uint256 transfers,
        uint256 avgTransferSize
    ) {
        return (
            totalVolume,
            totalTransfers,
            totalTransfers > 0 ? totalVolume / totalTransfers : 0
        );
    }
    
    /// @notice Add supported domain
    function addDomain(uint256 chainId, uint32 domain) external onlyOwner {
        _addDomain(chainId, domain);
    }
    
    function _addDomain(uint256 chainId, uint32 domain) internal {
        chainIdToDomain[chainId] = domain;
        domainToChainId[domain] = chainId;
        supportedDomains[domain] = true;
        emit DomainAdded(domain, chainId);
    }
    
    /// @notice Remove supported domain
    function removeDomain(uint32 domain) external onlyOwner {
        supportedDomains[domain] = false;
        emit DomainRemoved(domain);
    }
    
    /// @notice Update TokenMessenger address
    function setTokenMessenger(address _tokenMessenger) external onlyOwner {
        require(_tokenMessenger != address(0), "Invalid address");
        tokenMessenger = ITokenMessenger(_tokenMessenger);
    }
    
    /// @notice Update MessageTransmitter address
    function setMessageTransmitter(address _messageTransmitter) external onlyOwner {
        require(_messageTransmitter != address(0), "Invalid address");
        messageTransmitter = IMessageTransmitter(_messageTransmitter);
    }
    
    /// @notice Emergency withdraw (owner only)
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Withdraw failed");
    }
}