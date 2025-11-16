'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/useWallet'
import { getVaultContract, getTokenContract, CONTRACTS, formatCurrency } from '@/lib/contracts'
import { isDemoMode, DEMO_DATA } from '@/lib/demoData'
import { fetchStablecoinPrices, formatPriceChange, calculateUSDValue } from '@/lib/priceService'
import TransactionHistory from '@/components/TransactionHistory'
import TreasuryChart from '@/components/TreasuryChart'
import TreasuryHealthScore from '@/components/TreasuryHealthScore'
import CurrencyInfoModal from '@/components/CurrencyInfoModal'
import { Wallet, DollarSign, TrendingUp, Clock, Plus, AlertCircle, ArrowLeftRight, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const { address, isConnected, connect } = useWallet()
  const [balances, setBalances] = useState({ usdc: '0', eurc: '0' })
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('ready') // Auto-filter to ready payments
  const [filterCurrency, setFilterCurrency] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [prices, setPrices] = useState<any>(null)
  const [pricesLoading, setPricesLoading] = useState(false)

  useEffect(() => {
    if (isConnected) {
      loadDashboardData()
      loadPrices()
    }
  }, [isConnected])

  async function loadPrices() {
    try {
      setPricesLoading(true)
      const priceData = await fetchStablecoinPrices()
      setPrices(priceData)
    } catch (error) {
      console.error('Failed to load prices:', error)
    } finally {
      setPricesLoading(false)
    }
  }

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
        {/* Balance Cards Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Treasury Balances</h2>
          <CurrencyInfoModal />
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white relative">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <div className="text-right">
                <span className="text-sm opacity-80 block">USDC</span>
                {prices && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="opacity-90">${prices.usdc.usd.toFixed(4)}</span>
                    <span style={{ color: formatPriceChange(prices.usdc.usd_24h_change).color }}>
                      {formatPriceChange(prices.usdc.usd_24h_change).icon}
                      {Math.abs(prices.usdc.usd_24h_change).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">${parseFloat(balances.usdc).toLocaleString()}</div>
            <div className="text-sm opacity-80 mb-2">Available Balance</div>
            {prices && (
              <div className="text-xs opacity-70">
                ≈ ${calculateUSDValue(balances.usdc, prices.usdc.usd)} USD
              </div>
            )}
            {pricesLoading && (
              <RefreshCw className="absolute top-4 right-4 w-4 h-4 animate-spin opacity-50" />
            )}
          </div>

          <div className="card bg-gradient-to-br from-purple-600 to-purple-700 text-white relative">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <div className="text-right">
                <span className="text-sm opacity-80 block">EURC</span>
                {prices && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="opacity-90">${prices.eurc.usd.toFixed(4)}</span>
                    <span style={{ color: formatPriceChange(prices.eurc.usd_24h_change).color }}>
                      {formatPriceChange(prices.eurc.usd_24h_change).icon}
                      {Math.abs(prices.eurc.usd_24h_change).toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">€{parseFloat(balances.eurc).toLocaleString()}</div>
            <div className="text-sm opacity-80 mb-2">Available Balance</div>
            {prices && (
              <div className="text-xs opacity-70">
                ≈ ${calculateUSDValue(balances.eurc, prices.eurc.usd)} USD
              </div>
            )}
            {pricesLoading && (
              <RefreshCw className="absolute top-4 right-4 w-4 h-4 animate-spin opacity-50" />
            )}
          </div>

          <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white relative">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <div className="text-right">
                <span className="text-sm opacity-80 block">Total</span>
                {prices && (
                  <button
                    onClick={loadPrices}
                    className="text-xs opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
                    disabled={pricesLoading}
                  >
                    <RefreshCw className={`w-3 h-3 ${pricesLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                )}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${prices ? (
                (parseFloat(calculateUSDValue(balances.usdc, prices.usdc.usd)) +
                 parseFloat(calculateUSDValue(balances.eurc, prices.eurc.usd))).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              ) : (
                totalBalance.toLocaleString()
              )}
            </div>
            <div className="text-sm opacity-80 mb-2">USD Equivalent</div>
            {prices && (
              <div className="text-xs opacity-70">
                Live prices from CoinGecko
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Schedule Payment */}
            <button
              onClick={() => router.push('/payments/schedule')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-start gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg mb-1">Schedule Payment</p>
                  <p className="text-sm opacity-90">Set up recurring payments</p>
                </div>
              </div>
            </button>

            {/* Execute Batch */}
            <button
              onClick={() => router.push('/payments/batch')}
              className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-start gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg mb-1">Execute Batch</p>
                  <p className="text-sm opacity-90">Process multiple payments</p>
                </div>
              </div>
              {payments.filter(p => !p.requiresApproval || p.approved).length > 0 && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-yellow-400 text-green-900 rounded-full flex items-center justify-center text-xs font-bold">
                  {payments.filter(p => !p.requiresApproval || p.approved).length}
                </div>
              )}
            </button>

            {/* CCTP Bridge */}
            <button
              onClick={() => router.push('/bridge')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-start gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg mb-1">CCTP Bridge</p>
                  <p className="text-sm opacity-90">Cross-chain transfers</p>
                </div>
              </div>
            </button>

            {/* View Analytics */}
            <button
              onClick={() => router.push('/analytics')}
              className="group relative overflow-hidden bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-start gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg mb-1">View Analytics</p>
                  <p className="text-sm opacity-90">Treasury insights</p>
                </div>
              </div>
            </button>
          </div>

          {/* Additional Shortcuts */}
          <div className="grid md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push('/approvals')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">Approvals</p>
                <p className="text-xs text-gray-600">Review pending payments</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/audit')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">Audit Log</p>
                <p className="text-xs text-gray-600">View transaction history</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">Settings</p>
                <p className="text-xs text-gray-600">Configure preferences</p>
              </div>
            </button>
          </div>
        </div>

        {/* Scheduled Payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Scheduled Payments</h2>
            <div className="flex items-center gap-2">
              <span className="badge badge-info">{payments.length} Active</span>
              <span className="badge badge-success">{payments.filter(p => p.status === 'ready_now' || p.status === 'overdue').length} Ready</span>
            </div>
          </div>

          {/* Filters & Search */}
          {payments.length > 0 && (
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by description, recipient, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Status Filters */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'all'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({payments.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('ready')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'ready'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Ready ({payments.filter(p => p.status === 'ready_now' || p.status === 'overdue').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending_approval')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'pending_approval'
                        ? 'bg-yellow-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Needs Approval ({payments.filter(p => p.status === 'pending_approval').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('scheduled')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'scheduled'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Scheduled ({payments.filter(p => p.status === 'scheduled' || p.status === 'ready_soon').length})
                  </button>
                </div>

                {/* Currency Filters */}
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm font-medium text-gray-700">Currency:</span>
                  <button
                    onClick={() => setFilterCurrency('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterCurrency === 'all'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterCurrency('USDC')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterCurrency === 'USDC'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    USDC ({payments.filter(p => p.token === 'USDC').length})
                  </button>
                  <button
                    onClick={() => setFilterCurrency('EURC')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterCurrency === 'EURC'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    EURC ({payments.filter(p => p.token === 'EURC').length})
                  </button>
                </div>

                {/* Clear Filters */}
                {(filterStatus !== 'all' || filterCurrency !== 'all' || searchTerm) && (
                  <button
                    onClick={() => {
                      setFilterStatus('all')
                      setFilterCurrency('all')
                      setSearchTerm('')
                    }}
                    className="ml-auto px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No scheduled payments</p>
              <button
                onClick={() => router.push('/payments/schedule')}
                className="btn-primary mt-4"
              >
                Schedule Your First Payment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                // Apply filters
                let filteredPayments = payments

                // Status filter
                if (filterStatus === 'ready') {
                  filteredPayments = filteredPayments.filter(p =>
                    p.status === 'ready_now' || p.status === 'overdue'
                  )
                } else if (filterStatus === 'pending_approval') {
                  filteredPayments = filteredPayments.filter(p =>
                    p.status === 'pending_approval'
                  )
                } else if (filterStatus === 'scheduled') {
                  filteredPayments = filteredPayments.filter(p =>
                    p.status === 'scheduled' || p.status === 'ready_soon'
                  )
                }

                // Currency filter
                if (filterCurrency !== 'all') {
                  filteredPayments = filteredPayments.filter(p =>
                    p.token === filterCurrency
                  )
                }

                // Search filter
                if (searchTerm) {
                  const term = searchTerm.toLowerCase()
                  filteredPayments = filteredPayments.filter(p =>
                    p.description.toLowerCase().includes(term) ||
                    p.recipient.toLowerCase().includes(term) ||
                    p.recipientName?.toLowerCase().includes(term) ||
                    p.category?.toLowerCase().includes(term)
                  )
                }

                // Show message if no results
                if (filteredPayments.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-lg font-medium mb-2">No payments found</p>
                      <p className="text-sm">Try adjusting your filters or search term</p>
                      <button
                        onClick={() => {
                          setFilterStatus('all')
                          setFilterCurrency('all')
                          setSearchTerm('')
                        }}
                        className="btn-secondary mt-4"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )
                }

                return filteredPayments.map((payment) => {
                  const getStatusBadge = (status: string) => {
                  switch (status) {
                    case 'ready_now':
                      return <span className="badge bg-green-100 text-green-700 text-xs font-semibold">✓ Ready Now</span>
                    case 'overdue':
                      return <span className="badge bg-red-100 text-red-700 text-xs font-semibold">⚠ Overdue</span>
                    case 'ready_soon':
                      return <span className="badge bg-blue-100 text-blue-700 text-xs font-semibold">⏰ Ready Soon</span>
                    case 'pending_approval':
                      return <span className="badge bg-yellow-100 text-yellow-700 text-xs font-semibold">⏳ Needs Approval</span>
                    default:
                      return <span className="badge bg-gray-100 text-gray-700 text-xs font-semibold">📅 Scheduled</span>
                  }
                  }

                  const daysUntilNext = Math.ceil((payment.nextExecution.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  const isReady = daysUntilNext <= 0

                  return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isReady
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : payment.status === 'pending_approval'
                        ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Payment Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-bold text-gray-900">{payment.description}</p>
                          {getStatusBadge(payment.status)}
                          {payment.category && (
                            <span className="badge bg-gray-200 text-gray-700 text-xs">{payment.category}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="font-mono">{payment.recipient.slice(0, 10)}...{payment.recipient.slice(-8)}</span>
                          {payment.recipientName && (
                            <span className="font-medium">• {payment.recipientName}</span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {payment.executionCount > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>{payment.executionCount} payments completed</span>
                              <span className="font-semibold">${payment.totalPaid} total</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min((payment.executionCount / 24) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Last Executed */}
                        {payment.lastExecuted && (
                          <p className="text-xs text-gray-500">
                            Last executed: {new Date(payment.lastExecuted).toLocaleDateString()} ({Math.abs(Math.ceil((Date.now() - new Date(payment.lastExecuted).getTime()) / (1000 * 60 * 60 * 24)))} days ago)
                          </p>
                        )}
                      </div>

                      {/* Right: Amount & Action */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-2xl text-gray-900">{payment.amount}</p>
                          <p className="text-sm text-gray-600 font-semibold">{payment.token}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {isReady ? (
                              <span className="text-green-600 font-semibold">Ready to execute</span>
                            ) : daysUntilNext === 1 ? (
                              'Tomorrow'
                            ) : daysUntilNext < 7 ? (
                              `In ${daysUntilNext} days`
                            ) : (
                              payment.nextExecution.toLocaleDateString()
                            )}
                          </p>
                        </div>

                        <button
                          onClick={async () => {
                            if (payment.status === 'pending_approval') {
                              alert('This payment requires approval first. Go to Approvals page.')
                              return
                            }
                            if (!isReady) {
                              alert(`Payment not ready yet. Next execution: ${payment.nextExecution.toLocaleDateString()}`)
                              return
                            }
                            if (confirm(`Execute payment of ${payment.amount} ${payment.token} to ${payment.recipientName || payment.recipient}?`)) {
                              try {
                                alert('Payment executed successfully! (Demo mode)')
                                // In production: await vault.executePayment(payment.id)
                              } catch (error) {
                                alert('Failed to execute payment')
                              }
                            }
                          }}
                          disabled={!isReady && payment.status !== 'overdue'}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            isReady || payment.status === 'overdue'
                              ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                              : payment.status === 'pending_approval'
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {payment.status === 'pending_approval' ? 'Approve' : isReady ? 'Execute Now' : 'Scheduled'}
                        </button>
                      </div>
                    </div>
                    </div>
                  )
                })
              })()}
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

    </div>
  )
}