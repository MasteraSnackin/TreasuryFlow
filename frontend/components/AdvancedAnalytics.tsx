'use client'

import { useState, useEffect } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Filter
} from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface AnalyticsData {
  cashFlow: {
    labels: string[]
    inflow: number[]
    outflow: number[]
  }
  spending: {
    categories: string[]
    amounts: number[]
  }
  trends: {
    totalSpent: number
    avgTransaction: number
    largestPayment: number
    paymentCount: number
    monthlyChange: number
  }
  forecast: {
    labels: string[]
    predicted: number[]
    confidence: number[]
  }
}

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  async function loadAnalytics() {
    setLoading(true)
    
    // Simulate API call - replace with real data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockData: AnalyticsData = generateMockData(timeRange)
    setData(mockData)
    setLoading(false)
  }

  function generateMockData(range: string): AnalyticsData {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i - 1))
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    return {
      cashFlow: {
        labels,
        inflow: labels.map(() => Math.random() * 5000 + 1000),
        outflow: labels.map(() => Math.random() * 4000 + 500)
      },
      spending: {
        categories: ['Suppliers', 'Salaries', 'Infrastructure', 'Marketing', 'Operations'],
        amounts: [45000, 32000, 18000, 12000, 8000]
      },
      trends: {
        totalSpent: 115000,
        avgTransaction: 2875,
        largestPayment: 15000,
        paymentCount: 40,
        monthlyChange: 12.5
      },
      forecast: {
        labels: Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() + i)
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }),
        predicted: Array.from({ length: 30 }, () => Math.random() * 3000 + 2000),
        confidence: Array.from({ length: 30 }, () => Math.random() * 500 + 200)
      }
    }
  }

  function exportData() {
    if (!data) return
    
    const csv = [
      ['Date', 'Inflow', 'Outflow'],
      ...data.cashFlow.labels.map((label, i) => [
        label,
        data.cashFlow.inflow[i].toFixed(2),
        data.cashFlow.outflow[i].toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `treasury-analytics-${timeRange}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="card h-64 animate-pulse bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card h-96 animate-pulse bg-gray-200" />
          <div className="card h-96 animate-pulse bg-gray-200" />
        </div>
      </div>
    )
  }

  const cashFlowData = {
    labels: data.cashFlow.labels,
    datasets: [
      {
        label: 'Inflow',
        data: data.cashFlow.inflow,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Outflow',
        data: data.cashFlow.outflow,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const spendingData = {
    labels: data.spending.categories,
    datasets: [{
      data: data.spending.amounts,
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderWidth: 0
    }]
  }

  const forecastData = {
    labels: data.forecast.labels,
    datasets: [
      {
        label: 'Predicted Spending',
        data: data.forecast.predicted,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Confidence Range',
        data: data.forecast.predicted.map((val, i) => val + data.forecast.confidence[i]),
        borderColor: 'rgba(99, 102, 241, 0.3)',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        fill: '-1',
        tension: 0.4,
        borderDash: [5, 5]
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive treasury insights and forecasting</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>

          <button
            onClick={exportData}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Spent</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${data.trends.totalSpent.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {data.trends.monthlyChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              data.trends.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(data.trends.monthlyChange)}%
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Transaction</span>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${data.trends.avgTransaction.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Across {data.trends.paymentCount} payments
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Largest Payment</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${data.trends.largestPayment.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This period
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Payment Count</span>
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.trends.paymentCount}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Total transactions
          </p>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Cash Flow Analysis</h3>
        <div style={{ height: '300px' }}>
          <Line
            data={cashFlowData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                tooltip: {
                  mode: 'index' as const,
                  intersect: false,
                  callbacks: {
                    label: (context) => {
                      const value = context.parsed.y ?? 0
                      return `${context.dataset.label}: $${value.toLocaleString()}`
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `$${value.toLocaleString()}`
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Spending Breakdown & Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <div style={{ height: '300px' }} className="flex items-center justify-center">
            <Doughnut
              data={spendingData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                        const percentage = ((context.parsed / total) * 100).toFixed(1)
                        return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* 30-Day Forecast */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">30-Day Spending Forecast</h3>
            <span className="text-xs text-gray-500">ML-Powered</span>
          </div>
          <div style={{ height: '300px' }}>
            <Line
              data={forecastData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    mode: 'index' as const,
                    intersect: false,
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed.y ?? 0
                        return `${context.dataset.label}: $${value.toLocaleString()}`
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value.toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 AI Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
            <p className="text-blue-800">
              Your spending has increased by {data.trends.monthlyChange}% compared to last month. 
              Consider reviewing supplier contracts for potential savings.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
            <p className="text-blue-800">
              Supplier payments account for 39% of total spending. 
              Batch processing could save approximately $450/month in gas fees.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
            <p className="text-blue-800">
              Based on current trends, projected spending for next month is ${(data.trends.totalSpent * 1.125).toLocaleString()}.
              Ensure sufficient liquidity to cover obligations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}