'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, Calendar, DollarSign, Users, Target } from 'lucide-react'
import { SpendingAnalyzer, generateMockTransactions } from '@/lib/spendingAnalysis'

export default function SpendingPatterns() {
  const [analyzer] = useState(() => {
    const a = new SpendingAnalyzer()
    a.addTransactions(generateMockTransactions(100))
    return a
  })

  const [patterns, setPatterns] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [optimizations, setOptimizations] = useState<any[]>([])
  const [velocity, setVelocity] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate analysis delay
    setTimeout(() => {
      setPatterns(analyzer.identifyPatterns())
      setInsights(analyzer.getCategoryInsights())
      setOptimizations(analyzer.findOptimizations())
      setVelocity(analyzer.getSpendingVelocity(30))
      setForecast(analyzer.forecastSpending(3))
      setLoading(false)
    }, 1000)
  }, [analyzer])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card h-64 animate-pulse bg-gray-200" />
        <div className="card h-64 animate-pulse bg-gray-200" />
      </div>
    )
  }

  const totalSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Patterns Found</p>
              <p className="text-2xl font-bold">{patterns.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Potential Savings</p>
              <p className="text-2xl font-bold">${totalSavings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Velocity</p>
              <p className="text-2xl font-bold">${velocity?.daily.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Opportunities</p>
              <p className="text-2xl font-bold">{optimizations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Velocity Alert */}
      {velocity && velocity.trend !== 'stable' && (
        <div className={`card border-2 ${
          velocity.trend === 'accelerating' ? 'border-orange-300 bg-orange-50' : 'border-green-300 bg-green-50'
        }`}>
          <div className="flex items-start gap-3">
            {velocity.trend === 'accelerating' ? (
              <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            ) : (
              <TrendingDown className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Spending {velocity.trend === 'accelerating' ? 'Accelerating' : 'Decelerating'}
              </h3>
              <p className="text-sm text-gray-700">
                Your spending rate is {velocity.trend === 'accelerating' ? 'increasing' : 'decreasing'} compared to the previous period.
                Current monthly run rate: <strong>${velocity.monthly.toLocaleString()}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Opportunities */}
      {optimizations.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold">Optimization Opportunities</h2>
            <span className="ml-auto text-sm text-gray-600">
              Total potential savings: <strong className="text-green-600">${totalSavings.toLocaleString()}</strong>
            </span>
          </div>

          <div className="space-y-4">
            {optimizations.map((opt, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  opt.priority === 'high' ? 'border-red-200 bg-red-50' :
                  opt.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        opt.priority === 'high' ? 'bg-red-200 text-red-800' :
                        opt.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {opt.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-600 uppercase tracking-wide">
                        {opt.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{opt.category}</h3>
                    <p className="text-sm text-gray-700 mt-1">{opt.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-600">Potential Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${opt.potentialSavings.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-sm font-medium text-gray-700 mb-2">Action Items:</p>
                  <ul className="space-y-1">
                    {opt.actionItems.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending Patterns */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Identified Spending Patterns
        </h2>

        <div className="space-y-3">
          {patterns.map((pattern, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    pattern.type === 'recurring' ? 'bg-green-500' :
                    pattern.type === 'seasonal' ? 'bg-blue-500' :
                    pattern.type === 'irregular' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <h3 className="font-semibold text-gray-900">{pattern.category}</h3>
                  <span className="text-xs px-2 py-1 bg-white rounded border border-gray-300">
                    {pattern.type}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Frequency</p>
                    <p className="text-sm font-medium">{pattern.frequency}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Avg Amount</p>
                    <p className="text-sm font-medium">${pattern.averageAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Confidence</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-4 rounded-full ${
                            i < Math.floor(pattern.confidence * 5)
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {pattern.nextExpected && (
                <p className="text-sm text-gray-600 mt-2">
                  Next expected: <strong>{new Date(pattern.nextExpected).toLocaleDateString()}</strong>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Category Insights */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          Category Insights
        </h2>

        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{insight.category}</h3>
                    {insight.trend !== 'stable' && (
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        insight.trend === 'increasing' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {insight.trend === 'increasing' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(insight.trendPercentage).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Spent</p>
                      <p className="font-semibold">${insight.totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Transactions</p>
                      <p className="font-semibold">{insight.transactionCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg Transaction</p>
                      <p className="font-semibold">${insight.averageTransaction.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {insight.topSuppliers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-sm font-medium text-gray-700 mb-2">Top Suppliers:</p>
                  <div className="space-y-2">
                    {insight.topSuppliers.slice(0, 3).map((supplier: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{supplier.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${supplier.percentage}%` }}
                            />
                          </div>
                          <span className="text-gray-600 w-16 text-right">
                            ${supplier.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Spending Forecast */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          3-Month Spending Forecast
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {forecast.map((month, index) => (
            <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">{month.month}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                ${month.predicted.toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Confidence:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-3 rounded-full ${
                        i < Math.floor(month.confidence * 5)
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}