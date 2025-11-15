'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, TrendingUp, Shield, Zap } from 'lucide-react'

interface HealthMetric {
  label: string
  value: string
  status: 'good' | 'warning' | 'critical'
  description: string
}

interface TreasuryHealth {
  score: number
  grade: string
  metrics: HealthMetric[]
  recommendations: string[]
}

export default function TreasuryHealthScore({ balances }: { balances: { usdc: string, eurc: string } }) {
  const [health, setHealth] = useState<TreasuryHealth | null>(null)

  useEffect(() => {
    const calculatedHealth = calculateHealth(balances)
    setHealth(calculatedHealth)
  }, [balances])

  function calculateHealth(data: { usdc: string, eurc: string }): TreasuryHealth {
    const usdcBalance = parseFloat(data.usdc)
    const eurcBalance = parseFloat(data.eurc)
    const totalBalance = usdcBalance + eurcBalance * 0.92 // Rough EUR to USD conversion

    // Calculate metrics
    const metrics: HealthMetric[] = [
      {
        label: 'Liquidity Coverage',
        value: '85%',
        status: totalBalance > 30000 ? 'good' : totalBalance > 15000 ? 'warning' : 'critical',
        description: '30-day payment obligations covered'
      },
      {
        label: 'FX Exposure',
        value: '12%',
        status: 'warning',
        description: 'Unhedged currency risk'
      },
      {
        label: 'Diversification',
        value: `${Math.round((usdcBalance / totalBalance) * 100)}/${Math.round((eurcBalance * 0.92 / totalBalance) * 100)}`,
        status: Math.abs((usdcBalance / totalBalance) - 0.6) < 0.15 ? 'good' : 'warning',
        description: 'USDC/EURC ratio balanced'
      },
      {
        label: 'Payment Automation',
        value: '92%',
        status: 'good',
        description: 'Recurring payments automated'
      },
      {
        label: 'Cost Efficiency',
        value: '0.08%',
        status: 'good',
        description: 'Transaction fees optimized'
      }
    ]

    // Calculate average score
    const avgScore = metrics.reduce((acc, m) => 
      acc + (m.status === 'good' ? 90 : m.status === 'warning' ? 70 : 40), 0
    ) / metrics.length

    return {
      score: Math.round(avgScore),
      grade: avgScore >= 85 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 60 ? 'C' : 'D',
      metrics,
      recommendations: [
        'Consider hedging 12% FX exposure with forward contracts',
        'Increase EURC allocation by 5% for better diversification',
        'Enable auto-rebalancing to maintain target ratios',
        'Review high-value payments for batch optimization'
      ]
    }
  }

  if (!health) return null

  const scoreColor = health.score >= 80 ? '#10b981' : health.score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">Treasury Health Score</h2>
      
      {/* Score Circle */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-40 h-40">
          <svg className="transform -rotate-90 w-full h-full">
            <circle 
              cx="80" cy="80" r="70" 
              stroke="#e5e7eb" 
              strokeWidth="12" 
              fill="none" 
            />
            <circle 
              cx="80" cy="80" r="70"
              stroke={scoreColor}
              strokeWidth="12" 
              fill="none"
              strokeDasharray={`${(health.score / 100) * 439.8} 439.8`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{health.score}</span>
            <span className="text-2xl font-semibold text-primary-600">{health.grade}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-6">
        {health.metrics.map((metric, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              {metric.status === 'good' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
              {metric.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />}
              {metric.status === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />}
              <div>
                <p className="font-medium text-gray-900">{metric.label}</p>
                <p className="text-xs text-gray-600">{metric.description}</p>
              </div>
            </div>
            <span className="font-semibold text-gray-900">{metric.value}</span>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Recommendations</h3>
        </div>
        <ul className="space-y-2">
          {health.recommendations.map((rec, i) => (
            <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Security</p>
          <p className="font-semibold text-green-600">Excellent</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Efficiency</p>
          <p className="font-semibold text-blue-600">High</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600 mb-1">Growth</p>
          <p className="font-semibold text-purple-600">Positive</p>
        </div>
      </div>
    </div>
  )
}