/**
 * Circle Wallets SDK Integration
 * Provides embedded wallet creation and management
 * 
 * Features:
 * - Programmable wallet creation
 * - Social recovery (email, phone, biometric)
 * - Multi-device support
 * - Transaction signing
 * - Wallet backup and recovery
 * - Biometric authentication
 */

import { ethers } from 'ethers'
import { useState, useEffect } from 'react'

// Wallet SDK configuration
const WALLET_CONFIG = {
  production: {
    apiUrl: 'https://api.circle.com/v1/w3s',
    appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || ''
  },
  sandbox: {
    apiUrl: 'https://api-sandbox.circle.com/v1/w3s',
    appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || ''
  }
}

const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
const CONFIG = WALLET_CONFIG[ENV]

// Wallet types
export enum WalletType {
  EOA = 'eoa', // Externally Owned Account
  SMART_CONTRACT = 'smart_contract' // Smart Contract Wallet
}

// Recovery methods
export enum RecoveryMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  BIOMETRIC = 'biometric',
  SOCIAL = 'social',
  SECURITY_QUESTIONS = 'security_questions'
}

// Wallet status
export enum WalletStatus {
  CREATING = 'creating',
  ACTIVE = 'active',
  LOCKED = 'locked',
  RECOVERING = 'recovering',
  DISABLED = 'disabled'
}

// Wallet interface
export interface CircleWalletData {
  id: string
  address: string
  type: WalletType
  blockchain: string
  status: WalletStatus
  recoveryMethods: RecoveryMethod[]
  createdAt: Date
  lastUsed?: Date
  balance?: {
    usdc: string
    eurc: string
    native: string
  }
}

// Wallet creation request
export interface CreateWalletRequest {
  userId: string
  type: WalletType
  blockchain: string
  recoveryMethods: RecoveryMethod[]
  metadata?: Record<string, any>
}

// Transaction request
export interface TransactionRequest {
  walletId: string
  to: string
  value: string
  data?: string
  gasLimit?: string
}

// Recovery request
export interface RecoveryRequest {
  walletId: string
  method: RecoveryMethod
  verificationCode?: string
  newDeviceId?: string
}

/**
 * Circle Wallets Client
 */
export class CircleWalletClient {
  private apiKey: string
  private appId: string
  private userToken?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CIRCLE_API_KEY || ''
    this.appId = CONFIG.appId
  }

  /**
   * Initialize SDK
   */
  async initialize(userToken: string) {
    this.userToken = userToken
    
    // Load Circle W3S SDK
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://sdk.circle.com/w3s/v1/w3s-sdk.js'
      script.async = true
      
      return new Promise((resolve, reject) => {
        script.onload = () => resolve(true)
        script.onerror = () => reject(new Error('Failed to load Circle W3S SDK'))
        document.body.appendChild(script)
      })
    }
  }

  /**
   * Create new wallet
   */
  async createWallet(request: CreateWalletRequest): Promise<CircleWalletData> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        },
        body: JSON.stringify({
          userId: request.userId,
          walletType: request.type,
          blockchain: request.blockchain,
          recoveryMethods: request.recoveryMethods,
          metadata: request.metadata
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create wallet: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: data.walletId,
        address: data.address,
        type: data.walletType,
        blockchain: data.blockchain,
        status: WalletStatus.ACTIVE,
        recoveryMethods: data.recoveryMethods,
        createdAt: new Date(data.createdAt)
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw error
    }
  }

  /**
   * Get wallet details
   */
  async getWallet(walletId: string): Promise<CircleWalletData> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets/${walletId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get wallet: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: data.walletId,
        address: data.address,
        type: data.walletType,
        blockchain: data.blockchain,
        status: data.status,
        recoveryMethods: data.recoveryMethods,
        createdAt: new Date(data.createdAt),
        lastUsed: data.lastUsed ? new Date(data.lastUsed) : undefined,
        balance: data.balance
      }
    } catch (error) {
      console.error('Error getting wallet:', error)
      throw error
    }
  }

  /**
   * List user wallets
   */
  async listWallets(userId: string): Promise<CircleWalletData[]> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to list wallets: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.wallets.map((w: any) => ({
        id: w.walletId,
        address: w.address,
        type: w.walletType,
        blockchain: w.blockchain,
        status: w.status,
        recoveryMethods: w.recoveryMethods,
        createdAt: new Date(w.createdAt),
        lastUsed: w.lastUsed ? new Date(w.lastUsed) : undefined,
        balance: w.balance
      }))
    } catch (error) {
      console.error('Error listing wallets:', error)
      throw error
    }
  }

  /**
   * Sign transaction
   */
  async signTransaction(request: TransactionRequest): Promise<{
    signature: string
    txHash: string
  }> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets/${request.walletId}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        },
        body: JSON.stringify({
          to: request.to,
          value: request.value,
          data: request.data,
          gasLimit: request.gasLimit
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to sign transaction: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw error
    }
  }

  /**
   * Execute transaction
   */
  async executeTransaction(request: TransactionRequest): Promise<{
    txHash: string
    status: 'pending' | 'confirmed' | 'failed'
  }> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets/${request.walletId}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        },
        body: JSON.stringify({
          to: request.to,
          value: request.value,
          data: request.data,
          gasLimit: request.gasLimit
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to execute transaction: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error executing transaction:', error)
      throw error
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(walletId: string): Promise<{
    usdc: string
    eurc: string
    native: string
  }> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets/${walletId}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get balance: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting balance:', error)
      throw error
    }
  }

  /**
   * Setup recovery method
   */
  async setupRecovery(
    walletId: string,
    method: RecoveryMethod,
    details: Record<string, any>
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets/${walletId}/recovery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        },
        body: JSON.stringify({
          method,
          details
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to setup recovery: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error setting up recovery:', error)
      throw error
    }
  }

  /**
   * Initiate wallet recovery
   */
  async initiateRecovery(request: RecoveryRequest): Promise<{
    challengeId: string
    method: RecoveryMethod
  }> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets/${request.walletId}/recover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: request.method,
          newDeviceId: request.newDeviceId
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to initiate recovery: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error initiating recovery:', error)
      throw error
    }
  }

  /**
   * Complete wallet recovery
   */
  async completeRecovery(
    walletId: string,
    challengeId: string,
    verificationCode: string
  ): Promise<{ success: boolean; newToken: string }> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets/${walletId}/recover/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challengeId,
          verificationCode
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to complete recovery: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error completing recovery:', error)
      throw error
    }
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometric(walletId: string): Promise<{ success: boolean }> {
    try {
      // Check if biometric is available
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        throw new Error('Biometric authentication not supported')
      }

      const response = await fetch(`${CONFIG.apiUrl}/wallets/${walletId}/biometric`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to enable biometric: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error enabling biometric:', error)
      throw error
    }
  }

  /**
   * Authenticate with biometric
   */
  async authenticateBiometric(walletId: string): Promise<{ success: boolean; token: string }> {
    try {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        throw new Error('Biometric authentication not supported')
      }

      // Request biometric authentication
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: 'required'
        }
      })

      if (!credential) {
        throw new Error('Biometric authentication failed')
      }

      const response = await fetch(`${CONFIG.apiUrl}/wallets/${walletId}/biometric/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credential: credential.id
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to verify biometric: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error authenticating biometric:', error)
      throw error
    }
  }

  /**
   * Export wallet (for backup)
   */
  async exportWallet(walletId: string, password: string): Promise<{
    encryptedKeystore: string
  }> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets/${walletId}/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        throw new Error(`Failed to export wallet: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error exporting wallet:', error)
      throw error
    }
  }

  /**
   * Import wallet (from backup)
   */
  async importWallet(
    userId: string,
    encryptedKeystore: string,
    password: string
  ): Promise<CircleWalletData> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/wallets/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-Token': this.userToken || ''
        },
        body: JSON.stringify({
          userId,
          encryptedKeystore,
          password
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to import wallet: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: data.walletId,
        address: data.address,
        type: data.walletType,
        blockchain: data.blockchain,
        status: WalletStatus.ACTIVE,
        recoveryMethods: data.recoveryMethods,
        createdAt: new Date(data.createdAt)
      }
    } catch (error) {
      console.error('Error importing wallet:', error)
      throw error
    }
  }
}

/**
 * React Hook for Circle Wallets
 */
export function useCircleWallet(userId?: string) {
  const [client, setClient] = useState<CircleWalletClient | null>(null)
  const [wallets, setWallets] = useState<CircleWalletData[]>([])
  const [activeWallet, setActiveWallet] = useState<CircleWalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const walletClient = new CircleWalletClient()
    setClient(walletClient)
  }, [])

  useEffect(() => {
    if (client && userId) {
      loadWallets()
    }
  }, [client, userId])

  const loadWallets = async () => {
    if (!client || !userId) return
    
    setLoading(true)
    try {
      const userWallets = await client.listWallets(userId)
      setWallets(userWallets)
      if (userWallets.length > 0 && !activeWallet) {
        setActiveWallet(userWallets[0])
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createWallet = async (request: Omit<CreateWalletRequest, 'userId'>) => {
    if (!client || !userId) throw new Error('Client not initialized')
    
    setLoading(true)
    setError(null)
    
    try {
      const wallet = await client.createWallet({ ...request, userId })
      setWallets([...wallets, wallet])
      setActiveWallet(wallet)
      return wallet
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const sendTransaction = async (request: Omit<TransactionRequest, 'walletId'>) => {
    if (!client || !activeWallet) throw new Error('No active wallet')
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await client.executeTransaction({
        ...request,
        walletId: activeWallet.id
      })
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    client,
    wallets,
    activeWallet,
    loading,
    error,
    createWallet,
    sendTransaction,
    setActiveWallet,
    refreshWallets: loadWallets
  }
}

// Helper to check biometric support
export function isBiometricSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!window.PublicKeyCredential
}

// Helper to format wallet address
export function formatWalletAddress(address: string, length = 8): string {
  if (!address) return ''
  return `${address.slice(0, length)}...${address.slice(-length)}`
}