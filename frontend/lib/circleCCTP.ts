/**
 * Circle CCTP (Cross-Chain Transfer Protocol) Integration
 * Production-ready implementation using official Circle contracts
 */

import { ethers } from 'ethers'

// Official Circle CCTP Contract Addresses (Mainnet)
export const CIRCLE_CCTP_CONTRACTS = {
  ethereum: {
    tokenMessenger: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
    messageTransmitter: '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  avalanche: {
    tokenMessenger: '0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982',
    messageTransmitter: '0x8186359aF5F57FbB40c6b14A588d2A59C0C29880',
    usdc: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
  },
  arbitrum: {
    tokenMessenger: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
    messageTransmitter: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
  },
  base: {
    tokenMessenger: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
    messageTransmitter: '0xAD09780d193884d503182aD4588450C416D6F9D4',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  polygon: {
    tokenMessenger: '0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE',
    messageTransmitter: '0xF3be9355363857F3e001be68856A2f96b4C39Ba9',
    usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
  }
}

// Circle CCTP Contract ABIs
const TOKEN_MESSENGER_ABI = [
  'function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken) external returns (uint64)',
  'function depositForBurnWithCaller(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller) external returns (uint64)',
  'function localMinter() external view returns (address)',
  'function remoteTokenMessengers(uint32 domain) external view returns (bytes32)'
]

const MESSAGE_TRANSMITTER_ABI = [
  'function receiveMessage(bytes calldata message, bytes calldata attestation) external returns (bool)',
  'function usedNonces(bytes32 hashOfMessage) external view returns (uint256)',
  'function attesterManager() external view returns (address)',
  'function maxMessageBodySize() external view returns (uint256)'
]

// Domain IDs for different chains
export const DOMAIN_IDS = {
  ethereum: 0,
  avalanche: 1,
  arbitrum: 3,
  base: 6,
  polygon: 7
}

export interface CCTPTransferParams {
  amount: string // Amount in USDC (with decimals)
  destinationChain: keyof typeof DOMAIN_IDS
  recipientAddress: string
  sourceChain: keyof typeof DOMAIN_IDS
}

export interface CCTPTransferResult {
  txHash: string
  messageHash: string
  attestation?: string
  status: 'pending' | 'attested' | 'completed' | 'failed'
}

/**
 * Initiate a CCTP transfer (burn USDC on source chain)
 */
export async function initiateCCTPTransfer(
  params: CCTPTransferParams,
  signer: ethers.Signer
): Promise<CCTPTransferResult> {
  const { amount, destinationChain, recipientAddress, sourceChain } = params

  // Get contract addresses for source chain
  const sourceContracts = CIRCLE_CCTP_CONTRACTS[sourceChain]
  if (!sourceContracts) {
    throw new Error(`Unsupported source chain: ${sourceChain}`)
  }

  // Create contract instances
  const tokenMessenger = new ethers.Contract(
    sourceContracts.tokenMessenger,
    TOKEN_MESSENGER_ABI,
    signer
  )

  const usdcContract = new ethers.Contract(
    sourceContracts.usdc,
    ['function approve(address spender, uint256 amount) external returns (bool)'],
    signer
  )

  // Convert amount to proper decimals (USDC has 6 decimals)
  const amountInWei = ethers.parseUnits(amount, 6)

  // Convert recipient address to bytes32
  const recipientBytes32 = ethers.zeroPadValue(recipientAddress, 32)

  // Get destination domain ID
  const destinationDomain = DOMAIN_IDS[destinationChain]

  try {
    // Step 1: Approve USDC spending
    console.log('Approving USDC spending...')
    const approveTx = await usdcContract.approve(
      sourceContracts.tokenMessenger,
      amountInWei
    )
    await approveTx.wait()
    console.log('✅ USDC approved')

    // Step 2: Burn USDC and emit message
    console.log('Burning USDC on source chain...')
    const burnTx = await tokenMessenger.depositForBurn(
      amountInWei,
      destinationDomain,
      recipientBytes32,
      sourceContracts.usdc
    )

    const receipt = await burnTx.wait()
    console.log('✅ USDC burned, transaction:', receipt.hash)

    // Extract message hash from logs
    const messageHash = extractMessageHash(receipt)

    return {
      txHash: receipt.hash,
      messageHash,
      status: 'pending'
    }
  } catch (error) {
    console.error('CCTP transfer failed:', error)
    throw error
  }
}

/**
 * Get attestation from Circle's attestation service
 */
export async function getAttestation(messageHash: string): Promise<string> {
  const attestationUrl = `https://iris-api.circle.com/attestations/${messageHash}`

  try {
    const response = await fetch(attestationUrl)
    
    if (!response.ok) {
      throw new Error(`Attestation not ready: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status !== 'complete') {
      throw new Error('Attestation not complete yet')
    }

    return data.attestation
  } catch (error) {
    console.error('Failed to get attestation:', error)
    throw error
  }
}

/**
 * Complete CCTP transfer (mint USDC on destination chain)
 */
export async function completeCCTPTransfer(
  messageHash: string,
  attestation: string,
  message: string,
  destinationChain: keyof typeof DOMAIN_IDS,
  signer: ethers.Signer
): Promise<string> {
  const destContracts = CIRCLE_CCTP_CONTRACTS[destinationChain]
  if (!destContracts) {
    throw new Error(`Unsupported destination chain: ${destinationChain}`)
  }

  const messageTransmitter = new ethers.Contract(
    destContracts.messageTransmitter,
    MESSAGE_TRANSMITTER_ABI,
    signer
  )

  try {
    console.log('Minting USDC on destination chain...')
    const mintTx = await messageTransmitter.receiveMessage(
      message,
      attestation
    )

    const receipt = await mintTx.wait()
    console.log('✅ USDC minted on destination, transaction:', receipt.hash)

    return receipt.hash
  } catch (error) {
    console.error('Failed to complete CCTP transfer:', error)
    throw error
  }
}

/**
 * Monitor CCTP transfer status
 */
export async function monitorCCTPTransfer(
  messageHash: string,
  onStatusChange?: (status: CCTPTransferResult['status']) => void
): Promise<CCTPTransferResult> {
  const maxAttempts = 60 // 5 minutes with 5-second intervals
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const attestation = await getAttestation(messageHash)
      
      onStatusChange?.('attested')
      
      return {
        txHash: '',
        messageHash,
        attestation,
        status: 'attested'
      }
    } catch (error) {
      attempts++
      
      if (attempts >= maxAttempts) {
        return {
          txHash: '',
          messageHash,
          status: 'failed'
        }
      }

      // Wait 5 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  throw new Error('Attestation timeout')
}

/**
 * Estimate CCTP transfer time
 */
export function estimateCCTPTime(
  sourceChain: keyof typeof DOMAIN_IDS,
  destinationChain: keyof typeof DOMAIN_IDS
): number {
  // Circle attestation typically takes 10-20 minutes
  return 15 * 60 * 1000 // 15 minutes in milliseconds
}

/**
 * Calculate CCTP transfer fees
 */
export function calculateCCTPFees(amount: string): {
  protocolFee: string
  gasFee: string
  total: string
} {
  // CCTP has no protocol fees, only gas fees
  const protocolFee = '0'
  
  // Estimate gas fees (varies by chain)
  const gasFee = '0.50' // ~$0.50 average
  
  return {
    protocolFee,
    gasFee,
    total: gasFee
  }
}

/**
 * Validate CCTP transfer parameters
 */
export function validateCCTPTransfer(params: CCTPTransferParams): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validate amount
  const amount = parseFloat(params.amount)
  if (isNaN(amount) || amount <= 0) {
    errors.push('Invalid amount')
  }

  // Validate minimum amount (CCTP requires minimum)
  if (amount < 1) {
    errors.push('Minimum transfer amount is 1 USDC')
  }

  // Validate chains
  if (!DOMAIN_IDS[params.sourceChain]) {
    errors.push(`Unsupported source chain: ${params.sourceChain}`)
  }

  if (!DOMAIN_IDS[params.destinationChain]) {
    errors.push(`Unsupported destination chain: ${params.destinationChain}`)
  }

  if (params.sourceChain === params.destinationChain) {
    errors.push('Source and destination chains must be different')
  }

  // Validate recipient address
  if (!ethers.isAddress(params.recipientAddress)) {
    errors.push('Invalid recipient address')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Extract message hash from transaction receipt
 */
function extractMessageHash(receipt: ethers.TransactionReceipt): string {
  // Find MessageSent event in logs
  const messageSentTopic = ethers.id('MessageSent(bytes)')
  
  for (const log of receipt.logs) {
    if (log.topics[0] === messageSentTopic) {
      // Decode the message bytes
      const messageBytes = ethers.AbiCoder.defaultAbiCoder().decode(
        ['bytes'],
        log.data
      )[0]
      
      // Hash the message
      return ethers.keccak256(messageBytes)
    }
  }

  throw new Error('MessageSent event not found in transaction')
}

/**
 * Get supported chains for CCTP
 */
export function getSupportedChains(): Array<{
  name: string
  chainId: number
  domain: number
}> {
  return [
    { name: 'Ethereum', chainId: 1, domain: DOMAIN_IDS.ethereum },
    { name: 'Avalanche', chainId: 43114, domain: DOMAIN_IDS.avalanche },
    { name: 'Arbitrum', chainId: 42161, domain: DOMAIN_IDS.arbitrum },
    { name: 'Base', chainId: 8453, domain: DOMAIN_IDS.base },
    { name: 'Polygon', chainId: 137, domain: DOMAIN_IDS.polygon }
  ]
}

/**
 * Check if CCTP is available for a chain pair
 */
export function isCCTPAvailable(
  sourceChain: string,
  destinationChain: string
): boolean {
  return (
    sourceChain in DOMAIN_IDS &&
    destinationChain in DOMAIN_IDS &&
    sourceChain !== destinationChain
  )
}