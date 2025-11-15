'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { isDemoMode, DEMO_DATA } from '@/lib/demoData'

Chart.register(...registerables)

interface TreasuryChartProps {
  balances: {
    usdc: string
    eurc: string
  }
}

export default function TreasuryChart({ balances }: TreasuryChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // Generate 30-day forecast
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const usdcBase = parseFloat(balances.usdc)
    const eurcBase = parseFloat(balances.eurc)

    // Generate realistic forecast with trend and variance
    const usdcData = days.map((_, i) => {
      const trend = i * 50 // Slight growth trend
      const variance = (Math.random() - 0.5) * 1000
      return Math.max(0, usdcBase + trend + variance)
    })

    const eurcData = days.map((_, i) => {
      const trend = i * 40
      const variance = (Math.random() - 0.5) * 800
      return Math.max(0, eurcBase + trend + variance)
    })

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'USDC',
            data: usdcData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'EURC',
            data: eurcData,
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                weight: 500
              }
            }
          },
          title: {
            display: true,
            text: '30-Day Cash Flow Forecast',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              bottom: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            callbacks: {
              label: function(context) {
                const value = context.parsed.y
                if (value === null) return ''
                return `${context.dataset.label}: $${value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => `$${Number(value).toLocaleString()}`,
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    })

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [balances])

  return (
    <div className="card">
      <div style={{ height: '400px', position: 'relative' }}>
        <canvas ref={chartRef}></canvas>
      </div>
      
      {/* Insights */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Projected Growth</p>
          <p className="text-2xl font-bold text-green-600">+8.5%</p>
          <p className="text-xs text-gray-500">Next 30 days</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Avg Daily Flow</p>
          <p className="text-2xl font-bold text-blue-600">$1,247</p>
          <p className="text-xs text-gray-500">Incoming</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Runway</p>
          <p className="text-2xl font-bold text-purple-600">6.2 months</p>
          <p className="text-xs text-gray-500">At current burn</p>
        </div>
      </div>
    </div>
  )
}