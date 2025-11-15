/**
 * Spending Pattern Analysis
 * Identifies trends, patterns, and optimization opportunities
 */

interface Transaction {
  date: Date
  amount: number
  category: string
  supplier: string
  description: string
}

interface SpendingPattern {
  type: 'recurring' | 'seasonal' | 'one-time' | 'irregular'
  category: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  averageAmount: number
  nextExpected: Date | null
  confidence: number
}

interface CategoryInsight {
  category: string
  totalSpent: number
  transactionCount: number
  averageTransaction: number
  trend: 'increasing' | 'decreasing' | 'stable'
  trendPercentage: number
  topSuppliers: Array<{ name: string; amount: number; percentage: number }>
}

interface OptimizationOpportunity {
  type: 'consolidation' | 'negotiation' | 'timing' | 'alternative'
  category: string
  potentialSavings: number
  description: string
  priority: 'high' | 'medium' | 'low'
  actionItems: string[]
}

export class SpendingAnalyzer {
  private transactions: Transaction[] = []

  /**
   * Add transaction for analysis
   */
  addTransaction(transaction: Transaction) {
    this.transactions.push(transaction)
  }

  /**
   * Add multiple transactions
   */
  addTransactions(transactions: Transaction[]) {
    this.transactions.push(...transactions)
  }

  /**
   * Identify spending patterns
   */
  identifyPatterns(): SpendingPattern[] {
    const patterns: SpendingPattern[] = []
    const categories = this.getUniqueCategories()

    categories.forEach(category => {
      const categoryTxs = this.transactions.filter(t => t.category === category)
      
      if (categoryTxs.length < 2) {
        patterns.push({
          type: 'one-time',
          category,
          frequency: 'monthly',
          averageAmount: categoryTxs[0]?.amount || 0,
          nextExpected: null,
          confidence: 0.3
        })
        return
      }

      // Analyze frequency
      const intervals = this.calculateIntervals(categoryTxs)
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const intervalStdDev = this.standardDeviation(intervals)
      
      // Determine pattern type and frequency
      let type: SpendingPattern['type'] = 'irregular'
      let frequency: SpendingPattern['frequency'] = 'monthly'
      let confidence = 0.5

      if (intervalStdDev / avgInterval < 0.2) {
        // Regular pattern
        type = 'recurring'
        confidence = 0.9
        
        if (avgInterval <= 2) frequency = 'daily'
        else if (avgInterval <= 10) frequency = 'weekly'
        else if (avgInterval <= 35) frequency = 'monthly'
        else if (avgInterval <= 100) frequency = 'quarterly'
        else frequency = 'annual'
      } else if (this.hasSeasonalPattern(categoryTxs)) {
        type = 'seasonal'
        frequency = 'monthly'
        confidence = 0.7
      }

      // Calculate average amount
      const amounts = categoryTxs.map(t => t.amount)
      const averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length

      // Predict next occurrence
      let nextExpected: Date | null = null
      if (type === 'recurring') {
        const lastTx = categoryTxs[categoryTxs.length - 1]
        nextExpected = new Date(lastTx.date)
        nextExpected.setDate(nextExpected.getDate() + avgInterval)
      }

      patterns.push({
        type,
        category,
        frequency,
        averageAmount,
        nextExpected,
        confidence
      })
    })

    return patterns.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Get category insights
   */
  getCategoryInsights(): CategoryInsight[] {
    const categories = this.getUniqueCategories()
    const insights: CategoryInsight[] = []

    categories.forEach(category => {
      const categoryTxs = this.transactions.filter(t => t.category === category)
      const totalSpent = categoryTxs.reduce((sum, t) => sum + t.amount, 0)
      const averageTransaction = totalSpent / categoryTxs.length

      // Calculate trend (compare first half vs second half)
      const midpoint = Math.floor(categoryTxs.length / 2)
      const firstHalf = categoryTxs.slice(0, midpoint)
      const secondHalf = categoryTxs.slice(midpoint)
      
      const firstHalfAvg = firstHalf.reduce((sum, t) => sum + t.amount, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, t) => sum + t.amount, 0) / secondHalf.length
      
      const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      
      if (trendPercentage > 10) trend = 'increasing'
      else if (trendPercentage < -10) trend = 'decreasing'

      // Get top suppliers
      const supplierTotals = new Map<string, number>()
      categoryTxs.forEach(t => {
        supplierTotals.set(t.supplier, (supplierTotals.get(t.supplier) || 0) + t.amount)
      })

      const topSuppliers = Array.from(supplierTotals.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: (amount / totalSpent) * 100
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      insights.push({
        category,
        totalSpent,
        transactionCount: categoryTxs.length,
        averageTransaction,
        trend,
        trendPercentage,
        topSuppliers
      })
    })

    return insights.sort((a, b) => b.totalSpent - a.totalSpent)
  }

  /**
   * Find optimization opportunities
   */
  findOptimizations(): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = []
    const insights = this.getCategoryInsights()

    insights.forEach(insight => {
      // Consolidation opportunity (multiple suppliers in same category)
      if (insight.topSuppliers.length > 3) {
        const smallSuppliers = insight.topSuppliers.slice(2)
        const consolidationSavings = smallSuppliers.reduce((sum, s) => sum + s.amount, 0) * 0.15

        opportunities.push({
          type: 'consolidation',
          category: insight.category,
          potentialSavings: consolidationSavings,
          description: `Consolidate ${smallSuppliers.length} smaller suppliers into top 2 suppliers`,
          priority: consolidationSavings > 5000 ? 'high' : consolidationSavings > 2000 ? 'medium' : 'low',
          actionItems: [
            `Negotiate volume discounts with ${insight.topSuppliers[0].name}`,
            `Request quotes for consolidated services`,
            `Compare total cost including switching costs`
          ]
        })
      }

      // Negotiation opportunity (high spending category)
      if (insight.totalSpent > 10000 && insight.topSuppliers[0].percentage > 50) {
        const negotiationSavings = insight.totalSpent * 0.10

        opportunities.push({
          type: 'negotiation',
          category: insight.category,
          potentialSavings: negotiationSavings,
          description: `Negotiate better rates with ${insight.topSuppliers[0].name} (${insight.topSuppliers[0].percentage.toFixed(1)}% of category spend)`,
          priority: 'high',
          actionItems: [
            'Prepare spending analysis and market research',
            'Request competitive quotes from alternatives',
            'Schedule negotiation meeting with current supplier',
            'Propose volume-based discount structure'
          ]
        })
      }

      // Timing opportunity (irregular spending pattern)
      const pattern = this.identifyPatterns().find(p => p.category === insight.category)
      if (pattern && pattern.type === 'irregular' && insight.transactionCount > 5) {
        const timingSavings = insight.totalSpent * 0.05

        opportunities.push({
          type: 'timing',
          category: insight.category,
          potentialSavings: timingSavings,
          description: 'Establish regular payment schedule to improve cash flow predictability',
          priority: 'medium',
          actionItems: [
            'Analyze optimal payment frequency',
            'Negotiate fixed monthly/quarterly billing',
            'Set up automated recurring payments',
            'Monitor for early payment discounts'
          ]
        })
      }

      // Increasing trend opportunity
      if (insight.trend === 'increasing' && Math.abs(insight.trendPercentage) > 20) {
        const trendSavings = insight.totalSpent * 0.08

        opportunities.push({
          type: 'alternative',
          category: insight.category,
          potentialSavings: trendSavings,
          description: `Spending increasing by ${insight.trendPercentage.toFixed(1)}% - explore alternatives`,
          priority: 'high',
          actionItems: [
            'Research alternative suppliers/solutions',
            'Analyze root cause of spending increase',
            'Consider in-house alternatives if applicable',
            'Review contract terms and pricing structure'
          ]
        })
      }
    })

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings)
  }

  /**
   * Get spending velocity (rate of spending over time)
   */
  getSpendingVelocity(days: number = 30): {
    daily: number
    weekly: number
    monthly: number
    trend: 'accelerating' | 'decelerating' | 'stable'
  } {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const recentTxs = this.transactions.filter(t => t.date >= cutoffDate)
    const totalSpent = recentTxs.reduce((sum, t) => sum + t.amount, 0)
    
    const daily = totalSpent / days
    const weekly = daily * 7
    const monthly = daily * 30

    // Compare first half vs second half to determine trend
    const midpoint = Math.floor(recentTxs.length / 2)
    const firstHalf = recentTxs.slice(0, midpoint)
    const secondHalf = recentTxs.slice(midpoint)
    
    const firstHalfRate = firstHalf.reduce((sum, t) => sum + t.amount, 0) / (days / 2)
    const secondHalfRate = secondHalf.reduce((sum, t) => sum + t.amount, 0) / (days / 2)
    
    const change = ((secondHalfRate - firstHalfRate) / firstHalfRate) * 100
    
    let trend: 'accelerating' | 'decelerating' | 'stable' = 'stable'
    if (change > 15) trend = 'accelerating'
    else if (change < -15) trend = 'decelerating'

    return { daily, weekly, monthly, trend }
  }

  /**
   * Get spending forecast based on patterns
   */
  forecastSpending(months: number = 3): Array<{
    month: string
    predicted: number
    confidence: number
  }> {
    const patterns = this.identifyPatterns()
    const forecast: Array<{ month: string; predicted: number; confidence: number }> = []
    
    for (let i = 1; i <= months; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      let predicted = 0
      let totalConfidence = 0
      
      patterns.forEach(pattern => {
        if (pattern.type === 'recurring' || pattern.type === 'seasonal') {
          predicted += pattern.averageAmount
          totalConfidence += pattern.confidence
        }
      })
      
      const confidence = patterns.length > 0 ? totalConfidence / patterns.length : 0.5
      
      forecast.push({
        month: monthName,
        predicted,
        confidence
      })
    }
    
    return forecast
  }

  // Helper methods

  private getUniqueCategories(): string[] {
    return Array.from(new Set(this.transactions.map(t => t.category)))
  }

  private calculateIntervals(transactions: Transaction[]): number[] {
    const intervals: number[] = []
    const sorted = transactions.sort((a, b) => a.date.getTime() - b.date.getTime())
    
    for (let i = 1; i < sorted.length; i++) {
      const days = (sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / (1000 * 60 * 60 * 24)
      intervals.push(days)
    }
    
    return intervals
  }

  private standardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  private hasSeasonalPattern(transactions: Transaction[]): boolean {
    // Check if transactions cluster around certain months
    const monthCounts = new Array(12).fill(0)
    transactions.forEach(t => {
      monthCounts[t.date.getMonth()]++
    })
    
    const maxCount = Math.max(...monthCounts)
    const avgCount = monthCounts.reduce((a, b) => a + b, 0) / 12
    
    return maxCount > avgCount * 2
  }
}

/**
 * Generate mock transaction data for testing
 */
export function generateMockTransactions(count: number = 100): Transaction[] {
  const categories = ['Suppliers', 'Salaries', 'Infrastructure', 'Marketing', 'Operations']
  const suppliers = {
    'Suppliers': ['Acme Corp', 'Global Supply Co', 'Tech Parts Inc'],
    'Salaries': ['Payroll'],
    'Infrastructure': ['AWS', 'Google Cloud', 'Cloudflare'],
    'Marketing': ['Facebook Ads', 'Google Ads', 'LinkedIn'],
    'Operations': ['Office Supplies', 'Utilities', 'Insurance']
  }
  
  const transactions: Transaction[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 90)
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const supplierList = suppliers[category as keyof typeof suppliers]
    const supplier = supplierList[Math.floor(Math.random() * supplierList.length)]
    
    const date = new Date(startDate)
    date.setDate(date.getDate() + Math.floor(Math.random() * 90))
    
    const baseAmount = category === 'Salaries' ? 25000 : 
                      category === 'Suppliers' ? 5000 :
                      category === 'Infrastructure' ? 2000 :
                      category === 'Marketing' ? 3000 : 1500
    
    const amount = baseAmount * (0.8 + Math.random() * 0.4)
    
    transactions.push({
      date,
      amount,
      category,
      supplier,
      description: `${category} payment to ${supplier}`
    })
  }
  
  return transactions.sort((a, b) => a.date.getTime() - b.date.getTime())
}