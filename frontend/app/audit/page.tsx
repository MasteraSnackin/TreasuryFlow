'use client'

import { useEffect } from 'react'
import AuditLogViewer from '@/components/AuditLogViewer'
import { logAuditEvent, AuditEventType } from '@/lib/auditLog'

export default function AuditPage() {
  useEffect(() => {
    // Generate sample audit logs for demonstration
    generateSampleLogs()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AuditLogViewer />
      </div>
    </div>
  )
}

function generateSampleLogs() {
  // Check if we've already generated sample logs
  if (typeof window !== 'undefined' && localStorage.getItem('sampleLogsGenerated')) {
    return
  }

  const sampleAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f5678'
  const now = Date.now()

  // Authentication events
  logAuditEvent(
    AuditEventType.WALLET_CONNECTED,
    'User connected wallet',
    { address: sampleAddress, method: 'MetaMask' },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.TWO_FA_ENABLED,
    'User enabled two-factor authentication',
    { method: 'TOTP' },
    { userAddress: sampleAddress }
  )

  // Payment events
  logAuditEvent(
    AuditEventType.PAYMENT_SCHEDULED,
    'Scheduled monthly payment to Design Agency',
    {
      recipient: '0x8f3a9C45D93e7B6c2A1b8fE4d3c5e9012',
      amount: '2500',
      currency: 'USDC',
      frequency: 'monthly'
    },
    { 
      userAddress: sampleAddress,
      metadata: { paymentId: '1' }
    }
  )

  logAuditEvent(
    AuditEventType.PAYMENT_EXECUTED,
    'Executed payment to EU Software GmbH',
    {
      recipient: '0x1a2b3c4d5e6f7g8h9i0j',
      amount: '4200',
      currency: 'EURC'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        gasUsed: '85000'
      }
    }
  )

  logAuditEvent(
    AuditEventType.BATCH_PAYMENT_EXECUTED,
    'Executed batch payment (3 payments)',
    {
      paymentIds: [1, 2, 3],
      totalAmount: '7500',
      currency: 'USDC'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        gasUsed: '245000',
        duration: 2340
      }
    }
  )

  // Approval events
  logAuditEvent(
    AuditEventType.APPROVAL_REQUESTED,
    'Large payment requires approval',
    {
      amount: '15000',
      currency: 'USDC',
      recipient: '0x8f3a9C45D93e7B6c2A1b8fE4d3c5e9012'
    },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.APPROVAL_GRANTED,
    'Payment approved by approver',
    {
      paymentId: '5',
      approver: '0x9876543210abcdef9876543210abcdef98765432'
    },
    { userAddress: '0x9876543210abcdef9876543210abcdef98765432' }
  )

  // Treasury events
  logAuditEvent(
    AuditEventType.FUNDS_DEPOSITED,
    'Deposited USDC to treasury',
    {
      amount: '10000',
      currency: 'USDC'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
      }
    }
  )

  logAuditEvent(
    AuditEventType.CURRENCY_SWAPPED,
    'Swapped USDC to EURC',
    {
      fromCurrency: 'USDC',
      toCurrency: 'EURC',
      fromAmount: '1000',
      toAmount: '920',
      rate: '0.92'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
      }
    }
  )

  // Supplier events
  logAuditEvent(
    AuditEventType.SUPPLIER_ADDED,
    'Added new supplier: Cloud Services Inc',
    {
      name: 'Cloud Services Inc',
      address: '0x1a2b3c4d5e6f7g8h9i0j',
      preferredCurrency: 'USDC'
    },
    { userAddress: sampleAddress }
  )

  // Settings events
  logAuditEvent(
    AuditEventType.THRESHOLD_UPDATED,
    'Updated approval threshold',
    {
      oldThreshold: '10000',
      newThreshold: '15000',
      currency: 'USDC'
    },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.NOTIFICATION_SETTINGS_CHANGED,
    'Updated notification preferences',
    {
      email: true,
      telegram: true,
      discord: false
    },
    { userAddress: sampleAddress }
  )

  // Security events
  logAuditEvent(
    AuditEventType.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded for API endpoint',
    {
      endpoint: '/api/recommend-currency',
      limit: 30,
      attempts: 35
    },
    {
      userAddress: sampleAddress,
      result: 'failure'
    }
  )

  logAuditEvent(
    AuditEventType.TWO_FA_FAILED,
    'Failed 2FA verification attempt',
    {
      attempts: 1,
      method: 'TOTP'
    },
    {
      userAddress: sampleAddress,
      result: 'failure'
    }
  )

  logAuditEvent(
    AuditEventType.LOGIN_FAILED,
    'Failed login attempt - invalid signature',
    {
      address: '0xinvalid',
      reason: 'Invalid signature'
    },
    {
      userAddress: null,
      result: 'failure'
    }
  )

  // Critical event
  logAuditEvent(
    AuditEventType.SUSPICIOUS_ACTIVITY,
    'Suspicious activity detected: Multiple failed login attempts',
    {
      attempts: 5,
      timeWindow: '5 minutes',
      addresses: ['0xinvalid1', '0xinvalid2', '0xinvalid3']
    },
    {
      userAddress: null,
      result: 'failure'
    }
  )

  // System events
  logAuditEvent(
    AuditEventType.CONTRACT_INTERACTION,
    'Interacted with TreasuryVault contract',
    {
      contract: '0xVaultAddress',
      method: 'schedulePayment',
      params: { recipient: '0x123', amount: '1000' }
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xcontract123',
        gasUsed: '125000'
      }
    }
  )

  // Mark as generated
  if (typeof window !== 'undefined') {
    localStorage.setItem('sampleLogsGenerated', 'true')
  }
}