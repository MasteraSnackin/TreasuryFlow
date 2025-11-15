'use client'

import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface RateLimitStatus {
  identifier: string
  count: number
  resetTime: number
  limit: number
}

export default function RateLimitMonitor() {
  const [status, setStatus] = useState<RateLimitStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  async function loadStatus() {
    try {
      const response = await fetch('/api/rate-limit-status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to load rate limit status:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatTimeRemaining(resetTime: number): string {
    const now = Date.now()
    const remaining = Math.max(0, resetTime - now)
    const seconds = Math.floor(remaining / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  function getStatusColor(count: number, limit: number): string {
    const percentage = (count / limit) * 100
    if (percentage >= 90) return 'text-red-600 bg-red-50 border-red-200'
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  function getStatusIcon(count: number, limit: number) {
    const percentage = (count / limit) * 100
    if (percentage >= 90) return <AlertTriangle className="w-5 h-5" />
    if (percentage >= 70) return <Clock className="w-5 h-5" />
    return <CheckCircle className="w-5 h-5" />
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-gray-400 animate-pulse" />
          <h3 className="text-lg font-semibold">Rate Limit Monitor</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Rate Limit Monitor</h3>
        </div>
        <span className="text-xs text-gray-500">Live • Updates every 5s</span>
      </div>

      {status.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active rate limits</p>
        </div>
      ) : (
        <div className="space-y-3">
          {status.map((item, index) => {
            const percentage = (item.count / item.limit) * 100
            const remaining = item.limit - item.count
            
            return (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(item.count, item.limit)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.count, item.limit)}
                    <span className="font-mono text-sm font-medium">
                      {item.identifier}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {item.count} / {item.limit}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white dark:bg-gray-800 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      percentage >= 90
                        ? 'bg-red-600'
                        : percentage >= 70
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span>{remaining} requests remaining</span>
                  <span>Resets in {formatTimeRemaining(item.resetTime)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Normal (&lt;70%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
            <span>Warning (70-90%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Critical (&gt;90%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}