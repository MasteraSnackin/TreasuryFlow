'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/lib/useWallet'
import { getVaultContract, getTokenContract, CONTRACTS, formatCurrency } from '@/lib/contracts'
import { isDemoMode, DEMO_DATA } from '@/lib/demoData'
import TransactionHistory from '@/components/TransactionHistory'
import TreasuryChart from '@/components/TreasuryChart'
import TreasuryHealthScore from '@/components/TreasuryHealthScore'
import CCTPBridge from '@/components/CCTPBridge'
import { Wallet, DollarSign, TrendingUp, Clock, Plus, AlertCircle, ArrowLeftRight } from 'lucide-react'

export default function Dashboard() {
  const { address, isConnected, connect } = useWallet()
  const [balances, setBalances] = useState({ usdc: '0', eurc: '0' })
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showCCTPBridge, setShowCCTPBridge] = useState(false)

  useEffect(() => {
    if (isConnected) {
      loadDashboardData()
    }
  }, [isConnected])

  async function loadDashboardData() {
    try {
      setLoading(true)
      
      if (isDemoMode()) {
        // Use demo data
        setBalances(DEMO_DATA.balances)
        setPayments(DEMO_DATA.payments)
      } else {
        // Load vault balances
        const vault = await getVaultContract()
        const usdcBalance = await vault.getBalance(CONTRACTS.USDC)
        const eurcBalance = await vault.getBalance(CONTRACTS.EURC)
        
        setBalances({
          usdc: formatCurrency(usdcBalance),
          eurc: formatCurrency(eurcBalance)
        })

        // Load scheduled payments
        const paymentCount = await vault.paymentCount()
        const paymentList = []
        
        for (let i = 0; i < Number(paymentCount); i++) {
          const payment = await vault.getPayment(i)
          if (payment.active) {
            paymentList.push({
              id: i,
              recipient: payment.recipient,
              amount: formatCurrency(payment.amount),
              token: payment.token === CONTRACTS.USDC ? 'USDC' : 'EURC',
              nextExecution: new Date(Number(payment.nextExecutionTime) * 1000),
              description: payment.description,
              requiresApproval: payment.requiresApproval,
              approved: payment.approved
            })
          }
        }
        
        setPayments(paymentList)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <Wallet className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to access the TreasuryFlow dashboard
          </p>
          <button onClick={connect} className="btn-primary w-full">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const totalBalance = parseFloat(balances.usdc) + parseFloat(balances.eurc) * 0.92

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Demo Mode Banner */}
      {isDemoMode() && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Demo Mode Active - Using sample data</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TreasuryFlow</h1>
                <p className="text-xs text-gray-500">Smart Treasury Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Connected</p>
                <p className="text-sm font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <span className="text-sm opacity-80">USDC</span>
            </div>
            <div className="text-3xl font-bold mb-1">${parseFloat(balances.usdc).toLocaleString()}</div>
            <div className="text-sm opacity-80">Available Balance</div>
          </div>

          <div className="card bg-gradient-to-br from-purple-600 to-purple-700 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <span className="text-sm opacity-80">EURC</span>
            </div>
            <div className="text-3xl font-bold mb-1">€{parseFloat(balances.eurc).toLocaleString()}</div>
            <div className="text-sm opacity-80">Available Balance</div>
          </div>

          <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-sm opacity-80">Total</span>
            </div>
            <div className="text-3xl font-bold mb-1">${totalBalance.toLocaleString()}</div>
            <div className="text-sm opacity-80">USD Equivalent</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Schedule Payment
            </button>
            <button
              onClick={() => setShowBatchModal(true)}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Execute Batch
            </button>
            <button
              onClick={() => setShowCCTPBridge(true)}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" />
              CCTP Bridge
            </button>
            <button
              onClick={() => window.location.href = '/analytics'}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              View Analytics
            </button>
          </div>
        </div>

        {/* Scheduled Payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Scheduled Payments</h2>
            <span className="badge badge-info">{payments.length} Active</span>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No scheduled payments</p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="btn-primary mt-4"
              >
                Schedule Your First Payment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{payment.description}</p>
                      {payment.requiresApproval && !payment.approved && (
                        <span className="badge badge-warning text-xs">Needs Approval</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-mono">{payment.recipient.slice(0, 10)}...{payment.recipient.slice(-8)}</p>
                  </div>
                  
                  <div className="text-right mr-6">
                    <p className="font-semibold text-lg">{payment.amount} {payment.token}</p>
                    <p className="text-xs text-gray-500">
                      Next: {payment.nextExecution.toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      if (confirm(`Execute payment of ${payment.amount} ${payment.token}?`)) {
                        try {
                          alert('Payment execution feature - Coming soon!')
                          // In production: await vault.executePayment(payment.id)
                        } catch (error) {
                          alert('Failed to execute payment')
                        }
                      }
                    }}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Execute
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <TreasuryChart balances={balances} />
          <TreasuryHealthScore balances={balances} />
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <TransactionHistory />
        </div>
      </div>

      {/* Schedule Payment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Schedule Payment</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              alert('Payment scheduled successfully! (Demo)')
              setShowScheduleModal(false)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select className="input">
                    <option>USDC</option>
                    <option>EURC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select className="input">
                    <option value="604800">Weekly</option>
                    <option value="2592000">Monthly</option>
                    <option value="7776000">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Monthly salary"
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execute Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Execute Batch Payments</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Ready to execute {payments.filter(p => !p.requiresApproval || p.approved).length} payments
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {payments.filter(p => !p.requiresApproval || p.approved).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{payment.description}</p>
                      <p className="text-xs text-gray-500">{payment.recipient.slice(0, 10)}...</p>
                    </div>
                    <p className="font-semibold">{payment.amount} {payment.token}</p>
                  </div>
                ))}
              </div>
              {payments.filter(p => !p.requiresApproval || p.approved).length === 0 && (
                <p className="text-center text-gray-500 py-8">No payments ready for execution</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBatchModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Batch execution completed! (Demo)')
                  setShowBatchModal(false)
                }}
                className="btn-primary flex-1"
                disabled={payments.filter(p => !p.requiresApproval || p.approved).length === 0}
              >
                Execute All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CCTP Bridge Modal */}
      {showCCTPBridge && (
        <CCTPBridge onClose={() => setShowCCTPBridge(false)} />
      )}
    </div>
  )
}