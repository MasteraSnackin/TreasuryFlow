/**
 * TreasuryFlow - AI Fraud Detection System
 * Phase 5.4: Velocity Limits and Alerts
 * 
 * Real-time monitoring and enforcement of transaction velocity limits
 * to prevent rapid-fire fraudulent transactions
 */

import { Transaction } from './fraudDetection'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface VelocityLimit {
  id: string
  name: string
  enabled: boolean
  timeWindowMs: number // Time window in milliseconds
  maxTransactions: number // Max transactions in window
  maxAmount: number // Max total amount in window
  scope: 'global' | 'per-recipient' | 'per-category'
  action: 'alert' | 'block' | 'review'
  priority: number // 1-10 (10 = highest)
}

export interface VelocityCheck {
  passed: boolean
  violations: VelocityViolation[]
  currentMetrics: VelocityMetrics
  recommendation: string
}

export interface VelocityViolation {
  limitId: string
  limitName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  currentValue: number
  limitValue: number
  action: 'alert' | 'block' | 'review'
  timestamp: Date
}

export interface VelocityMetrics {
  transactionCount: number
  totalAmount: number
  uniqueRecipients: number
  avgTransactionSize: number
  timeWindowMs: number
}

export interface VelocityAlert {
  id: string
  type: 'velocity_exceeded' | 'suspicious_pattern' | 'rapid_fire'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  transaction?: Transaction
  metrics: VelocityMetrics
  violations: VelocityViolation[]
  timestamp: Date
  acknowledged: boolean
}

// ============================================================================
// DEFAULT VELOCITY LIMITS
// ============================================================================

export const DEFAULT_VELOCITY_LIMITS: VelocityLimit[] = [
  {
    id: 'global-1h-count',
    name: 'Global Hourly Transaction Limit',
    enabled: true,
    timeWindowMs: 60 * 60 * 1000, // 1 hour
    maxTransactions: 50,
    maxAmount: 100000,
    scope: 'global',
    action: 'alert',
    priority: 7
  },
  {
    id: 'global-1h-amount',
    name: 'Global Hourly Amount Limit',
    enabled: true,
    timeWindowMs: 60 * 60 * 1000,
    maxTransactions: Infinity,
    maxAmount: 250000,
    scope: 'global',
    action: 'review',
    priority: 8
  },
  {
    id: 'global-5m-rapid',
    name: 'Rapid Fire Detection (5 min)',
    enabled: true,
    timeWindowMs: 5 * 60 * 1000, // 5 minutes
    maxTransactions: 10,
    maxAmount: 50000,
    scope: 'global',
    action: 'block',
    priority: 10
  },
  {
    id: 'recipient-1h',
    name: 'Per-Recipient Hourly Limit',
    enabled: true,
    timeWindowMs: 60 * 60 * 1000,
    maxTransactions: 5,
    maxAmount: 50000,
    scope: 'per-recipient',
    action: 'alert',
    priority: 6
  },
  {
    id: 'recipient-24h',
    name: 'Per-Recipient Daily Limit',
    enabled: true,
    timeWindowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxTransactions: 20,
    maxAmount: 200000,
    scope: 'per-recipient',
    action: 'review',
    priority: 7
  },
  {
    id: 'category-1h',
    name: 'Per-Category Hourly Limit',
    enabled: true,
    timeWindowMs: 60 * 60 * 1000,
    maxTransactions: 30,
    maxAmount: 100000,
    scope: 'per-category',
    action: 'alert',
    priority: 5
  }
]

// ============================================================================
// VELOCITY MONITOR
// ============================================================================

export class VelocityMonitor {
  private limits: VelocityLimit[]
  private transactionHistory: Transaction[]
  private alerts: VelocityAlert[]
  private alertCallbacks: Array<(alert: VelocityAlert) => void>

  constructor(customLimits?: VelocityLimit[]) {
    this.limits = customLimits || DEFAULT_VELOCITY_LIMITS
    this.transactionHistory = []
    this.alerts = []
    this.alertCallbacks = []
  }

  /**
   * Initialize with historical transactions
   */
  initialize(transactions: Transaction[]): void {
    this.transactionHistory = transactions.map(t => ({
      ...t,
      timestamp: new Date(t.timestamp)
    }))
  }

  /**
   * Check if a transaction violates velocity limits
   */
  checkTransaction(transaction: Transaction): VelocityCheck {
    const violations: VelocityViolation[] = []
    const now = new Date(transaction.timestamp)

    // Check each enabled limit
    for (const limit of this.limits.filter(l => l.enabled)) {
      const violation = this.checkLimit(transaction, limit, now)
      if (violation) {
        violations.push(violation)
      }
    }

    // Calculate current metrics
    const currentMetrics = this.calculateMetrics(transaction, now)

    // Determine if check passed
    const blockingViolations = violations.filter(v => v.action === 'block')
    const passed = blockingViolations.length === 0

    // Generate recommendation
    const recommendation = this.generateRecommendation(violations, passed)

    // Create alerts for violations
    if (violations.length > 0) {
      this.createAlert(transaction, violations, currentMetrics)
    }

    return {
      passed,
      violations,
      currentMetrics,
      recommendation
    }
  }

  /**
   * Check a specific velocity limit
   */
  private checkLimit(
    transaction: Transaction,
    limit: VelocityLimit,
    now: Date
  ): VelocityViolation | null {
    const windowStart = new Date(now.getTime() - limit.timeWindowMs)

    // Get relevant transactions based on scope
    let relevantTxs = this.transactionHistory.filter(t => {
      const txTime = new Date(t.timestamp)
      return txTime >= windowStart && txTime <= now
    })

    // Apply scope filter
    if (limit.scope === 'per-recipient') {
      relevantTxs = relevantTxs.filter(t => t.recipient === transaction.recipient)
    } else if (limit.scope === 'per-category' && transaction.category) {
      relevantTxs = relevantTxs.filter(t => t.category === transaction.category)
    }

    // Check transaction count
    const txCount = relevantTxs.length + 1 // +1 for current transaction
    if (txCount > limit.maxTransactions) {
      return {
        limitId: limit.id,
        limitName: limit.name,
        severity: this.determineSeverity(limit.priority),
        message: `Transaction count (${txCount}) exceeds limit (${limit.maxTransactions}) in ${this.formatTimeWindow(limit.timeWindowMs)}`,
        currentValue: txCount,
        limitValue: limit.maxTransactions,
        action: limit.action,
        timestamp: now
      }
    }

    // Check total amount
    const totalAmount = relevantTxs.reduce((sum, t) => sum + parseFloat(t.amount), 0) + 
                       parseFloat(transaction.amount)
    
    if (totalAmount > limit.maxAmount) {
      return {
        limitId: limit.id,
        limitName: limit.name,
        severity: this.determineSeverity(limit.priority),
        message: `Total amount ($${totalAmount.toFixed(2)}) exceeds limit ($${limit.maxAmount.toFixed(2)}) in ${this.formatTimeWindow(limit.timeWindowMs)}`,
        currentValue: totalAmount,
        limitValue: limit.maxAmount,
        action: limit.action,
        timestamp: now
      }
    }

    return null
  }

  /**
   * Calculate current velocity metrics
   */
  private calculateMetrics(transaction: Transaction, now: Date): VelocityMetrics {
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const recentTxs = this.transactionHistory.filter(t => {
      const txTime = new Date(t.timestamp)
      return txTime >= oneHourAgo && txTime <= now
    })

    const transactionCount = recentTxs.length + 1
    const totalAmount = recentTxs.reduce((sum, t) => sum + parseFloat(t.amount), 0) + 
                       parseFloat(transaction.amount)
    const uniqueRecipients = new Set([...recentTxs.map(t => t.recipient), transaction.recipient]).size
    const avgTransactionSize = totalAmount / transactionCount

    return {
      transactionCount,
      totalAmount,
      uniqueRecipients,
      avgTransactionSize,
      timeWindowMs: 60 * 60 * 1000
    }
  }

  /**
   * Create alert for violations
   */
  private createAlert(
    transaction: Transaction,
    violations: VelocityViolation[],
    metrics: VelocityMetrics
  ): void {
    const highestSeverity = this.getHighestSeverity(violations)
    const alertType = this.determineAlertType(violations)

    const alert: VelocityAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: alertType,
      severity: highestSeverity,
      message: this.generateAlertMessage(violations),
      transaction,
      metrics,
      violations,
      timestamp: new Date(),
      acknowledged: false
    }

    this.alerts.push(alert)

    // Trigger callbacks
    this.alertCallbacks.forEach(callback => callback(alert))
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: VelocityAlert) => void): void {
    this.alertCallbacks.push(callback)
  }

  /**
   * Get all alerts
   */
  getAlerts(unacknowledgedOnly = false): VelocityAlert[] {
    if (unacknowledgedOnly) {
      return this.alerts.filter(a => !a.acknowledged)
    }
    return this.alerts
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      return true
    }
    return false
  }

  /**
   * Get velocity statistics
   */
  getStatistics(timeWindowMs: number = 24 * 60 * 60 * 1000): {
    totalTransactions: number
    totalAmount: number
    avgTransactionSize: number
    peakVelocity: number
    alertCount: number
  } {
    const now = Date.now()
    const windowStart = now - timeWindowMs

    const recentTxs = this.transactionHistory.filter(t => {
      const txTime = new Date(t.timestamp).getTime()
      return txTime >= windowStart && txTime <= now
    })

    const totalTransactions = recentTxs.length
    const totalAmount = recentTxs.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const avgTransactionSize = totalTransactions > 0 ? totalAmount / totalTransactions : 0

    // Calculate peak velocity (max transactions in any 1-hour window)
    let peakVelocity = 0
    const oneHour = 60 * 60 * 1000

    for (let i = 0; i < recentTxs.length; i++) {
      const txTime = new Date(recentTxs[i].timestamp).getTime()
      const windowEnd = txTime + oneHour
      const txsInWindow = recentTxs.filter(t => {
        const tTime = new Date(t.timestamp).getTime()
        return tTime >= txTime && tTime <= windowEnd
      }).length
      peakVelocity = Math.max(peakVelocity, txsInWindow)
    }

    const recentAlerts = this.alerts.filter(a => 
      a.timestamp.getTime() >= windowStart
    )

    return {
      totalTransactions,
      totalAmount,
      avgTransactionSize,
      peakVelocity,
      alertCount: recentAlerts.length
    }
  }

  /**
   * Update velocity limits
   */
  updateLimits(limits: VelocityLimit[]): void {
    this.limits = limits
  }

  /**
   * Add custom limit
   */
  addLimit(limit: VelocityLimit): void {
    this.limits.push(limit)
  }

  /**
   * Remove limit
   */
  removeLimit(limitId: string): boolean {
    const index = this.limits.findIndex(l => l.id === limitId)
    if (index !== -1) {
      this.limits.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Enable/disable limit
   */
  toggleLimit(limitId: string, enabled: boolean): boolean {
    const limit = this.limits.find(l => l.id === limitId)
    if (limit) {
      limit.enabled = enabled
      return true
    }
    return false
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private determineSeverity(priority: number): 'low' | 'medium' | 'high' | 'critical' {
    if (priority >= 9) return 'critical'
    if (priority >= 7) return 'high'
    if (priority >= 5) return 'medium'
    return 'low'
  }

  private getHighestSeverity(violations: VelocityViolation[]): 'low' | 'medium' | 'high' | 'critical' {
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
    let highest: 'low' | 'medium' | 'high' | 'critical' = 'low'

    for (const v of violations) {
      if (severityOrder[v.severity] > severityOrder[highest]) {
        highest = v.severity
      }
    }

    return highest
  }

  private determineAlertType(violations: VelocityViolation[]): VelocityAlert['type'] {
    const hasRapidFire = violations.some(v => v.limitId.includes('rapid'))
    if (hasRapidFire) return 'rapid_fire'

    const hasBlock = violations.some(v => v.action === 'block')
    if (hasBlock) return 'velocity_exceeded'

    return 'suspicious_pattern'
  }

  private generateAlertMessage(violations: VelocityViolation[]): string {
    if (violations.length === 1) {
      return violations[0].message
    }

    return `Multiple velocity limits exceeded: ${violations.map(v => v.limitName).join(', ')}`
  }

  private generateRecommendation(violations: VelocityViolation[], passed: boolean): string {
    if (passed && violations.length === 0) {
      return 'Transaction is within all velocity limits. Safe to proceed.'
    }

    const blockingViolations = violations.filter(v => v.action === 'block')
    if (blockingViolations.length > 0) {
      return `⛔ BLOCK TRANSACTION - ${blockingViolations.length} critical velocity limit(s) exceeded. Transaction must be blocked.`
    }

    const reviewViolations = violations.filter(v => v.action === 'review')
    if (reviewViolations.length > 0) {
      return `⚠️ MANUAL REVIEW REQUIRED - ${reviewViolations.length} velocity limit(s) exceeded. Transaction requires approval.`
    }

    return `ℹ️ ALERT ONLY - ${violations.length} velocity limit(s) exceeded. Transaction can proceed with monitoring.`
  }

  private formatTimeWindow(ms: number): string {
    const minutes = ms / (60 * 1000)
    const hours = ms / (60 * 60 * 1000)
    const days = ms / (24 * 60 * 60 * 1000)

    if (days >= 1) return `${days} day(s)`
    if (hours >= 1) return `${hours} hour(s)`
    return `${minutes} minute(s)`
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create velocity monitor with default limits
 */
export function createVelocityMonitor(
  transactions: Transaction[],
  customLimits?: VelocityLimit[]
): VelocityMonitor {
  const monitor = new VelocityMonitor(customLimits)
  monitor.initialize(transactions)
  return monitor
}

/**
 * Quick velocity check
 */
export function quickVelocityCheck(
  transaction: Transaction,
  historicalTransactions: Transaction[]
): VelocityCheck {
  const monitor = createVelocityMonitor(historicalTransactions)
  return monitor.checkTransaction(transaction)
}

/**
 * Get color for velocity alert severity
 */
export function getVelocityAlertColor(severity: string): string {
  const colors = {
    low: 'text-blue-600 bg-blue-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    critical: 'text-red-600 bg-red-50'
  }
  return colors[severity as keyof typeof colors] || 'text-gray-600 bg-gray-50'
}

/**
 * Format velocity metrics for display
 */
export function formatVelocityMetrics(metrics: VelocityMetrics): string {
  return `${metrics.transactionCount} txs, $${metrics.totalAmount.toFixed(2)} total, ${metrics.uniqueRecipients} recipients`
}