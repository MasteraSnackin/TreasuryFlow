import { ethers } from 'ethers'

// Contract ABIs (simplified for essential functions)
export const TREASURY_VAULT_ABI = [
  "function schedulePayment(address recipient, address token, uint256 amount, uint256 frequency, string description) returns (uint256)",
  "function executePayment(uint256 paymentId)",
  "function batchExecutePayments(uint256[] paymentIds) returns (uint256)",
  "function approvePayment(uint256 paymentId)",
  "function revokeApproval(uint256 paymentId)",
  "function cancelPayment(uint256 paymentId)",
  "function addSupplier(address wallet, string name, string preferredCurrency)",
  "function addApprover(address approver)",
  "function removeApprover(address approver)",
  "function updateRequiredApprovals(uint256 required)",
  "function getBalance(address token) view returns (uint256)",
  "function getPayment(uint256 paymentId) view returns (address recipient, address token, uint256 amount, uint256 nextExecutionTime, uint256 frequency, bool active, bool requiresApproval, bool approved, string description)",
  "function getApprovalStatus(uint256 paymentId) view returns (uint256 approvalCount, uint256 approvalDeadline, address[] approvers)",
  "function hasApproved(uint256 paymentId, address approver) view returns (bool)",
  "function getSupplier(address wallet) view returns (string name, string preferredCurrency, uint256 totalPaid, uint256 paymentCount, bool active)",
  "function paymentCount() view returns (uint256)",
  "function approvalThreshold() view returns (uint256)",
  "function requiredApprovals() view returns (uint256)",
  "function approvalTimelock() view returns (uint256)",
  "function approvers(address) view returns (bool)",
  "function owner() view returns (address)",
  "event PaymentScheduled(uint256 indexed paymentId, address recipient, uint256 amount, string description)",
  "event PaymentExecuted(uint256 indexed paymentId, address recipient, uint256 amount, uint256 gasUsed)",
  "event BatchPaymentExecuted(uint256[] paymentIds, uint256 totalAmount)",
  "event PaymentApproved(uint256 indexed paymentId, address indexed approver, uint256 approvalCount, uint256 requiredApprovals)",
  "event ApprovalRevoked(uint256 indexed paymentId, address indexed approver)",
  "event ApproverAdded(address indexed approver)",
  "event ApproverRemoved(address indexed approver)"
]

export const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
]

export const AUTO_SWAP_ABI = [
  "function swapUSDCtoEURC(uint256 amountIn) returns (uint256)",
  "function swapEURCtoUSDC(uint256 amountIn) returns (uint256)",
  "function getQuoteUSDCtoEURC(uint256 amountIn) view returns (uint256 amountOut, uint256 fee)",
  "function getQuoteEURCtoUSDC(uint256 amountIn) view returns (uint256 amountOut, uint256 fee)",
  "function exchangeRate() view returns (uint256)",
  "function feePercent() view returns (uint256)"
]

// Contract addresses from environment
export const CONTRACTS = {
  TREASURY_VAULT: process.env.NEXT_PUBLIC_TREASURY_VAULT_ADDRESS || '',
  AUTO_SWAP: process.env.NEXT_PUBLIC_AUTO_SWAP_ADDRESS || '',
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '',
  EURC: process.env.NEXT_PUBLIC_EURC_ADDRESS || '',
}

// Arc Network configuration
export const ARC_TESTNET = {
  chainId: '0xa4ba', // 42170 in hex
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_ARC_TESTNET_RPC_URL || 'https://rpc-testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.com'],
}

// Get provider
export function getProvider() {
  if (typeof window === 'undefined') return null
  
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  
  // Fallback to RPC provider
  return new ethers.JsonRpcProvider(ARC_TESTNET.rpcUrls[0])
}

// Get signer
export async function getSigner() {
  const provider = getProvider()
  if (!provider) throw new Error('No provider available')
  
  if (window.ethereum) {
    return await provider.getSigner()
  }
  
  throw new Error('No wallet connected')
}

// Get contract instances
export function getVaultContract(withSigner = false) {
  if (withSigner) {
    // For write operations, return a promise
    return getSigner().then(signer =>
      new ethers.Contract(CONTRACTS.TREASURY_VAULT, TREASURY_VAULT_ABI, signer)
    )
  }
  
  const provider = getProvider()
  if (!provider) throw new Error('No provider available')
  return new ethers.Contract(CONTRACTS.TREASURY_VAULT, TREASURY_VAULT_ABI, provider)
}

export async function getTokenContract(tokenAddress: string, withSigner = false) {
  if (withSigner) {
    const signer = await getSigner()
    return new ethers.Contract(tokenAddress, ERC20_ABI, signer)
  }
  
  const provider = getProvider()
  if (!provider) throw new Error('No provider available')
  return new ethers.Contract(tokenAddress, ERC20_ABI, provider)
}

export async function getAutoSwapContract(withSigner = false) {
  if (withSigner) {
    const signer = await getSigner()
    return new ethers.Contract(CONTRACTS.AUTO_SWAP, AUTO_SWAP_ABI, signer)
  }
  
  const provider = getProvider()
  if (!provider) throw new Error('No provider available')
  return new ethers.Contract(CONTRACTS.AUTO_SWAP, AUTO_SWAP_ABI, provider)
}

// Helper to switch to Arc Testnet
export async function switchToArcTestnet() {
  if (!window.ethereum) throw new Error('No wallet found')
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_TESTNET.chainId }],
    })
  } catch (error: any) {
    // Chain not added, add it
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ARC_TESTNET],
      })
    } else {
      throw error
    }
  }
}

// Format currency
export function formatCurrency(amount: string | bigint, decimals = 6): string {
  return ethers.formatUnits(amount, decimals)
}

export function parseCurrency(amount: string, decimals = 6): bigint {
  return ethers.parseUnits(amount, decimals)
}

// Declare window.ethereum type
declare global {
  interface Window {
    ethereum?: any
  }
}