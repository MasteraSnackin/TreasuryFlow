/**
 * TreasuryFlow - AI Fraud Detection System
 * Phase 5.1: Anomaly Detection Algorithm
 * 
 * Advanced machine learning algorithms to detect fraudulent transactions
 * and suspicious patterns in real-time.
 */

import { format } from 'date-fns'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Transaction {
  id: number | string
  timestamp: Date | string
  amount: string
  recipient: string
  description: string
  category?: string
  currency?: string
  txHash?: string
}

export interface AnomalyScore {
  score: number // 0-100 (0 = normal, 100 = highly suspicious)
  confidence: number // 0-100
  reasons: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  flags: AnomalyFlag[]
}

export interface AnomalyFlag {
  type: AnomalyType
  description: string
  weight: number // 0-1
  evidence: any
}

export enum AnomalyType {
  UNUSUAL_AMOUNT = 'unusual_amount',
  UNUSUAL_RECIPIENT = 'unusual_recipient',
  UNUSUAL_TIME = 'unusual_time',
  UNUSUAL_FREQUENCY = 'unusual_frequency',
  VELOCITY_SPIKE = 'velocity_spike',
  ROUND_NUMBER = 'round_number',
  DUPLICATE_TRANSACTION = 'duplicate_transaction',
  NEW_RECIPIENT = 'new_recipient',
  BLACKLISTED = 'blacklisted',
  GEOGRAPHIC_ANOMALY = 'geographic_anomaly',
  PATTERN_BREAK = 'pattern_break'
}

export interface FraudDetectionConfig {
  zScoreThreshold: number // Standard deviations for outlier detection
  velocityWindowMinutes: number // Time window for velocity checks
  duplicateWindowMinutes: number // Time window for duplicate detection
  roundNumberThreshold: number // Percentage threshold for round numbers
  newRecipientRiskScore: number // Base risk score for new recipients
  enableMLDetection: boolean // Enable machine learning features
  enableBlacklistCheck: boolean // Enable blacklist checking
}

// ============================================================================
// FRAUD DETECTION ENGINE
// ============================================================================

export class FraudDetectionEngine {
  private config: FraudDetectionConfig
  private historicalData: Transaction[]
  private recipientHistory: Map<string, Transaction[]>
  private blacklist: Set<string>

  constructor(config?: Partial<FraudDetectionConfig>) {
    this.config = {
      zScoreThreshold: 3.0,
      velocityWindowMinutes: 60,
      duplicateWindowMinutes: 10,
      roundNumberThreshold: 0.8,
      newRecipientRiskScore: 30,
      enableMLDetection: true,
      enableBlacklistCheck: true,
      ...config
    }

    this.historicalData = []
    this.recipientHistory = new Map()
    this.blacklist = new Set()
  }

  /**
   * Train the model with historical transaction data
   */
  train(transactions: Transaction[]): void {
    this.historicalData = transactions.map(t => ({
      ...t,
      timestamp: new Date(t.timestamp)
    }))

    // Build recipient history
    this.recipientHistory.clear()
    for (const tx of this.historicalData) {
      const history = this.recipientHistory.get(tx.recipient) || []
      history.push(tx)
      this.recipientHistory.set(tx.recipient, history)
    }
  }

  /**
   * Add addresses to blacklist
   */
  addToBlacklist(addresses: string[]): void {
    addresses.forEach(addr => this.blacklist.add(addr.toLowerCase()))
  }

  /**
   * Analyze a transaction for anomalies
   */
  analyze(transaction: Transaction): AnomalyScore {
    const flags: AnomalyFlag[] = []

    // Run all detection algorithms
    if (this.config.enableBlacklistCheck) {
      const blacklistFlag = this.checkBlacklist(transaction)
      if (blacklistFlag) flags.push(blacklistFlag)
    }

    if (this.config.enableMLDetection) {
      flags.push(...this.detectAmountAnomalies(transaction))
      flags.push(...this.detectRecipientAnomalies(transaction))
      flags.push(...this.detectTimeAnomalies(transaction))
      flags.push(...this.detectFrequencyAnomalies(transaction))
      flags.push(...this.detectVelocityAnomalies(transaction))
      flags.push(...this.detectDuplicates(transaction))
      flags.push(...this.detectRoundNumbers(transaction))
      flags.push(...this.detectPatternBreaks(transaction))
    }

    // Calculate overall score
    const score = this.calculateAnomalyScore(flags)
    const confidence = this.calculateConfidence(flags)
    const severity = this.determineSeverity(score)
    const reasons = flags.map(f => f.description)

    return {
      score,
      confidence,
      reasons,
      severity,
      flags
    }
  }

  /**
   * Batch analyze multiple transactions
   */
  batchAnalyze(transactions: Transaction[]): Map<string | number, AnomalyScore> {
    const results = new Map<string | number, AnomalyScore>()
    
    for (const tx of transactions) {
      results.set(tx.id, this.analyze(tx))
    }

    return results
  }

  // ============================================================================
  // DETECTION ALGORITHMS
  // ============================================================================

  /**
   * Check if recipient is blacklisted
   */
  private checkBlacklist(tx: Transaction): AnomalyFlag | null {
    if (this.blacklist.has(tx.recipient.toLowerCase())) {
      return {
        type: AnomalyType.BLACKLISTED,
        description: 'Recipient is on blacklist',
        weight: 1.0,
        evidence: { recipient: tx.recipient }
      }
    }
    return null
  }

  /**
   * Detect unusual transaction amounts using Z-score
   */
  private detectAmountAnomalies(tx: Transaction): AnomalyFlag[] {
    const flags: AnomalyFlag[] = []
    
    if (this.historicalData.length < 10) return flags

    const amounts = this.historicalData.map(t => parseFloat(t.amount))
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const stdDev = Math.sqrt(
      amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length
    )

    const txAmount = parseFloat(tx.amount)
    const zScore = Math.abs((txAmount - mean) / stdDev)

    if (zScore > this.config.zScoreThreshold) {
      flags.push({
        type: AnomalyType.UNUSUAL_AMOUNT,
        description: `Amount is ${zScore.toFixed(1)}σ from average (${mean.toFixed(2)})`,
        weight: Math.min(zScore / 10, 0.9),
        evidence: { amount: txAmount, mean, stdDev, zScore }
      })
    }

    return flags
  }

  /**
   * Detect unusual recipients
   */
  private detectRecipientAnomalies(tx: Transaction): AnomalyFlag[] {
    const flags: AnomalyFlag[] = []
    
    const recipientTxs = this.recipientHistory.get(tx.recipient) || []
    
    // New recipient
    if (recipientTxs.length === 0) {
      flags.push({
        type: AnomalyType.NEW_RECIPIENT,
        description: 'First transaction to this recipient',
        weight: 0.3,
        evidence: { recipient: tx.recipient, previousCount: 0 }
      })
    }

    // Check if amount is unusual for this recipient
    if (recipientTxs.length >= 3) {
      const recipientAmounts = recipientTxs.map(t => parseFloat(t.amount))
      const avgAmount = recipientAmounts.reduce((a, b) => a + b, 0) / recipientAmounts.length
      const txAmount = parseFloat(tx.amount)
      
      const deviation = Math.abs(txAmount - avgAmount) / avgAmount

      if (deviation > 2.0) { // 200% deviation
        flags.push({
          type: AnomalyType.UNUSUAL_RECIPIENT,
          description: `Amount ${(deviation * 100).toFixed(0)}% different from usual for this recipient`,
          weight: Math.min(deviation / 5, 0.8),
          evidence: { amount: txAmount, avgAmount, deviation }
        })
      }
    }

    return flags
  }

  /**
   * Detect unusual transaction times
   */
  private detectTimeAnomalies(tx: Transaction): AnomalyFlag[] {
    const flags: AnomalyFlag[] = []
    
    if (this.historicalData.length < 20) return flags

    const txTime = new Date(tx.timestamp)
    const hour = txTime.getHours()

    // Analyze historical transaction times
    const hourCounts = new Array(24).fill(0)
    this.historicalData.forEach(t => {
      const h = new Date(t.timestamp).getHours()
      hourCounts[h]++
    })

    const avgCount = hourCounts.reduce((a, b) => a + b, 0) / 24
    const hourCount = hourCounts[hour]

    // Unusual time if this hour has <20% of average activity
    if (hourCount < avgCount * 0.2) {
      flags.push({
        type: AnomalyType.UNUSUAL_TIME,
        description: `Transaction at unusual time (${hour}:00)`,
        weight: 0.4,
        evidence: { hour, hourCount, avgCount }
      })
    }

    return flags
  }

  /**
   * Detect unusual transaction frequency
   */
  private detectFrequencyAnomalies(tx: Transaction): AnomalyFlag[] {
    const flags: AnomalyFlag[] = []
    
    const recipientTxs = this.recipientHistory.get(tx.recipient) || []
    
    if (recipientTxs.length < 2) return flags

    // Calculate average time between transactions
    const sortedTxs = [...recipientTxs].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    const intervals: number[] = []
    for (let i = 1; i < sortedTxs.length; i++) {
      const interval = new Date(sortedTxs[i].timestamp).getTime() - 
                      new Date(sortedTxs[i-1].timestamp).getTime()
      intervals.push(interval)
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const lastTx = sortedTxs[sortedTxs.length - 1]
    const currentInterval = new Date(tx.timestamp).getTime() - new Date(lastTx.timestamp).getTime()

    // Flag if current interval is <20% of average
    if (currentInterval < avgInterval * 0.2) {
      flags.push({
        type: AnomalyType.UNUSUAL_FREQUENCY,
        description: `Transaction much sooner than usual (${(currentInterval / 3600000).toFixed(1)}h vs avg ${(avgInterval / 3600000).toFixed(1)}h)`,
        weight: 0.5,
        evidence: { currentInterval, avgInterval }
      })
    }

    return flags
  }

  /**
   * Detect velocity spikes (many transactions in short time)
   */
  private detectVelocityAnomalies(tx: Transaction): AnomalyFlag[] {
    const flags: AnomalyFlag[] = []
    
    const txTime = new Date(tx.timestamp).getTime()
    const windowStart = txTime - (this.config.velocityWindowMinutes * 60 * 1000)

    // Count recent transactions
    const recentTxs = this.historicalData.filter(t => {
      const tTime = new Date(t.timestamp).getTime()
      return tTime >= windowStart && tTime <= txTime
    })

    const recentCount = recentTxs.length
    const recentTotal = recentTxs.reduce((sum, t) => sum + parseFloat(t.amount), 0)

    // Calculate normal velocity
    const totalTime = this.historicalData.length > 0 
      ? new Date(this.historicalData[this.historicalData.length - 1].timestamp).getTime() - 
        new Date(this.historicalData[0].timestamp).getTime()
      : 1

    const avgVelocity = (this.historicalData.length / totalTime) * (this.config.velocityWindowMinutes * 60 * 1000)

    if (recentCount > avgVelocity * 3) {
      flags.push({
        type: AnomalyType.VELOCITY_SPIKE,
        description: `High transaction velocity: ${recentCount} transactions in ${this.config.velocityWindowMinutes} minutes`,
        weight: 0.7,
        evidence: { recentCount, recentTotal, avgVelocity }
      })
    }

    return flags
  }

  /**
   * Detect duplicate transactions
   */
  private detectDuplicates(tx: Transaction): AnomalyFlag[] {
    const flags: AnomalyFlag[] = []
    
    const txTime = new Date(tx.timestamp).getTime()
    const windowStart = txTime - (this.config.duplicateWindowMinutes * 60 * 1000)

    const duplicates = this.historicalData.filter(t => {
      const tTime = new Date(t.timestamp).getTime()
      return tTime >= windowStart && 
             tTime <= txTime &&
             t.recipient === tx.recipient &&
             Math.abs(parseFloat(t.amount) - parseFloat(tx.amount)) < 0.01
    })

    if (duplicates.length > 0) {
      flags.push({
        type: AnomalyType.DUPLICATE_TRANSACTION,
        description: `Potential duplicate: ${duplicates.length} similar transaction(s) in last ${this.config.duplicateWindowMinutes} minutes`,
        weight: 0.8,
        evidence: { duplicates: duplicates.length, windowMinutes: this.config.duplicateWindowMinutes }
      })
    }

    return flags
  }

  /**
   * Detect suspiciously round numbers
   */
  private detectRoundNumbers(tx: Transaction): AnomalyFlag[] {
    const flags: AnomalyFlag[] = []
    
    const amount = parseFloat(tx.amount)
    
    // Check if amount is a round number (e.g., 1000, 5000, 10000)
    const roundNumbers = [100, 500, 1000, 5000, 10000, 50000, 100000]
    const isRound = roundNumbers.some(n => Math.abs(amount - n) < 0.01)

    if (isRound) {
      // Check what percentage of historical transactions are round
      const roundCount = this.historicalData.filter(t => {
        const amt = parseFloat(t.amount)
        return roundNumbers.some(n => Math.abs(amt - n) < 0.01)
      }).length

      const roundPercentage = this.historicalData.length > 0 
        ? roundCount / this.historicalData.length 
        : 0

      // Flag if round numbers are unusual for this account
      if (roundPercentage < this.config.roundNumberThreshold) {
        flags.push({
          type: AnomalyType.ROUND_NUMBER,
          description: `Suspiciously round amount (${amount})`,
          weight: 0.3,
          evidence: { amount, roundPercentage }
        })
      }
    }

    return flags
  }

  /**
   * Detect breaks in established patterns
   */
  private detectPatternBreaks(tx: Transaction): AnomalyFlag[] {
    const flags: AnomalyFlag[] = []
    
    if (this.historicalData.length < 30) return flags

    // Analyze day-of-week patterns
    const dayOfWeek = new Date(tx.timestamp).getDay()
    const dayCounts = new Array(7).fill(0)
    
    this.historicalData.forEach(t => {
      const day = new Date(t.timestamp).getDay()
      dayCounts[day]++
    })

    const avgDayCount = dayCounts.reduce((a, b) => a + b, 0) / 7
    const thisDayCount = dayCounts[dayOfWeek]

    // Flag if this day has <10% of average activity
    if (thisDayCount < avgDayCount * 0.1) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      flags.push({
        type: AnomalyType.PATTERN_BREAK,
        description: `Transaction on unusual day (${dayNames[dayOfWeek]})`,
        weight: 0.4,
        evidence: { dayOfWeek, thisDayCount, avgDayCount }
      })
    }

    return flags
  }

  // ============================================================================
  // SCORING & CLASSIFICATION
  // ============================================================================

  /**
   * Calculate overall anomaly score from flags
   */
  private calculateAnomalyScore(flags: AnomalyFlag[]): number {
    if (flags.length === 0) return 0

    // Weighted average of all flags
    const totalWeight = flags.reduce((sum, f) => sum + f.weight, 0)
    const weightedScore = flags.reduce((sum, f) => sum + (f.weight * 100), 0)

    return Math.min(Math.round(weightedScore / Math.max(totalWeight, 1)), 100)
  }

  /**
   * Calculate confidence in the anomaly detection
   */
  private calculateConfidence(flags: AnomalyFlag[]): number {
    if (flags.length === 0) return 100 // High confidence it's normal

    // More flags = higher confidence in anomaly
    // More historical data = higher confidence
    const flagConfidence = Math.min(flags.length * 20, 80)
    const dataConfidence = Math.min(this.historicalData.length / 10, 20)

    return Math.round(flagConfidence + dataConfidence)
  }

  /**
   * Determine severity level
   */
  private determineSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get statistics about the detection engine
   */
  getStats() {
    return {
      historicalTransactions: this.historicalData.length,
      uniqueRecipients: this.recipientHistory.size,
      blacklistedAddresses: this.blacklist.size,
      config: this.config
    }
  }

  /**
   * Reset the engine
   */
  reset(): void {
    this.historicalData = []
    this.recipientHistory.clear()
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a fraud detection engine with default config
 */
export function createFraudDetector(
  historicalTransactions: Transaction[],
  config?: Partial<FraudDetectionConfig>
): FraudDetectionEngine {
  const engine = new FraudDetectionEngine(config)
  engine.train(historicalTransactions)
  return engine
}

/**
 * Quick analysis of a single transaction
 */
export function quickAnalyze(
  transaction: Transaction,
  historicalTransactions: Transaction[]
): AnomalyScore {
  const engine = createFraudDetector(historicalTransactions)
  return engine.analyze(transaction)
}

/**
 * Get human-readable severity description
 */
export function getSeverityDescription(severity: string): string {
  const descriptions = {
    low: 'Minor anomaly detected - likely safe',
    medium: 'Moderate risk - review recommended',
    high: 'High risk - manual approval required',
    critical: 'Critical risk - block transaction'
  }
  return descriptions[severity as keyof typeof descriptions] || 'Unknown'
}

/**
 * Get color for severity level
 */
export function getSeverityColor(severity: string): string {
  const colors = {
    low: 'text-yellow-600 bg-yellow-50',
    medium: 'text-orange-600 bg-orange-50',
    high: 'text-red-600 bg-red-50',
    critical: 'text-red-900 bg-red-100'
  }
  return colors[severity as keyof typeof colors] || 'text-gray-600 bg-gray-50'
}