'use client'

import { useState, useEffect } from 'react'

interface TwoFactorConfig {
  enabled: boolean
  secret?: string
  backupCodes?: string[]
  lastVerified?: number
}

interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

// Generate TOTP secret (Time-based One-Time Password)
export function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)]
  }
  return secret
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    codes.push(code)
  }
  return codes
}

// Generate QR code URL for authenticator apps
export function generateQRCodeURL(secret: string, issuer: string = 'TreasuryFlow', account: string): string {
  const otpauthURL = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthURL)}`
}

// Simple TOTP verification (client-side validation)
// In production, this MUST be done server-side
export function verifyTOTP(secret: string, token: string): boolean {
  // This is a simplified version for demo purposes
  // Real implementation should use a proper TOTP library like 'otplib'
  const timeStep = 30 // 30 seconds
  const currentTime = Math.floor(Date.now() / 1000 / timeStep)
  
  // In production, verify against server-generated token
  // For demo, we'll accept any 6-digit code
  return /^\d{6}$/.test(token)
}

// Verify backup code
export function verifyBackupCode(backupCodes: string[], code: string): { valid: boolean; remainingCodes?: string[] } {
  const index = backupCodes.findIndex(c => c === code.toUpperCase())
  
  if (index === -1) {
    return { valid: false }
  }
  
  // Remove used backup code
  const remainingCodes = [...backupCodes]
  remainingCodes.splice(index, 1)
  
  return { valid: true, remainingCodes }
}

// Storage helpers (in production, use encrypted storage)
const STORAGE_KEY = 'treasuryflow_2fa'

export function save2FAConfig(address: string, config: TwoFactorConfig): void {
  if (typeof window === 'undefined') return
  
  const allConfigs = get2FAConfigs()
  allConfigs[address.toLowerCase()] = config
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs))
}

export function get2FAConfig(address: string): TwoFactorConfig | null {
  if (typeof window === 'undefined') return null
  
  const allConfigs = get2FAConfigs()
  return allConfigs[address.toLowerCase()] || null
}

function get2FAConfigs(): Record<string, TwoFactorConfig> {
  if (typeof window === 'undefined') return {}
  
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : {}
}

export function remove2FAConfig(address: string): void {
  if (typeof window === 'undefined') return
  
  const allConfigs = get2FAConfigs()
  delete allConfigs[address.toLowerCase()]
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs))
}

// Check if 2FA is required for an action
export function requires2FA(address: string, action: string): boolean {
  const config = get2FAConfig(address)
  
  if (!config || !config.enabled) {
    return false
  }
  
  // Require 2FA for sensitive actions
  const sensitiveActions = [
    'schedule_payment',
    'execute_payment',
    'approve_payment',
    'cancel_payment',
    'withdraw_funds',
    'add_approver',
    'remove_approver'
  ]
  
  return sensitiveActions.includes(action)
}

// Mark 2FA as verified for current session
export function mark2FAVerified(address: string): void {
  const config = get2FAConfig(address)
  if (!config) return
  
  config.lastVerified = Date.now()
  save2FAConfig(address, config)
}

// Check if 2FA verification is still valid (5 minute window)
export function is2FAVerified(address: string): boolean {
  const config = get2FAConfig(address)
  if (!config || !config.lastVerified) return false
  
  const fiveMinutes = 5 * 60 * 1000
  return Date.now() - config.lastVerified < fiveMinutes
}

// Setup 2FA for a wallet address
export async function setup2FA(address: string): Promise<TwoFactorSetup> {
  const secret = generateSecret()
  const backupCodes = generateBackupCodes()
  const qrCode = generateQRCodeURL(secret, 'TreasuryFlow', address)
  
  return {
    secret,
    qrCode,
    backupCodes
  }
}

// Enable 2FA after verification
export function enable2FA(address: string, secret: string, backupCodes: string[]): void {
  const config: TwoFactorConfig = {
    enabled: true,
    secret,
    backupCodes,
    lastVerified: Date.now()
  }
  
  save2FAConfig(address, config)
}

// Disable 2FA
export function disable2FA(address: string): void {
  remove2FAConfig(address)
}

// React hook for 2FA
export function use2FA(address: string | null) {
  const [config, setConfig] = useState<TwoFactorConfig | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!address) {
      setConfig(null)
      setLoading(false)
      return
    }
    
    const storedConfig = get2FAConfig(address)
    setConfig(storedConfig)
    setLoading(false)
  }, [address])
  
  const setupNew = async () => {
    if (!address) throw new Error('No address provided')
    return setup2FA(address)
  }
  
  const enable = (secret: string, backupCodes: string[]) => {
    if (!address) throw new Error('No address provided')
    enable2FA(address, secret, backupCodes)
    setConfig(get2FAConfig(address))
  }
  
  const disable = () => {
    if (!address) throw new Error('No address provided')
    disable2FA(address)
    setConfig(null)
  }
  
  const verify = (token: string): boolean => {
    if (!address || !config || !config.secret) return false
    
    // Try TOTP first
    if (verifyTOTP(config.secret, token)) {
      mark2FAVerified(address)
      return true
    }
    
    // Try backup code
    if (config.backupCodes) {
      const result = verifyBackupCode(config.backupCodes, token)
      if (result.valid) {
        // Update config with remaining backup codes
        const updatedConfig = { ...config, backupCodes: result.remainingCodes }
        save2FAConfig(address, updatedConfig)
        setConfig(updatedConfig)
        mark2FAVerified(address)
        return true
      }
    }
    
    return false
  }
  
  const isVerified = address ? is2FAVerified(address) : false
  const isRequired = (action: string) => address ? requires2FA(address, action) : false
  
  return {
    config,
    loading,
    enabled: config?.enabled || false,
    isVerified,
    isRequired,
    setupNew,
    enable,
    disable,
    verify
  }
}