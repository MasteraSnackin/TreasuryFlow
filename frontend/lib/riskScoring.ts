/**
 * TreasuryFlow - AI Fraud Detection System
 * Phase 5.2: Risk Scoring System
 * 
 * Comprehensive risk assessment for transactions, recipients, and overall treasury health
 */

import { Transaction, AnomalyScore } from './fraudDetection'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RiskScore {
  overall: number // 0-100 (0 = no risk, 100 = maximum risk)
  breakdown: RiskBreakdown
  level: RiskLevel
  recommendation: string
  factors: RiskFactor[]
}

export interface RiskBreakdown {
  transactionRisk: number // 0-100
  recipientRisk: number // 0-100
  behavioralRisk: number // 0-100
  contextualRisk: number // 0-100
  historicalRisk: number // 0-100
}

export enum RiskLevel {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface RiskFactor {
  category: string
  description: string
  impact: number // 0-100
  weight: number // 0-1
}

export interface RecipientRiskProfile {
  address: string
  riskScore: number
  trustScore: number // 0-100 (inverse of risk)
  transactionCount: number
  totalVolume: number
  firstSeen: Date
  lastSeen: Date
  flags: string[]
  reputation: 'unknown' | 'trusted' | 'suspicious' | 'blacklisted'
}

export interface TreasuryRiskMetrics {
  overallRisk: number
  exposureByRecipient: Map<string, number>
  exposureByCategory: Map<string, number>
  concentrationRisk: number
  velocityRisk: number
  complianceRisk: number
  recommendations: string[]
}

// ============================================================================
// RISK SCORING ENGINE
// ============================================================================

export class RiskScoringEngine {
  private recipientProfiles: Map<string, RecipientRiskProfile>
  private blacklist: Set<string>
  private whitelist: Set<string>
  private historicalTransactions: Transaction[]

  constructor() {
    this.recipientProfiles = new Map()
    this.blacklist = new Set()
    this.whitelist = new Set()
    this.historicalTransactions = []
  }

  /**
   * Initialize with historical data
   */
  initialize(transactions: Transaction[]): void {
    this.historicalTransactions = transactions
    this.buildRecipientProfiles(transactions)
  }

  /**
   * Calculate comprehensive risk score for a transaction
   */
  calculateRiskScore(
    transaction: Transaction,
    anomalyScore?: AnomalyScore
  ): RiskScore {
    const factors: RiskFactor[] = []

    // 1. Transaction Risk (30% weight)
    const transactionRisk = this.assessTransactionRisk(transaction, factors)

    // 2. Recipient Risk (25% weight)
    const recipientRisk = this.assessRecipientRisk(transaction, factors)

    // 3. Behavioral Risk (20% weight)
    const behavioralRisk = this.assessBehavioralRisk(transaction, factors)

    // 4. Contextual Risk (15% weight)
    const contextualRisk = this.assessContextualRisk(transaction, factors)

    // 5. Historical Risk (10% weight)
    const historicalRisk = this.assessHistoricalRisk(transaction, factors)

    // Include anomaly score if provided
    if (anomalyScore) {
      factors.push({
        category: 'Anomaly Detection',
        description: `Anomaly score: ${anomalyScore.score}/100`,
        impact: anomalyScore.score,
        weight: 0.2
      })
    }

    const breakdown: RiskBreakdown = {
      transactionRisk,
      recipientRisk,
      behavioralRisk,
      contextualRisk,
      historicalRisk
    }

    // Calculate weighted overall score
    const overall = Math.round(
      transactionRisk * 0.30 +
      recipientRisk * 0.25 +
      behavioralRisk * 0.20 +
      contextualRisk * 0.15 +
      historicalRisk * 0.10 +
      (anomalyScore?.score || 0) * 0.20
    )

    const level = this.determineRiskLevel(overall)
    const recommendation = this.generateRecommendation(overall, level, factors)

    return {
      overall,
      breakdown,
      level,
      recommendation,
      factors
    }
  }

  /**
   * Get risk profile for a recipient
   */
  getRecipientProfile(address: string): RecipientRiskProfile | null {
    return this.recipientProfiles.get(address.toLowerCase()) || null
  }

  /**
   * Calculate treasury-wide risk metrics
   */
  calculateTreasuryRisk(transactions: Transaction[]): TreasuryRiskMetrics {
    const exposureByRecipient = new Map<string, number>()
    const exposureByCategory = new Map<string, number>()

    let totalVolume = 0

    // Calculate exposures
    for (const tx of transactions) {
      const amount = parseFloat(tx.amount)
      totalVolume += amount

      // By recipient
      const currentRecipient = exposureByRecipient.get(tx.recipient) || 0
      exposureByRecipient.set(tx.recipient, currentRecipient + amount)

      // By category
      if (tx.category) {
        const currentCategory = exposureByCategory.get(tx.category) || 0
        exposureByCategory.set(tx.category, currentCategory + amount)
      }
    }

    // Calculate concentration risk (Herfindahl index)
    const concentrationRisk = this.calculateConcentrationRisk(exposureByRecipient, totalVolume)

    // Calculate velocity risk
    const velocityRisk = this.calculateVelocityRisk(transactions)

    // Calculate compliance risk
    const complianceRisk = this.calculateComplianceRisk(transactions)

    // Overall treasury risk
    const overallRisk = Math.round(
      concentrationRisk * 0.4 +
      velocityRisk * 0.3 +
      complianceRisk * 0.3
    )

    const recommendations = this.generateTreasuryRecommendations(
      concentrationRisk,
      velocityRisk,
      complianceRisk,
      exposureByRecipient,
      totalVolume
    )

    return {
      overallRisk,
      exposureByRecipient,
      exposureByCategory,
      concentrationRisk,
      velocityRisk,
      complianceRisk,
      recommendations
    }
  }

  // ============================================================================
  // RISK ASSESSMENT METHODS
  // ============================================================================

  /**
   * Assess transaction-specific risk
   */
  private assessTransactionRisk(tx: Transaction, factors: RiskFactor[]): number {
    let risk = 0

    const amount = parseFloat(tx.amount)

    // Large transaction risk
    if (amount > 50000) {
      const impact = Math.min((amount / 100000) * 100, 100)
      risk += impact * 0.4
      factors.push({
        category: 'Transaction Size',
        description: `Large transaction: $${amount.toLocaleString()}`,
        impact,
        weight: 0.4
      })
    }

    // Round number risk
    const roundNumbers = [1000, 5000, 10000, 50000, 100000]
    if (roundNumbers.some(n => Math.abs(amount - n) < 0.01)) {
      risk += 20
      factors.push({
        category: 'Transaction Pattern',
        description: 'Suspiciously round amount',
        impact: 20,
        weight: 0.2
      })
    }

    // Missing description risk
    if (!tx.description || tx.description.length < 5) {
      risk += 15
      factors.push({
        category: 'Transaction Details',
        description: 'Missing or vague description',
        impact: 15,
        weight: 0.15
      })
    }

    return Math.min(risk, 100)
  }

  /**
   * Assess recipient-specific risk
   */
  private assessRecipientRisk(tx: Transaction, factors: RiskFactor[]): number {
    let risk = 0

    // Check blacklist
    if (this.blacklist.has(tx.recipient.toLowerCase())) {
      risk = 100
      factors.push({
        category: 'Recipient Status',
        description: 'Recipient is blacklisted',
        impact: 100,
        weight: 1.0
      })
      return risk
    }

    // Check whitelist
    if (this.whitelist.has(tx.recipient.toLowerCase())) {
      factors.push({
        category: 'Recipient Status',
        description: 'Recipient is whitelisted',
        impact: 0,
        weight: 0.5
      })
      return 0
    }

    const profile = this.recipientProfiles.get(tx.recipient.toLowerCase())

    if (!profile) {
      // New recipient
      risk += 40
      factors.push({
        category: 'Recipient History',
        description: 'New recipient (no transaction history)',
        impact: 40,
        weight: 0.6
      })
    } else {
      // Existing recipient - check trust score
      const trustDeficit = 100 - profile.trustScore
      risk += trustDeficit * 0.5

      if (profile.trustScore < 50) {
        factors.push({
          category: 'Recipient Trust',
          description: `Low trust score: ${profile.trustScore}/100`,
          impact: trustDeficit,
          weight: 0.5
        })
      }

      // Check for flags
      if (profile.flags.length > 0) {
        const flagRisk = Math.min(profile.flags.length * 15, 60)
        risk += flagRisk
        factors.push({
          category: 'Recipient Flags',
          description: `${profile.flags.length} warning flag(s)`,
          impact: flagRisk,
          weight: 0.4
        })
      }
    }

    return Math.min(risk, 100)
  }

  /**
   * Assess behavioral risk patterns
   */
  private assessBehavioralRisk(tx: Transaction, factors: RiskFactor[]): number {
    let risk = 0

    if (this.historicalTransactions.length < 10) return 0

    const txTime = new Date(tx.timestamp)
    const hour = txTime.getHours()

    // Unusual time risk (late night/early morning)
    if (hour >= 0 && hour < 6) {
      risk += 25
      factors.push({
        category: 'Transaction Timing',
        description: `Unusual time: ${hour}:00`,
        impact: 25,
        weight: 0.3
      })
    }

    // Weekend risk
    const dayOfWeek = txTime.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      risk += 15
      factors.push({
        category: 'Transaction Timing',
        description: 'Weekend transaction',
        impact: 15,
        weight: 0.2
      })
    }

    // Rapid succession risk
    const recentTxs = this.historicalTransactions.filter(t => {
      const diff = txTime.getTime() - new Date(t.timestamp).getTime()
      return diff >= 0 && diff < 3600000 // Last hour
    })

    if (recentTxs.length > 5) {
      const rapidRisk = Math.min(recentTxs.length * 10, 50)
      risk += rapidRisk
      factors.push({
        category: 'Transaction Velocity',
        description: `${recentTxs.length} transactions in last hour`,
        impact: rapidRisk,
        weight: 0.5
      })
    }

    return Math.min(risk, 100)
  }

  /**
   * Assess contextual risk factors
   */
  private assessContextualRisk(tx: Transaction, factors: RiskFactor[]): number {
    let risk = 0

    // Category risk
    const highRiskCategories = ['cash', 'crypto', 'gambling', 'unknown']
    if (tx.category && highRiskCategories.includes(tx.category.toLowerCase())) {
      risk += 30
      factors.push({
        category: 'Transaction Category',
        description: `High-risk category: ${tx.category}`,
        impact: 30,
        weight: 0.4
      })
    }

    // Currency risk (if not standard stablecoins)
    if (tx.currency && !['USDC', 'EURC', 'USD', 'EUR'].includes(tx.currency.toUpperCase())) {
      risk += 20
      factors.push({
        category: 'Currency Type',
        description: `Non-standard currency: ${tx.currency}`,
        impact: 20,
        weight: 0.3
      })
    }

    return Math.min(risk, 100)
  }

  /**
   * Assess historical risk patterns
   */
  private assessHistoricalRisk(tx: Transaction, factors: RiskFactor[]): number {
    let risk = 0

    if (this.historicalTransactions.length === 0) return 0

    // Check for similar failed/flagged transactions
    const similarTxs = this.historicalTransactions.filter(t =>
      t.recipient === tx.recipient &&
      Math.abs(parseFloat(t.amount) - parseFloat(tx.amount)) / parseFloat(tx.amount) < 0.1
    )

    const flaggedSimilar = similarTxs.filter(t => 
      (t as any).flagged === true || (t as any).status === 'failed'
    )

    if (flaggedSimilar.length > 0) {
      const historicalRisk = Math.min(flaggedSimilar.length * 20, 60)
      risk += historicalRisk
      factors.push({
        category: 'Historical Pattern',
        description: `${flaggedSimilar.length} similar flagged transaction(s)`,
        impact: historicalRisk,
        weight: 0.6
      })
    }

    return Math.min(risk, 100)
  }

  // ============================================================================
  // TREASURY-WIDE RISK CALCULATIONS
  // ============================================================================

  /**
   * Calculate concentration risk using Herfindahl index
   */
  private calculateConcentrationRisk(
    exposureByRecipient: Map<string, number>,
    totalVolume: number
  ): number {
    if (totalVolume === 0) return 0

    let herfindahlIndex = 0

    for (const exposure of exposureByRecipient.values()) {
      const share = exposure / totalVolume
      herfindahlIndex += share * share
    }

    // Convert to risk score (0-100)
    // HHI ranges from 1/n to 1, where n is number of recipients
    // Higher HHI = higher concentration = higher risk
    return Math.round(herfindahlIndex * 100)
  }

  /**
   * Calculate velocity risk
   */
  private calculateVelocityRisk(transactions: Transaction[]): number {
    if (transactions.length < 2) return 0

    const sortedTxs = [...transactions].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    const timeSpan = new Date(sortedTxs[sortedTxs.length - 1].timestamp).getTime() -
                     new Date(sortedTxs[0].timestamp).getTime()

    if (timeSpan === 0) return 100

    // Calculate transactions per day
    const txPerDay = (transactions.length / timeSpan) * 86400000

    // Risk increases with velocity
    // >50 tx/day = high risk
    const velocityRisk = Math.min((txPerDay / 50) * 100, 100)

    return Math.round(velocityRisk)
  }

  /**
   * Calculate compliance risk
   */
  private calculateComplianceRisk(transactions: Transaction[]): number {
    let risk = 0
    let issues = 0

    for (const tx of transactions) {
      // Missing required fields
      if (!tx.description || tx.description.length < 3) issues++
      if (!tx.category) issues++

      // Large transactions without proper documentation
      if (parseFloat(tx.amount) > 10000 && (!tx.description || tx.description.length < 10)) {
        issues += 2
      }
    }

    const complianceRate = transactions.length > 0
      ? 1 - (issues / (transactions.length * 2))
      : 1

    risk = Math.round((1 - complianceRate) * 100)

    return Math.min(risk, 100)
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Build recipient profiles from historical data
   */
  private buildRecipientProfiles(transactions: Transaction[]): void {
    const recipientTxs = new Map<string, Transaction[]>()

    // Group transactions by recipient
    for (const tx of transactions) {
      const addr = tx.recipient.toLowerCase()
      const txs = recipientTxs.get(addr) || []
      txs.push(tx)
      recipientTxs.set(addr, txs)
    }

    // Build profiles
    for (const [address, txs] of recipientTxs.entries()) {
      const sortedTxs = txs.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

      const totalVolume = txs.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      const firstSeen = new Date(sortedTxs[0].timestamp)
      const lastSeen = new Date(sortedTxs[sortedTxs.length - 1].timestamp)

      // Calculate trust score based on history
      const trustScore = this.calculateTrustScore(txs, firstSeen)

      // Calculate risk score (inverse of trust)
      const riskScore = 100 - trustScore

      // Determine reputation
      let reputation: RecipientRiskProfile['reputation'] = 'unknown'
      if (this.blacklist.has(address)) reputation = 'blacklisted'
      else if (this.whitelist.has(address)) reputation = 'trusted'
      else if (trustScore > 70) reputation = 'trusted'
      else if (riskScore > 60) reputation = 'suspicious'

      const profile: RecipientRiskProfile = {
        address,
        riskScore,
        trustScore,
        transactionCount: txs.length,
        totalVolume,
        firstSeen,
        lastSeen,
        flags: [],
        reputation
      }

      this.recipientProfiles.set(address, profile)
    }
  }

  /**
   * Calculate trust score for a recipient
   */
  private calculateTrustScore(transactions: Transaction[], firstSeen: Date): number {
    let score = 50 // Start at neutral

    // Longevity bonus (max +20)
    const daysSinceFirst = (Date.now() - firstSeen.getTime()) / 86400000
    score += Math.min(daysSinceFirst / 30, 20)

    // Transaction count bonus (max +15)
    score += Math.min(transactions.length / 10, 15)

    // Consistency bonus (max +15)
    if (transactions.length >= 3) {
      const amounts = transactions.map(t => parseFloat(t.amount))
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
      const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length
      const cv = Math.sqrt(variance) / avg // Coefficient of variation

      if (cv < 0.5) score += 15 // Low variance = consistent = trustworthy
      else if (cv < 1.0) score += 10
      else if (cv < 2.0) score += 5
    }

    return Math.min(Math.round(score), 100)
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.CRITICAL
    if (score >= 60) return RiskLevel.HIGH
    if (score >= 40) return RiskLevel.MEDIUM
    if (score >= 20) return RiskLevel.LOW
    return RiskLevel.MINIMAL
  }

  /**
   * Generate recommendation based on risk assessment
   */
  private generateRecommendation(
    score: number,
    level: RiskLevel,
    factors: RiskFactor[]
  ): string {
    if (level === RiskLevel.CRITICAL) {
      return 'BLOCK TRANSACTION - Critical risk detected. Manual review required before proceeding.'
    }

    if (level === RiskLevel.HIGH) {
      return 'HOLD FOR REVIEW - High risk detected. Require multi-sig approval and additional verification.'
    }

    if (level === RiskLevel.MEDIUM) {
      const topFactor = factors.sort((a, b) => b.impact - a.impact)[0]
      return `PROCEED WITH CAUTION - Moderate risk detected. Primary concern: ${topFactor?.description || 'Multiple factors'}. Consider additional verification.`
    }

    if (level === RiskLevel.LOW) {
      return 'APPROVE WITH MONITORING - Low risk detected. Transaction can proceed with standard monitoring.'
    }

    return 'APPROVE - Minimal risk detected. Transaction appears safe to proceed.'
  }

  /**
   * Generate treasury-wide recommendations
   */
  private generateTreasuryRecommendations(
    concentrationRisk: number,
    velocityRisk: number,
    complianceRisk: number,
    exposureByRecipient: Map<string, number>,
    totalVolume: number
  ): string[] {
    const recommendations: string[] = []

    // Concentration risk
    if (concentrationRisk > 60) {
      const topRecipient = Array.from(exposureByRecipient.entries())
        .sort((a, b) => b[1] - a[1])[0]
      const topShare = ((topRecipient[1] / totalVolume) * 100).toFixed(1)
      recommendations.push(
        `HIGH CONCENTRATION RISK: Top recipient accounts for ${topShare}% of volume. Diversify payment recipients.`
      )
    }

    // Velocity risk
    if (velocityRisk > 60) {
      recommendations.push(
        'HIGH VELOCITY RISK: Transaction rate is unusually high. Implement velocity limits and review recent activity.'
      )
    }

    // Compliance risk
    if (complianceRisk > 40) {
      recommendations.push(
        'COMPLIANCE ISSUES: Many transactions lack proper documentation. Enforce description and category requirements.'
      )
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Treasury risk levels are within acceptable ranges. Continue monitoring.')
    }

    return recommendations
  }

  /**
   * Add address to blacklist
   */
  addToBlacklist(addresses: string[]): void {
    addresses.forEach(addr => this.blacklist.add(addr.toLowerCase()))
  }

  /**
   * Add address to whitelist
   */
  addToWhitelist(addresses: string[]): void {
    addresses.forEach(addr => this.whitelist.add(addr.toLowerCase()))
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      recipientProfiles: this.recipientProfiles.size,
      blacklistedAddresses: this.blacklist.size,
      whitelistedAddresses: this.whitelist.size,
      historicalTransactions: this.historicalTransactions.length
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color class for risk level
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors = {
    [RiskLevel.MINIMAL]: 'text-green-600 bg-green-50',
    [RiskLevel.LOW]: 'text-blue-600 bg-blue-50',
    [RiskLevel.MEDIUM]: 'text-yellow-600 bg-yellow-50',
    [RiskLevel.HIGH]: 'text-orange-600 bg-orange-50',
    [RiskLevel.CRITICAL]: 'text-red-600 bg-red-50'
  }
  return colors[level]
}

/**
 * Get icon for risk level
 */
export function getRiskLevelIcon(level: RiskLevel): string {
  const icons = {
    [RiskLevel.MINIMAL]: '✓',
    [RiskLevel.LOW]: 'ℹ',
    [RiskLevel.MEDIUM]: '⚠',
    [RiskLevel.HIGH]: '⚠',
    [RiskLevel.CRITICAL]: '⛔'
  }
  return icons[level]
}

/**
 * Format risk score for display
 */
export function formatRiskScore(score: number): string {
  return `${score}/100`
}