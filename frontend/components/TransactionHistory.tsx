'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink, Filter } from 'lucide-react'
import { isDemoMode, DEMO_DATA } from '@/lib/demoData'

interface Transaction {
  id: string
  type: 'payment' | 'deposit' | 'swap'
  amount: string
  currency: string
  amountOut?: string
  currencyOut?: string
  recipient?: string
  recipientName?: string
  sender?: string
  timestamp: Date
  txHash: string
  status: 'pending' | 'confirmed' | 'failed'
  description: string
  gasUsed?: string
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'payment' | 'deposit' | 'swap'>('all')

  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions() {
    try {
      setLoading(true)
      
      if (isDemoMode()) {
        // Use demo data
        setTransactions(DEMO_DATA.transactions)
      } else {
        // In production, fetch from blockchain or API
        // const txs = await fetchTransactions()
        // setTransactions(txs)
        setTransactions([])
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  )

  function getTransactionIcon(type: string) {
    switch (type) {
      case 'payment':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />
      case 'swap':
        return <RefreshCw className="w-5 h-5 text-blue-600" />
      default:
        return <ArrowUpRight className="w-5 h-5 text-gray-600" />
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'confirmed':
        return <span className="badge bg-green-100 text-green-700">Confirmed</span>
      case 'pending':
        return <span className="badge bg-yellow-100 text-yellow-700">Pending</span>
      case 'failed':
        return <span className="badge bg-red-100 text-red-700">Failed</span>
      default:
        return <span className="badge bg-gray-100 text-gray-700">{status}</span>
    }
  }

  function formatTimestamp(date: Date) {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('payment')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'payment' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setFilter('deposit')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'deposit' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setFilter('swap')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'swap' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Swaps
            </button>
          </div>

          <button 
            onClick={loadTransactions}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <p>No transactions found</p>
          {filter !== 'all' && (
            <button 
              onClick={() => setFilter('all')}
              className="text-primary-600 hover:text-primary-700 mt-2 text-sm"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div 
              key={tx.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Icon */}
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  {getTransactionIcon(tx.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                    {getStatusBadge(tx.status)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{formatTimestamp(tx.timestamp)}</span>
                    {tx.recipientName && (
                      <>
                        <span>•</span>
                        <span>{tx.recipientName}</span>
                      </>
                    )}
                    {tx.gasUsed && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">Gas: {tx.gasUsed}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={`https://explorer-testnet.arc.network/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:text-primary-700 font-mono flex items-center gap-1"
                    >
                      {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right ml-4">
                {tx.type === 'swap' ? (
                  <div>
                    <p className="font-semibold text-red-600">-{tx.amount} {tx.currency}</p>
                    <p className="font-semibold text-green-600 text-sm">+{tx.amountOut} {tx.currencyOut}</p>
                  </div>
                ) : (
                  <p className={`font-semibold text-lg ${
                    tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.currency}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination (if needed) */}
      {filteredTransactions.length > 10 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
          <button className="btn-secondary text-sm">Previous</button>
          <span className="text-sm text-gray-600">Page 1 of 1</span>
          <button className="btn-secondary text-sm">Next</button>
        </div>
      )}
    </div>
  )
}