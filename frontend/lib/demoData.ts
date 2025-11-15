// Demo mode sample data for TreasuryFlow
export const DEMO_DATA = {
  balances: {
    usdc: '25750.00',
    eurc: '18300.00'
  },
  
  payments: [
    {
      id: 0,
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f5678',
      recipientName: 'Design Agency Ltd',
      amount: '2500.00',
      token: 'USDC',
      nextExecution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      frequency: 2592000, // monthly
      description: 'Monthly design retainer',
      requiresApproval: false,
      approved: true,
      active: true
    },
    {
      id: 1,
      recipient: '0x8f3a9C45D93e7B6c2A1b8fE4d3c5e9012a4b6c8d',
      recipientName: 'EU Software GmbH',
      amount: '4200.00',
      token: 'EURC',
      nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      frequency: 604800, // weekly
      description: 'Weekly development sprint',
      requiresApproval: false,
      approved: true,
      active: true
    },
    {
      id: 2,
      recipient: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      recipientName: 'Cloud Services Inc',
      amount: '850.00',
      token: 'USDC',
      nextExecution: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      frequency: 2592000, // monthly
      description: 'Infrastructure hosting',
      requiresApproval: false,
      approved: true,
      active: true
    },
    {
      id: 3,
      recipient: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
      recipientName: 'Marketing Agency',
      amount: '12000.00',
      token: 'USDC',
      nextExecution: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      frequency: 2592000, // monthly
      description: 'Q1 Marketing Campaign',
      requiresApproval: true,
      approved: false,
      active: true
    }
  ],

  transactions: [
    {
      id: '1',
      type: 'payment' as const,
      amount: '2500.00',
      currency: 'USDC',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f5678',
      recipientName: 'Design Agency Ltd',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: 'confirmed' as const,
      description: 'Monthly design retainer',
      gasUsed: '0.085 USDC'
    },
    {
      id: '2',
      type: 'swap' as const,
      amount: '1000.00',
      currency: 'USDC',
      amountOut: '920.00',
      currencyOut: 'EURC',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      status: 'confirmed' as const,
      description: 'FX Swap: USDC → EURC',
      gasUsed: '0.042 USDC'
    },
    {
      id: '3',
      type: 'payment' as const,
      amount: '4200.00',
      currency: 'EURC',
      recipient: '0x8f3a9C45D93e7B6c2A1b8fE4d3c5e9012a4b6c8d',
      recipientName: 'EU Software GmbH',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      txHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      status: 'confirmed' as const,
      description: 'Weekly development sprint',
      gasUsed: '0.078 USDC'
    },
    {
      id: '4',
      type: 'deposit' as const,
      amount: '10000.00',
      currency: 'USDC',
      sender: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      status: 'confirmed' as const,
      description: 'Deposit from company account',
      gasUsed: '0.025 USDC'
    },
    {
      id: '5',
      type: 'payment' as const,
      amount: '850.00',
      currency: 'USDC',
      recipient: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      recipientName: 'Cloud Services Inc',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      txHash: '0x456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123',
      status: 'confirmed' as const,
      description: 'Infrastructure hosting',
      gasUsed: '0.068 USDC'
    },
    {
      id: '6',
      type: 'payment' as const,
      amount: '1500.00',
      currency: 'USDC',
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f5678',
      recipientName: 'Design Agency Ltd',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      txHash: '0x789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012345',
      status: 'confirmed' as const,
      description: 'Additional design work',
      gasUsed: '0.072 USDC'
    }
  ],

  suppliers: [
    {
      id: '1',
      name: 'Design Agency Ltd',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5678',
      preferredCurrency: 'USDC',
      totalPaid: 45000,
      paymentCount: 18,
      tags: ['Design', 'UK'],
      email: 'hello@designagency.com',
      active: true
    },
    {
      id: '2',
      name: 'EU Software GmbH',
      address: '0x8f3a9C45D93e7B6c2A1b8fE4d3c5e9012a4b6c8d',
      preferredCurrency: 'EURC',
      totalPaid: 82000,
      paymentCount: 24,
      tags: ['Development', 'Germany'],
      email: 'contracts@eusoftware.de',
      active: true
    },
    {
      id: '3',
      name: 'Cloud Services Inc',
      address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      preferredCurrency: 'USDC',
      totalPaid: 12750,
      paymentCount: 15,
      tags: ['Infrastructure', 'US'],
      email: 'billing@cloudservices.com',
      active: true
    },
    {
      id: '4',
      name: 'Marketing Agency',
      address: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
      preferredCurrency: 'USDC',
      totalPaid: 36000,
      paymentCount: 3,
      tags: ['Marketing', 'US'],
      email: 'team@marketingagency.com',
      active: true
    }
  ],

  analytics: {
    monthlySpending: [
      { month: 'Jan', usdc: 18500, eurc: 15200 },
      { month: 'Feb', usdc: 22300, eurc: 16800 },
      { month: 'Mar', usdc: 19800, eurc: 18300 },
      { month: 'Apr', usdc: 25750, eurc: 18300 }
    ],
    topSuppliers: [
      { name: 'EU Software GmbH', amount: 82000 },
      { name: 'Design Agency Ltd', amount: 45000 },
      { name: 'Marketing Agency', amount: 36000 },
      { name: 'Cloud Services Inc', amount: 12750 }
    ],
    gasSavings: {
      treasuryflow: 0.85,
      ethereum: 125.50,
      savings: 124.65,
      savingsPercent: 99.3
    }
  }
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
         localStorage.getItem('demoMode') === 'true'
}

export function enableDemoMode() {
  if (typeof window === 'undefined') return
  localStorage.setItem('demoMode', 'true')
}

export function disableDemoMode() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('demoMode')
}