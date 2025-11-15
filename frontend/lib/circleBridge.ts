/**
 * Circle Bridge Kit Integration
 * Enables cross-chain USDC transfers using Circle's CCTP
 */

import { ethers } from 'ethers'

// Circle Bridge SDK types (will be installed)
interface BridgeConfig {
  appId: string
  sourceChain: string
  destinationChain: string
}

interface BridgeTransfer {
  amount: string
  sourceChain: string
  destinationChain: string
  recipient: string
  token: 'USDC'
}

interface BridgeStatus {
  status: 'pending' | 'attested' | 'completed' | 'failed'
  txHash?: string
  attestation?: string
  estimatedTime: number
}

// Supported chains for CCTP
export const SUPPORTED_CHAINS = {
  arc: {
    name: 'Arc Network',
    chainId: 42161,
    domain: 3,
    rpcUrl: 'https://rpc.arc.network',
    explorerUrl: 'https://arcscan.com',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
  },
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    domain: 0,
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    domain: 7,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    usdcAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
  },
  avalanche: {
    name: 'Avalanche',
    chainId: 43114,
    domain: 1,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    usdcAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
  },
  optimism: {
    name: 'Optimism',
    chainId: 10,
    domain: 2,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    usdcAddress: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607'
  },
  arbitrum: {
    name: 'Arbitrum',
    chainId: 42161,
    domain: 3,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
  },
  base: {
    name: 'Base',
    chainId: 8453,
    domain: 6,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  }
}

export class CircleBridge {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private cctpBridgeAddress: string

  constructor(cctpBridgeAddress: string) {
    this.cctpBridgeAddress = cctpBridgeAddress
  }

  /**
   * Initialize bridge with wallet provider
   */
  async initialize() {
    if (!window.ethereum) {
      throw new Error('No wallet provider found')
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await this.provider.getSigner()
  }

  /**
   * Get current chain info
   */
  async getCurrentChain() {
    if (!this.provider) await this.initialize()
    
    const network = await this.provider!.getNetwork()
    const chainId = Number(network.chainId)
    
    return Object.entries(SUPPORTED_CHAINS).find(
      ([_, chain]) => chain.chainId === chainId
    )?.[1]
  }

  /**
   * Switch to a specific chain
   */
  async switchChain(chainKey: keyof typeof SUPPORTED_CHAINS) {
    const chain = SUPPORTED_CHAINS[chainKey]
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chain.chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chain.chainId.toString(16)}`,
            chainName: chain.name,
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.explorerUrl],
          }],
        })
      } else {
        throw error
      }
    }
  }

  /**
   * Get USDC balance on current chain
   */
  async getUSDCBalance(address: string): Promise<string> {
    if (!this.provider) await this.initialize()
    
    const currentChain = await this.getCurrentChain()
    if (!currentChain) throw new Error('Unsupported chain')

    const usdcContract = new ethers.Contract(
      currentChain.usdcAddress,
      ['function balanceOf(address) view returns (uint256)'],
      this.provider!
    )

    const balance = await usdcContract.balanceOf(address)
    return ethers.formatUnits(balance, 6)
  }

  /**
   * Estimate bridge fees
   */
  async estimateFees(
    sourceChain: keyof typeof SUPPORTED_CHAINS,
    destinationChain: keyof typeof SUPPORTED_CHAINS,
    amount: string
  ): Promise<{
    sourceFee: string
    destinationFee: string
    bridgeFee: string
    total: string
    estimatedTime: string
  }> {
    // Simplified fee calculation
    // Production would query actual fees from Circle API
    const amountNum = parseFloat(amount)
    const bridgeFee = (amountNum * 0.001).toFixed(2) // 0.1% bridge fee
    const sourceFee = '0.50' // Estimated gas on source
    const destinationFee = '0.30' // Estimated gas on destination
    const total = (parseFloat(bridgeFee) + parseFloat(sourceFee) + parseFloat(destinationFee)).toFixed(2)

    return {
      sourceFee,
      destinationFee,
      bridgeFee,
      total,
      estimatedTime: '5-10 minutes'
    }
  }

  /**
   * Initiate cross-chain transfer
   */
  async bridgeUSDC(transfer: BridgeTransfer): Promise<{
    txHash: string
    nonce: string
  }> {
    if (!this.signer) await this.initialize()

    const sourceChain = SUPPORTED_CHAINS[transfer.sourceChain as keyof typeof SUPPORTED_CHAINS]
    const destChain = SUPPORTED_CHAINS[transfer.destinationChain as keyof typeof SUPPORTED_CHAINS]

    if (!sourceChain || !destChain) {
      throw new Error('Unsupported chain')
    }

    // Approve USDC spending
    const usdcContract = new ethers.Contract(
      sourceChain.usdcAddress,
      [
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)'
      ],
      this.signer!
    )

    const amount = ethers.parseUnits(transfer.amount, 6)
    const currentAllowance = await usdcContract.allowance(
      await this.signer!.getAddress(),
      this.cctpBridgeAddress
    )

    if (currentAllowance < amount) {
      const approveTx = await usdcContract.approve(this.cctpBridgeAddress, amount)
      await approveTx.wait()
    }

    // Call bridge contract
    const bridgeContract = new ethers.Contract(
      this.cctpBridgeAddress,
      [
        'function bridgeUSDC(uint256 amount, uint32 destinationDomain, address recipient) returns (uint64)'
      ],
      this.signer!
    )

    const tx = await bridgeContract.bridgeUSDC(
      amount,
      destChain.domain,
      transfer.recipient
    )

    const receipt = await tx.wait()
    
    // Extract nonce from events
    const event = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id('BridgeInitiated(uint64,address,address,uint256,uint32,uint32,bytes32)')
    )
    
    const nonce = event ? ethers.toNumber(event.topics[1]) : '0'

    return {
      txHash: receipt.hash,
      nonce: nonce.toString()
    }
  }

  /**
   * Check bridge transfer status
   */
  async getTransferStatus(nonce: string): Promise<BridgeStatus> {
    if (!this.provider) await this.initialize()

    const bridgeContract = new ethers.Contract(
      this.cctpBridgeAddress,
      [
        'function getTransfer(uint64 nonce) view returns (address,address,uint256,uint32,uint32,uint256,uint8)'
      ],
      this.provider!
    )

    try {
      const transfer = await bridgeContract.getTransfer(nonce)
      const status = transfer[6] // status enum

      const statusMap: { [key: number]: BridgeStatus['status'] } = {
        0: 'pending',
        1: 'attested',
        2: 'completed',
        3: 'failed'
      }

      return {
        status: statusMap[status] || 'pending',
        estimatedTime: status === 0 ? 600 : 0 // 10 minutes if pending
      }
    } catch (error) {
      console.error('Error fetching transfer status:', error)
      return {
        status: 'pending',
        estimatedTime: 600
      }
    }
  }

  /**
   * Get transfer history for an address
   */
  async getTransferHistory(address: string): Promise<Array<{
    nonce: string
    amount: string
    sourceChain: string
    destinationChain: string
    timestamp: number
    status: string
  }>> {
    if (!this.provider) await this.initialize()

    const bridgeContract = new ethers.Contract(
      this.cctpBridgeAddress,
      [
        'function getUserTransfers(address user) view returns (uint64[])',
        'function getTransfer(uint64 nonce) view returns (address,address,uint256,uint32,uint32,uint256,uint8)'
      ],
      this.provider!
    )

    try {
      const nonces = await bridgeContract.getUserTransfers(address)
      
      const transfers = await Promise.all(
        nonces.map(async (nonce: bigint) => {
          const transfer = await bridgeContract.getTransfer(nonce)
          return {
            nonce: nonce.toString(),
            amount: ethers.formatUnits(transfer[2], 6),
            sourceChain: this.getDomainChainName(transfer[3]),
            destinationChain: this.getDomainChainName(transfer[4]),
            timestamp: Number(transfer[5]),
            status: ['pending', 'attested', 'completed', 'failed'][transfer[6]]
          }
        })
      )

      return transfers
    } catch (error) {
      console.error('Error fetching transfer history:', error)
      return []
    }
  }

  /**
   * Helper to get chain name from domain
   */
  private getDomainChainName(domain: number): string {
    const chain = Object.entries(SUPPORTED_CHAINS).find(
      ([_, c]) => c.domain === domain
    )
    return chain ? chain[1].name : 'Unknown'
  }

  /**
   * Get optimal route for transfer
   */
  async getOptimalRoute(
    sourceChain: keyof typeof SUPPORTED_CHAINS,
    destinationChain: keyof typeof SUPPORTED_CHAINS,
    amount: string
  ): Promise<{
    route: string[]
    estimatedTime: string
    totalFees: string
    savings: string
  }> {
    // For direct CCTP transfers, route is always direct
    const fees = await this.estimateFees(sourceChain, destinationChain, amount)
    
    return {
      route: [sourceChain, destinationChain],
      estimatedTime: fees.estimatedTime,
      totalFees: fees.total,
      savings: '0' // No alternative routes in CCTP
    }
  }
}

// Export singleton instance
let bridgeInstance: CircleBridge | null = null

export function getCircleBridge(cctpBridgeAddress: string): CircleBridge {
  if (!bridgeInstance) {
    bridgeInstance = new CircleBridge(cctpBridgeAddress)
  }
  return bridgeInstance
}

// React hook for bridge operations
export function useCircleBridge() {
  const [bridge, setBridge] = React.useState<CircleBridge | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const cctpAddress = process.env.NEXT_PUBLIC_CCTP_BRIDGE_ADDRESS || ''
    if (cctpAddress) {
      const bridgeInstance = getCircleBridge(cctpAddress)
      setBridge(bridgeInstance)
    }
  }, [])

  const initializeBridge = async () => {
    if (!bridge) return
    setLoading(true)
    setError(null)
    try {
      await bridge.initialize()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    bridge,
    loading,
    error,
    initializeBridge
  }
}

// Declare React for the hook
import React from 'react'