'use client'

import { useState } from 'react'
import { Star, TrendingUp, Clock, DollarSign, AlertTriangle, CheckCircle, Award, BarChart3 } from 'lucide-react'

interface SupplierMetrics {
  id: string
  name: string
  category: string
  totalPaid: number
  transactionCount: number
  averageAmount: number
  onTimePayments: number
  latePayments: number
  reliabilityScore: number
  costEfficiency: number
  responseTime: number // hours
  qualityScore: number
  overallScore: number
  trend: 'improving' | 'declining' | 'stable'
  lastPayment: Date
  nextPayment: Date | null
}

export default function SupplierPerformance() {
  const [suppliers] = useState<SupplierMetrics[]>([
    {
      id: '1',
      name: 'Design Agency Ltd',
      category: 'Design',
      totalPaid: 45000,
      transactionCount: 18,
      averageAmount: 2500,
      onTimePayments: 17,
      latePayments: 1,
      reliabilityScore: 94,
      costEfficiency: 88,
      responseTime: 4,
      qualityScore: 92,
      overallScore: 91,
      trend: 'improving',
      lastPayment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextPayment: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'EU Software GmbH',
      category: 'Development',
      totalPaid: 82000,
      transactionCount: 24,
      averageAmount: 3417,
      onTimePayments: 24,
      latePayments: 0,
      reliabilityScore: 100,
      costEfficiency: 95,
      responseTime: 2,
      qualityScore: 98,
      overallScore: 98,
      trend: 'stable',
      lastPayment: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextPayment: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Cloud Services Inc',
      category: 'Infrastructure',
      totalPaid: 12750,
      transactionCount: 15,
      averageAmount: 850,
      onTimePayments: 13,
      latePayments: 2,
      reliabilityScore: 87,
      costEfficiency: 78,
      responseTime: 12,
      qualityScore: 85,
      overallScore: 83,
      trend: 'declining',
      lastPayment: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      nextPayment: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      name: 'Marketing Pro Agency',
      category: 'Marketing',
      totalPaid: 28500,
      transactionCount: 12,
      averageAmount: 2375,
      onTimePayments: 11,
      latePayments: 1,
      reliabilityScore: 92,
      costEfficiency: 85,
      responseTime: 6,
      qualityScore: 89,
      overallScore: 89,
      trend: 'improving',
      lastPayment: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      nextPayment: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
    }
  ])

  const [selectedSupplier, setSelectedSupplier] = useState<SupplierMetrics | null>(null)
  const [sortBy, setSortBy] = useState<'score' | 'spending' | 'reliability'>('score')

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (sortBy === 'score') return b.overallScore - a.overallScore
    if (sortBy === 'spending') return b.totalPaid - a.totalPaid
    return b.reliabilityScore - a.reliabilityScore
  })

  const totalSpent = suppliers.reduce((sum, s) => sum + s.totalPaid, 0)
  const avgScore = suppliers.reduce((sum, s) => sum + s.overallScore, 0) / suppliers.length
  const topPerformer = suppliers.reduce((top, s) => s.overallScore > top.overallScore ? s : top)

  function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  function getScoreBgColor(score: number): string {
    if (score >= 90) return 'bg-green-100'
    if (score >= 75) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold">{avgScore.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Performer</p>
              <p className="text-lg font-bold truncate">{topPerformer.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('score')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'score'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overall Score
            </button>
            <button
              onClick={() => setSortBy('spending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'spending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Total Spending
            </button>
            <button
              onClick={() => setSortBy('reliability')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'reliability'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reliability
            </button>
          </div>
        </div>
      </div>

      {/* Supplier List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedSupplier(supplier)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{supplier.name}</h3>
                  {supplier.trend === 'improving' && (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  )}
                  {supplier.trend === 'declining' && (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{supplier.category}</p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getScoreBgColor(supplier.overallScore)}`}>
                <span className={`text-2xl font-bold ${getScoreColor(supplier.overallScore)}`}>
                  {supplier.overallScore}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Total Paid</span>
                </div>
                <p className="font-semibold text-gray-900">${supplier.totalPaid.toLocaleString()}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Reliability</span>
                </div>
                <p className={`font-semibold ${getScoreColor(supplier.reliabilityScore)}`}>
                  {supplier.reliabilityScore}%
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Response Time</span>
                </div>
                <p className="font-semibold text-gray-900">{supplier.responseTime}h</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Quality</span>
                </div>
                <p className={`font-semibold ${getScoreColor(supplier.qualityScore)}`}>
                  {supplier.qualityScore}%
                </p>
              </div>
            </div>

            {/* Score Bars */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Reliability</span>
                  <span className="font-medium">{supplier.reliabilityScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${supplier.reliabilityScore >= 90 ? 'bg-green-500' : supplier.reliabilityScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${supplier.reliabilityScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Cost Efficiency</span>
                  <span className="font-medium">{supplier.costEfficiency}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${supplier.costEfficiency >= 90 ? 'bg-green-500' : supplier.costEfficiency >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${supplier.costEfficiency}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Quality Score</span>
                  <span className="font-medium">{supplier.qualityScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${supplier.qualityScore >= 90 ? 'bg-green-500' : supplier.qualityScore >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${supplier.qualityScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-600">Last Payment</p>
                <p className="font-medium">{supplier.lastPayment.toLocaleDateString()}</p>
              </div>
              {supplier.nextPayment && (
                <div className="text-right">
                  <p className="text-gray-600">Next Payment</p>
                  <p className="font-medium">{supplier.nextPayment.toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedSupplier.name}
                  </h2>
                  <p className="text-gray-600">{selectedSupplier.category}</p>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Overall Score */}
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Overall Performance Score</p>
                    <p className="text-4xl font-bold text-blue-600">{selectedSupplier.overallScore}</p>
                  </div>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreBgColor(selectedSupplier.overallScore)}`}>
                    <Award className={`w-12 h-12 ${getScoreColor(selectedSupplier.overallScore)}`} />
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Performance Breakdown</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Total Transactions</p>
                    <p className="text-2xl font-bold">{selectedSupplier.transactionCount}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Average Amount</p>
                    <p className="text-2xl font-bold">${selectedSupplier.averageAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">On-Time Payments</p>
                    <p className="text-2xl font-bold text-green-600">{selectedSupplier.onTimePayments}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Late Payments</p>
                    <p className="text-2xl font-bold text-red-600">{selectedSupplier.latePayments}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Recommendations</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  {selectedSupplier.overallScore >= 90 && (
                    <>
                      <li>• Excellent performance - consider increasing contract value</li>
                      <li>• Negotiate volume discounts for long-term partnership</li>
                      <li>• Use as benchmark for other suppliers</li>
                    </>
                  )}
                  {selectedSupplier.overallScore >= 75 && selectedSupplier.overallScore < 90 && (
                    <>
                      <li>• Good performance with room for improvement</li>
                      <li>• Schedule quarterly review meetings</li>
                      <li>• Set clear KPIs for next period</li>
                    </>
                  )}
                  {selectedSupplier.overallScore < 75 && (
                    <>
                      <li>• Performance below expectations - immediate review needed</li>
                      <li>• Consider alternative suppliers</li>
                      <li>• Implement performance improvement plan</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button className="btn-primary flex-1">
                  Schedule Payment
                </button>
                <button className="btn-secondary flex-1">
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}