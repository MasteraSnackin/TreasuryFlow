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
  const approverAddress = '0x9876543210abcdef9876543210abcdef98765432'
  const supplierAddress1 = '0x8f3a9C45D93e7B6c2A1b8fE4d3c5e9012a4b6c8d'
  const supplierAddress2 = '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'

  // === AUTHENTICATION & SECURITY EVENTS ===
  
  logAuditEvent(
    AuditEventType.WALLET_CONNECTED,
    'User connected wallet via MetaMask',
    { address: sampleAddress, method: 'MetaMask', browser: 'Chrome 120', os: 'Windows 11' },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.TWO_FA_ENABLED,
    'Two-factor authentication enabled',
    { method: 'TOTP', app: 'Google Authenticator' },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.LOGIN_FAILED,
    'Failed login attempt - invalid signature',
    { address: '0x0000invalid', reason: 'Invalid signature', attempts: 1 },
    { userAddress: null, result: 'failure' }
  )

  logAuditEvent(
    AuditEventType.TWO_FA_FAILED,
    'Failed 2FA verification',
    { attempts: 1, method: 'TOTP', remainingAttempts: 2 },
    { userAddress: sampleAddress, result: 'failure' }
  )

  // === PAYMENT EVENTS ===
  
  logAuditEvent(
    AuditEventType.PAYMENT_SCHEDULED,
    'Scheduled monthly payment to Design Agency Ltd',
    {
      recipient: supplierAddress1,
      recipientName: 'Design Agency Ltd',
      amount: '2500',
      currency: 'USDC',
      frequency: 'monthly',
      startDate: new Date().toISOString()
    },
    {
      userAddress: sampleAddress,
      metadata: { paymentId: '1', category: 'Design Services' }
    }
  )

  logAuditEvent(
    AuditEventType.PAYMENT_SCHEDULED,
    'Scheduled weekly payment to EU Software GmbH',
    {
      recipient: supplierAddress2,
      recipientName: 'EU Software GmbH',
      amount: '4200',
      currency: 'EURC',
      frequency: 'weekly'
    },
    {
      userAddress: sampleAddress,
      metadata: { paymentId: '2', category: 'Development' }
    }
  )

  logAuditEvent(
    AuditEventType.PAYMENT_EXECUTED,
    'Executed payment to Design Agency Ltd',
    {
      recipient: supplierAddress1,
      recipientName: 'Design Agency Ltd',
      amount: '2500',
      currency: 'USDC',
      paymentId: '1'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        gasUsed: '85000',
        gasCost: '0.085 USDC',
        blockNumber: '12345678'
      }
    }
  )

  logAuditEvent(
    AuditEventType.PAYMENT_EXECUTED,
    'Executed payment to EU Software GmbH',
    {
      recipient: supplierAddress2,
      recipientName: 'EU Software GmbH',
      amount: '4200',
      currency: 'EURC',
      paymentId: '2'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeefffff',
        gasUsed: '92000',
        gasCost: '0.092 USDC',
        blockNumber: '12345680'
      }
    }
  )

  logAuditEvent(
    AuditEventType.BATCH_PAYMENT_EXECUTED,
    'Executed batch payment (5 payments)',
    {
      paymentIds: [1, 2, 3, 4, 5],
      totalAmount: '15750',
      currency: 'USDC',
      recipients: 5
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        gasUsed: '385000',
        gasCost: '0.385 USDC',
        duration: 2340,
        gasSavings: '42%'
      }
    }
  )

  logAuditEvent(
    AuditEventType.PAYMENT_CANCELLED,
    'Cancelled scheduled payment',
    {
      paymentId: '7',
      recipient: supplierAddress1,
      amount: '1000',
      currency: 'USDC',
      reason: 'Contract terminated'
    },
    { userAddress: sampleAddress }
  )

  // === APPROVAL WORKFLOW EVENTS ===
  
  logAuditEvent(
    AuditEventType.APPROVAL_REQUESTED,
    'Large payment requires approval',
    {
      amount: '15000',
      currency: 'USDC',
      recipient: supplierAddress1,
      recipientName: 'Design Agency Ltd',
      reason: 'Exceeds $10,000 threshold',
      paymentId: '10'
    },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.APPROVAL_GRANTED,
    'Payment approved by CFO',
    {
      paymentId: '10',
      approver: approverAddress,
      approverName: 'John Smith (CFO)',
      amount: '15000',
      currency: 'USDC'
    },
    { userAddress: approverAddress }
  )

  logAuditEvent(
    AuditEventType.APPROVAL_REJECTED,
    'Payment rejected - insufficient documentation',
    {
      paymentId: '11',
      approver: approverAddress,
      amount: '25000',
      currency: 'USDC',
      reason: 'Missing invoice documentation'
    },
    { userAddress: approverAddress, result: 'failure' }
  )

  // === TREASURY MANAGEMENT EVENTS ===
  
  logAuditEvent(
    AuditEventType.FUNDS_DEPOSITED,
    'Deposited USDC to treasury vault',
    {
      amount: '50000',
      currency: 'USDC',
      source: 'Company Bank Account',
      method: 'Circle Transfer'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        newBalance: '75000'
      }
    }
  )

  logAuditEvent(
    AuditEventType.FUNDS_WITHDRAWN,
    'Withdrew EURC from treasury',
    {
      amount: '5000',
      currency: 'EURC',
      destination: 'Emergency Fund',
      reason: 'Quarterly distribution'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xwithdraw123456789abcdef',
        newBalance: '13300'
      }
    }
  )

  logAuditEvent(
    AuditEventType.CURRENCY_SWAPPED,
    'Swapped USDC to EURC via AutoSwap',
    {
      fromCurrency: 'USDC',
      toCurrency: 'EURC',
      fromAmount: '5000',
      toAmount: '4600',
      rate: '0.92',
      slippage: '0.5%'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        dex: 'Uniswap V3',
        gasCost: '0.125 USDC'
      }
    }
  )

  logAuditEvent(
    AuditEventType.AUTO_REBALANCE_TRIGGERED,
    'Auto-rebalanced treasury portfolio',
    {
      trigger: 'USDC exceeded 70% threshold',
      action: 'Swapped 10000 USDC to EURC',
      newRatio: '60/40 USDC/EURC'
    },
    {
      userAddress: 'system',
      metadata: {
        txHash: '0xrebalance123',
        previousRatio: '75/25'
      }
    }
  )

  // === SUPPLIER MANAGEMENT EVENTS ===
  
  logAuditEvent(
    AuditEventType.SUPPLIER_ADDED,
    'Added new supplier: Cloud Services Inc',
    {
      name: 'Cloud Services Inc',
      address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      preferredCurrency: 'USDC',
      category: 'Infrastructure',
      email: 'billing@cloudservices.com'
    },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.SUPPLIER_UPDATED,
    'Updated supplier information',
    {
      name: 'Design Agency Ltd',
      changes: {
        preferredCurrency: { from: 'USDC', to: 'EURC' },
        email: { from: 'old@email.com', to: 'new@designagency.com' }
      }
    },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.SUPPLIER_REMOVED,
    'Removed supplier from directory',
    {
      name: 'Old Marketing Agency',
      address: '0xoldaddress',
      reason: 'Contract ended',
      totalPaid: '45000'
    },
    { userAddress: sampleAddress }
  )

  // === SETTINGS & CONFIGURATION EVENTS ===
  
  logAuditEvent(
    AuditEventType.THRESHOLD_UPDATED,
    'Updated approval threshold',
    {
      oldThreshold: '10000',
      newThreshold: '15000',
      currency: 'USDC',
      reason: 'Increased operational limits'
    },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.NOTIFICATION_SETTINGS_CHANGED,
    'Updated notification preferences',
    {
      email: { enabled: true, address: 'treasury@company.com' },
      telegram: { enabled: true, chatId: '@treasury_alerts' },
      discord: { enabled: false },
      slack: { enabled: true, webhook: 'https://hooks.slack.com/...' }
    },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.APPROVER_ADDED,
    'Added new approver to multi-sig',
    {
      approver: '0xnewapprover123',
      name: 'Jane Doe (COO)',
      role: 'Chief Operating Officer',
      threshold: '2 of 3 required'
    },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.APPROVER_REMOVED,
    'Removed approver from multi-sig',
    {
      approver: '0xoldapprover456',
      name: 'Bob Johnson',
      reason: 'Left company',
      newThreshold: '2 of 2 required'
    },
    { userAddress: sampleAddress }
  )

  // === CROSS-CHAIN BRIDGE EVENTS ===
  
  logAuditEvent(
    AuditEventType.BRIDGE_TRANSFER_INITIATED,
    'Initiated CCTP bridge transfer',
    {
      amount: '10000',
      currency: 'USDC',
      sourceChain: 'Arc Network',
      destChain: 'Ethereum',
      recipient: sampleAddress
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xbridge123',
        estimatedTime: '8 minutes',
        fee: '10.00 USDC'
      }
    }
  )

  logAuditEvent(
    AuditEventType.BRIDGE_TRANSFER_COMPLETED,
    'CCTP bridge transfer completed',
    {
      amount: '10000',
      currency: 'USDC',
      sourceChain: 'Arc Network',
      destChain: 'Ethereum',
      duration: '7 minutes 32 seconds'
    },
    {
      userAddress: sampleAddress,
      metadata: {
        sourceTxHash: '0xbridge123',
        destTxHash: '0xbridge456',
        attestation: '0xattestation789'
      }
    }
  )

  // === SECURITY & MONITORING EVENTS ===
  
  logAuditEvent(
    AuditEventType.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded for API endpoint',
    {
      endpoint: '/api/recommend-currency',
      limit: 30,
      attempts: 35,
      timeWindow: '1 minute',
      ip: '192.168.1.100'
    },
    {
      userAddress: sampleAddress,
      result: 'failure'
    }
  )

  logAuditEvent(
    AuditEventType.SUSPICIOUS_ACTIVITY,
    'Suspicious activity detected',
    {
      type: 'Multiple failed login attempts',
      attempts: 5,
      timeWindow: '5 minutes',
      addresses: ['0xinvalid1', '0xinvalid2', '0xinvalid3'],
      action: 'Temporary IP block applied'
    },
    {
      userAddress: null,
      result: 'failure'
    }
  )

  logAuditEvent(
    AuditEventType.EMERGENCY_PAUSE_ACTIVATED,
    'Emergency pause activated',
    {
      reason: 'Suspicious large withdrawal detected',
      pausedFunctions: ['withdraw', 'transfer', 'swap'],
      activatedBy: sampleAddress
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xpause123',
        timestamp: new Date().toISOString()
      }
    }
  )

  logAuditEvent(
    AuditEventType.EMERGENCY_PAUSE_DEACTIVATED,
    'Emergency pause deactivated',
    {
      reason: 'False alarm - verified legitimate transaction',
      duration: '15 minutes',
      deactivatedBy: approverAddress
    },
    {
      userAddress: approverAddress,
      metadata: {
        txHash: '0xunpause456'
      }
    }
  )

  // === SMART CONTRACT EVENTS ===
  
  logAuditEvent(
    AuditEventType.CONTRACT_INTERACTION,
    'Interacted with TreasuryVault contract',
    {
      contract: '0xVaultAddress',
      method: 'schedulePayment',
      params: {
        recipient: supplierAddress1,
        amount: '2500',
        frequency: '2592000'
      }
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xcontract123',
        gasUsed: '125000',
        gasCost: '0.125 USDC'
      }
    }
  )

  logAuditEvent(
    AuditEventType.CONTRACT_UPGRADED,
    'Smart contract upgraded to v2.1.0',
    {
      contract: 'TreasuryVault',
      oldVersion: 'v2.0.0',
      newVersion: 'v2.1.0',
      changes: ['Added batch payment optimization', 'Fixed gas estimation bug'],
      upgrader: sampleAddress
    },
    {
      userAddress: sampleAddress,
      metadata: {
        txHash: '0xupgrade789',
        proxyAddress: '0xproxy123'
      }
    }
  )

  // === ANALYTICS & REPORTING EVENTS ===
  
  logAuditEvent(
    AuditEventType.REPORT_GENERATED,
    'Generated monthly treasury report',
    {
      reportType: 'Monthly Summary',
      period: 'January 2025',
      totalPayments: 45,
      totalVolume: '125000 USDC',
      format: 'PDF'
    },
    { userAddress: sampleAddress }
  )

  logAuditEvent(
    AuditEventType.DATA_EXPORTED,
    'Exported transaction data',
    {
      format: 'CSV',
      dateRange: '2024-12-01 to 2025-01-31',
      records: 156,
      destination: 'QuickBooks'
    },
    { userAddress: sampleAddress }
  )

  // Mark as generated
  if (typeof window !== 'undefined') {
    localStorage.setItem('sampleLogsGenerated', 'true')
  }
}