/**
 * Circle Gateway SDK Integration
 * Provides fiat on/off ramps with KYC/AML compliance
 * 
 * Features:
 * - Buy USDC with credit card, bank transfer, Apple Pay, Google Pay
 * - Sell USDC back to fiat
 * - KYC verification flow
 * - Transaction limits and compliance
 * - Multi-currency support (USD, EUR, GBP, etc.)
 */

import { ethers } from 'ethers'
import { useState, useEffect } from 'react'

// Gateway configuration
const GATEWAY_CONFIG = {
  production: {
    apiUrl: 'https://api.circle.com/v1',
    widgetUrl: 'https://gateway.circle.com',
    appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || ''
  },
  sandbox: {
    apiUrl: 'https://api-sandbox.circle.com/v1',
    widgetUrl: 'https://gateway-sandbox.circle.com',
    appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || ''
  }
}

const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
const CONFIG = GATEWAY_CONFIG[ENV]

// Payment methods
export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  SEPA = 'sepa',
  ACH = 'ach'
}

// Transaction types
export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell'
}

// KYC status
export enum KYCStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Supported fiat currencies
export const FIAT_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' }
}

// Transaction limits
export interface TransactionLimits {
  daily: {
    min: number
    max: number
  }
  monthly: {
    min: number
    max: number
  }
  perTransaction: {
    min: number
    max: number
  }
}

// User profile
export interface UserProfile {
  id: string
  email: string
  kycStatus: KYCStatus
  verificationLevel: 'basic' | 'enhanced' | 'premium'
  limits: TransactionLimits
  paymentMethods: PaymentMethod[]
  createdAt: Date
}

// Transaction
export interface GatewayTransaction {
  id: string
  type: TransactionType
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  fiatAmount: string
  fiatCurrency: string
  cryptoAmount: string
  cryptoCurrency: string
  paymentMethod: PaymentMethod
  fees: {
    network: string
    processing: string
    total: string
  }
  recipient: string
  createdAt: Date
  completedAt?: Date
  errorMessage?: string
}

// Buy/Sell request
export interface TransactionRequest {
  type: TransactionType
  fiatAmount: string
  fiatCurrency: string
  paymentMethod: PaymentMethod
  recipient: string
  blockchain?: string
}

/**
 * Circle Gateway Client
 */
export class CircleGateway {
  private apiKey: string
  private appId: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CIRCLE_API_KEY || ''
    this.appId = CONFIG.appId
  }

  /**
   * Initialize Gateway widget
   */
  async initializeWidget(containerId: string, options: {
    onSuccess?: (transaction: GatewayTransaction) => void
    onError?: (error: Error) => void
    onClose?: () => void
  }) {
    // Load Circle Gateway SDK
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = `${CONFIG.widgetUrl}/sdk.js`
    script.async = true
    
    script.onload = () => {
      // @ts-ignore
      const gateway = new window.CircleGateway({
        appId: this.appId,
        containerId,
        onSuccess: options.onSuccess,
        onError: options.onError,
        onClose: options.onClose
      })

      gateway.init()
    }

    document.body.appendChild(script)
  }

  /**
   * Get user profile and KYC status
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        email: data.email,
        kycStatus: data.kycStatus as KYCStatus,
        verificationLevel: data.verificationLevel,
        limits: data.limits,
        paymentMethods: data.paymentMethods,
        createdAt: new Date(data.createdAt)
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  /**
   * Start KYC verification
   */
  async startKYC(userId: string, redirectUrl: string): Promise<{ verificationUrl: string }> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/users/${userId}/kyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ redirectUrl })
      })

      if (!response.ok) {
        throw new Error(`Failed to start KYC: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error starting KYC:', error)
      throw error
    }
  }

  /**
   * Get transaction limits
   */
  async getTransactionLimits(userId: string): Promise<TransactionLimits> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/users/${userId}/limits`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get limits: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting limits:', error)
      throw error
    }
  }

  /**
   * Create buy transaction
   */
  async buyUSDC(request: TransactionRequest): Promise<GatewayTransaction> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/transactions/buy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fiatAmount: request.fiatAmount,
          fiatCurrency: request.fiatCurrency,
          paymentMethod: request.paymentMethod,
          recipient: request.recipient,
          blockchain: request.blockchain || 'arc'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create buy transaction: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        type: TransactionType.BUY,
        status: data.status,
        fiatAmount: data.fiatAmount,
        fiatCurrency: data.fiatCurrency,
        cryptoAmount: data.cryptoAmount,
        cryptoCurrency: 'USDC',
        paymentMethod: data.paymentMethod,
        fees: data.fees,
        recipient: data.recipient,
        createdAt: new Date(data.createdAt),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined
      }
    } catch (error) {
      console.error('Error creating buy transaction:', error)
      throw error
    }
  }

  /**
   * Create sell transaction
   */
  async sellUSDC(request: TransactionRequest): Promise<GatewayTransaction> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/transactions/sell`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cryptoAmount: request.fiatAmount, // Amount in USDC
          fiatCurrency: request.fiatCurrency,
          paymentMethod: request.paymentMethod,
          blockchain: request.blockchain || 'arc'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create sell transaction: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        type: TransactionType.SELL,
        status: data.status,
        fiatAmount: data.fiatAmount,
        fiatCurrency: data.fiatCurrency,
        cryptoAmount: data.cryptoAmount,
        cryptoCurrency: 'USDC',
        paymentMethod: data.paymentMethod,
        fees: data.fees,
        recipient: data.recipient,
        createdAt: new Date(data.createdAt),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined
      }
    } catch (error) {
      console.error('Error creating sell transaction:', error)
      throw error
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<GatewayTransaction> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get transaction: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        type: data.type,
        status: data.status,
        fiatAmount: data.fiatAmount,
        fiatCurrency: data.fiatCurrency,
        cryptoAmount: data.cryptoAmount,
        cryptoCurrency: 'USDC',
        paymentMethod: data.paymentMethod,
        fees: data.fees,
        recipient: data.recipient,
        createdAt: new Date(data.createdAt),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        errorMessage: data.errorMessage
      }
    } catch (error) {
      console.error('Error getting transaction:', error)
      throw error
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string, limit = 50): Promise<GatewayTransaction[]> {
    try {
      const response = await fetch(
        `${CONFIG.apiUrl}/users/${userId}/transactions?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        status: tx.status,
        fiatAmount: tx.fiatAmount,
        fiatCurrency: tx.fiatCurrency,
        cryptoAmount: tx.cryptoAmount,
        cryptoCurrency: 'USDC',
        paymentMethod: tx.paymentMethod,
        fees: tx.fees,
        recipient: tx.recipient,
        createdAt: new Date(tx.createdAt),
        completedAt: tx.completedAt ? new Date(tx.completedAt) : undefined
      }))
    } catch (error) {
      console.error('Error getting history:', error)
      throw error
    }
  }

  /**
   * Estimate fees for transaction
   */
  async estimateFees(
    type: TransactionType,
    amount: string,
    currency: string,
    paymentMethod: PaymentMethod
  ): Promise<{
    processingFee: string
    networkFee: string
    totalFee: string
    estimatedAmount: string
  }> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/fees/estimate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          amount,
          currency,
          paymentMethod
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to estimate fees: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error estimating fees:', error)
      throw error
    }
  }

  /**
   * Get supported payment methods for user
   */
  async getSupportedPaymentMethods(userId: string, country: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(
        `${CONFIG.apiUrl}/payment-methods?userId=${userId}&country=${country}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to get payment methods: ${response.statusText}`)
      }

      const data = await response.json()
      return data.paymentMethods
    } catch (error) {
      console.error('Error getting payment methods:', error)
      throw error
    }
  }
}

/**
 * React Hook for Circle Gateway
 */
export function useCircleGateway() {
  const [gateway, setGateway] = useState<CircleGateway | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const client = new CircleGateway()
    setGateway(client)
  }, [])

  const buyUSDC = async (request: TransactionRequest) => {
    if (!gateway) throw new Error('Gateway not initialized')
    
    setLoading(true)
    setError(null)
    
    try {
      const transaction = await gateway.buyUSDC(request)
      return transaction
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const sellUSDC = async (request: TransactionRequest) => {
    if (!gateway) throw new Error('Gateway not initialized')
    
    setLoading(true)
    setError(null)
    
    try {
      const transaction = await gateway.sellUSDC(request)
      return transaction
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    gateway,
    loading,
    error,
    buyUSDC,
    sellUSDC
  }
}

// Helper function to format currency
export function formatCurrency(amount: string, currency: string): string {
  const num = parseFloat(amount)
  const currencyInfo = FIAT_CURRENCIES[currency as keyof typeof FIAT_CURRENCIES]
  
  if (!currencyInfo) return `${amount} ${currency}`
  
  return `${currencyInfo.symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

// Helper to get payment method display name
export function getPaymentMethodName(method: PaymentMethod): string {
  const names: Record<PaymentMethod, string> = {
    [PaymentMethod.CARD]: 'Credit/Debit Card',
    [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
    [PaymentMethod.APPLE_PAY]: 'Apple Pay',
    [PaymentMethod.GOOGLE_PAY]: 'Google Pay',
    [PaymentMethod.SEPA]: 'SEPA Transfer',
    [PaymentMethod.ACH]: 'ACH Transfer'
  }
  
  return names[method] || method
}