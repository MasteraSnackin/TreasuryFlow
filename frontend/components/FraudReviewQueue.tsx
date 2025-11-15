'use client'

/**
 * TreasuryFlow - AI Fraud Detection System
 * Phase 5.5: Manual Review Queue UI
 * 
 * Interactive dashboard for reviewing and managing flagged transactions
 */

import { useState, useEffect, useMemo } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  TrendingUp,
  Eye,
  Filter,
  Search,
  Download
} from 'lucide-react'
import { 
  FraudDetectionEngine, 
  AnomalyScore, 
  Transaction,
  getSeverityColor 
} from '@/lib/fraudDetection'
import { 
  RiskScoringEngine, 
  RiskScore, 
  RiskLevel,
  getRiskLevelColor 
} from '@/lib/riskScoring'
import { 
  VelocityMonitor, 
  VelocityCheck,
  getVelocityAlertColor 
} from '@/lib/velocityLimits'
import { format } from 'date-fns'

// ============================================================================
// TYPES
// ============================================================================

interface FlaggedTransaction extends Transaction {
  flaggedAt: Date
  anomalyScore: AnomalyScore
  riskScore: RiskScore
  velocityCheck: VelocityCheck
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'escalated'
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
}

type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'escalated'
type SortField = 'flaggedAt' | 'anomalyScore' | 'riskScore' | 'amount'
type SortOrder = 'asc' | 'desc'

// ============================================================================
// COMPONENT
// ============================================================================

export default function FraudReviewQueue() {
  const [flaggedTransactions, setFlaggedTransactions] = useState<FlaggedTransaction[]>([])
  const [selectedTx, setSelectedTx] = useState<FlaggedTransaction | null>(null)
  const [filter, setFilter] = useState<FilterType>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('flaggedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [loading, setLoading] = useState(true)

  // Initialize fraud detection engines
  const [fraudEngine] = useState(() => new FraudDetectionEngine())
  const [riskEngine] = useState(() => new RiskScoringEngine())
  const [velocityMonitor] = useState(() => new VelocityMonitor())

  useEffect(() => {
    loadFlaggedTransactions()
  }, [])

  async function loadFlaggedTransactions() {
    setLoading(true)
    try {
      // In production, fetch from API
      // const response = await fetch('/api/fraud/flagged')
      // const data = await response.json()
      
      // For now, use demo data
      const demoData = generateDemoFlaggedTransactions()
      setFlaggedTransactions(demoData)
    } catch (error) {
      console.error('Failed to load flagged transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = flaggedTransactions

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.reviewStatus === filter)
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(tx =>
        tx.recipient.toLowerCase().includes(term) ||
        tx.description.toLowerCase().includes(term) ||
        tx.id.toString().includes(term)
      )
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortField) {
        case 'flaggedAt':
          aVal = new Date(a.flaggedAt).getTime()
          bVal = new Date(b.flaggedAt).getTime()
          break
        case 'anomalyScore':
          aVal = a.anomalyScore.score
          bVal = b.anomalyScore.score
          break
        case 'riskScore':
          aVal = a.riskScore.overall
          bVal = b.riskScore.overall
          break
        case 'amount':
          aVal = parseFloat(a.amount)
          bVal = parseFloat(b.amount)
          break
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [flaggedTransactions, filter, searchTerm, sortField, sortOrder])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = flaggedTransactions.length
    const pending = flaggedTransactions.filter(tx => tx.reviewStatus === 'pending').length
    const approved = flaggedTransactions.filter(tx => tx.reviewStatus === 'approved').length
    const rejected = flaggedTransactions.filter(tx => tx.reviewStatus === 'rejected').length
    const escalated = flaggedTransactions.filter(tx => tx.reviewStatus === 'escalated').length
    const avgRiskScore = total > 0
      ? flaggedTransactions.reduce((sum, tx) => sum + tx.riskScore.overall, 0) / total
      : 0

    return { total, pending, approved, rejected, escalated, avgRiskScore }
  }, [flaggedTransactions])

  async function handleReview(
    txId: string | number,
    decision: 'approve' | 'reject' | 'escalate',
    notes: string
  ) {
    try {
      // In production, send to API
      // await fetch('/api/fraud/review', {
      //   method: 'POST',
      //   body: JSON.stringify({ txId, decision, notes })
      // })

      // Update local state
      setFlaggedTransactions(prev =>
        prev.map(tx =>
          tx.id === txId
            ? {
                ...tx,
                reviewStatus: decision === 'approve' ? 'approved' : 
                             decision === 'reject' ? 'rejected' : 'escalated',
                reviewedBy: 'Current User',
                reviewedAt: new Date(),
                reviewNotes: notes
              }
            : tx
        )
      )

      setSelectedTx(null)
    } catch (error) {
      console.error('Review failed:', error)
      alert('Failed to submit review')
    }
  }

  function exportToCSV() {
    const headers = ['ID', 'Date', 'Recipient', 'Amount', 'Anomaly Score', 'Risk Score', 'Status', 'Reasons']
    const rows = filteredTransactions.map(tx => [
      tx.id,
      format(new Date(tx.flaggedAt), 'yyyy-MM-dd HH:mm:ss'),
      tx.recipient,
      tx.amount,
      tx.anomalyScore.score,
      tx.riskScore.overall,
      tx.reviewStatus,
      tx.anomalyScore.reasons.join('; ')
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fraud-review-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fraud Review Queue
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Review and manage flagged transactions
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard
          label="Total Flagged"
          value={stats.total}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-gray-600"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
          color="text-yellow-600"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={<CheckCircle className="w-5 h-5" />}
          color="text-green-600"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={<XCircle className="w-5 h-5" />}
          color="text-red-600"
        />
        <StatCard
          label="Escalated"
          value={stats.escalated}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-orange-600"
        />
        <StatCard
          label="Avg Risk"
          value={`${stats.avgRiskScore.toFixed(0)}/100`}
          icon={<Shield className="w-5 h-5" />}
          color="text-blue-600"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, recipient, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected', 'escalated'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Anomaly Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {tx.recipient.slice(0, 10)}...{tx.recipient.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {format(new Date(tx.flaggedAt), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${parseFloat(tx.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              tx.anomalyScore.score >= 80 ? 'bg-red-600' :
                              tx.anomalyScore.score >= 60 ? 'bg-orange-600' :
                              tx.anomalyScore.score >= 40 ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${tx.anomalyScore.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {tx.anomalyScore.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(tx.riskScore.level)}`}>
                        {tx.riskScore.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.reviewStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        tx.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        tx.reviewStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {tx.reviewStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedTx && (
        <ReviewModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onReview={handleReview}
        />
      )}
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ label, value, icon, color }: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`${color}`}>{icon}</div>
      </div>
    </div>
  )
}

function ReviewModal({ transaction, onClose, onReview }: {
  transaction: FlaggedTransaction
  onClose: () => void
  onReview: (txId: string | number, decision: 'approve' | 'reject' | 'escalate', notes: string) => void
}) {
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(decision: 'approve' | 'reject' | 'escalate') {
    if (!notes.trim() && decision !== 'approve') {
      alert('Please provide notes for this decision')
      return
    }

    setSubmitting(true)
    try {
      await onReview(transaction.id, decision, notes)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Transaction Review
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
              <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{transaction.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">${parseFloat(transaction.amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recipient</p>
              <p className="font-mono text-xs text-gray-900 dark:text-white break-all">{transaction.recipient}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Flagged At</p>
              <p className="text-sm text-gray-900 dark:text-white">{format(new Date(transaction.flaggedAt), 'PPpp')}</p>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Anomaly Score</p>
              <p className="text-3xl font-bold text-red-600">{transaction.anomalyScore.score}/100</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{transaction.anomalyScore.severity}</p>
            </div>
            <div className="card bg-orange-50 dark:bg-orange-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Risk Score</p>
              <p className="text-3xl font-bold text-orange-600">{transaction.riskScore.overall}/100</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{transaction.riskScore.level}</p>
            </div>
            <div className="card bg-yellow-50 dark:bg-yellow-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Velocity Check</p>
              <p className="text-3xl font-bold text-yellow-600">{transaction.velocityCheck.violations.length}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">violations</p>
            </div>
          </div>

          {/* Reasons */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Flagged Reasons</h4>
            <div className="space-y-2">
              {transaction.anomalyScore.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="input w-full"
              placeholder="Add your review notes here..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('approve')}
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Approve Transaction
            </button>
            <button
              onClick={() => handleSubmit('reject')}
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <XCircle className="w-5 h-5 inline mr-2" />
              Reject Transaction
            </button>
            <button
              onClick={() => handleSubmit('escalate')}
              disabled={submitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Escalate to Senior
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// DEMO DATA GENERATOR
// ============================================================================

function generateDemoFlaggedTransactions(): FlaggedTransaction[] {
  const fraudEngine = new FraudDetectionEngine()
  const riskEngine = new RiskScoringEngine()
  const velocityMonitor = new VelocityMonitor()

  const demoTxs: Transaction[] = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      amount: '15000',
      recipient: '0x1234567890123456789012345678901234567890',
      description: 'Large unusual payment',
      category: 'Unknown'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      amount: '50000',
      recipient: '0x0000000000000000000000000000000000000000',
      description: 'Payment to null address',
      category: 'Suspicious'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      amount: '10000',
      recipient: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      description: 'Round number payment',
      category: 'Services'
    }
  ]

  return demoTxs.map(tx => {
    const anomalyScore = fraudEngine.analyze(tx)
    const riskScore = riskEngine.calculateRiskScore(tx, anomalyScore)
    const velocityCheck = velocityMonitor.checkTransaction(tx)

    return {
      ...tx,
      flaggedAt: new Date(tx.timestamp),
      anomalyScore,
      riskScore,
      velocityCheck,
      reviewStatus: 'pending'
    }
  })
}