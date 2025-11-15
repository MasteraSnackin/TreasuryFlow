/**
 * ML-Powered Cash Flow Forecasting
 * Uses simple linear regression and moving averages for prediction
 */

interface HistoricalData {
  date: Date
  inflow: number
  outflow: number
  netFlow: number
}

interface ForecastResult {
  date: Date
  predictedInflow: number
  predictedOutflow: number
  predictedNet: number
  confidence: number
  upperBound: number
  lowerBound: number
}

export class CashFlowForecaster {
  private historicalData: HistoricalData[] = []

  /**
   * Add historical data point
   */
  addDataPoint(date: Date, inflow: number, outflow: number) {
    this.historicalData.push({
      date,
      inflow,
      outflow,
      netFlow: inflow - outflow
    })
    
    // Keep only last 90 days
    if (this.historicalData.length > 90) {
      this.historicalData.shift()
    }
  }

  /**
   * Generate forecast for next N days
   */
  forecast(days: number = 30): ForecastResult[] {
    if (this.historicalData.length < 7) {
      throw new Error('Need at least 7 days of historical data')
    }

    const results: ForecastResult[] = []
    const lastDate = this.historicalData[this.historicalData.length - 1].date

    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(lastDate)
      forecastDate.setDate(forecastDate.getDate() + i)

      // Use multiple methods and average them
      const inflowPrediction = this.predictValue('inflow', i)
      const outflowPrediction = this.predictValue('outflow', i)
      
      // Calculate confidence based on data variance
      const confidence = this.calculateConfidence()
      const margin = (inflowPrediction + outflowPrediction) * (1 - confidence)

      results.push({
        date: forecastDate,
        predictedInflow: inflowPrediction,
        predictedOutflow: outflowPrediction,
        predictedNet: inflowPrediction - outflowPrediction,
        confidence,
        upperBound: inflowPrediction - outflowPrediction + margin,
        lowerBound: inflowPrediction - outflowPrediction - margin
      })
    }

    return results
  }

  /**
   * Predict value using weighted moving average + trend
   */
  private predictValue(field: 'inflow' | 'outflow', daysAhead: number): number {
    const recentData = this.historicalData.slice(-30)
    
    // Calculate weighted moving average (more weight to recent data)
    let weightedSum = 0
    let weightTotal = 0
    
    recentData.forEach((point, index) => {
      const weight = index + 1 // Linear weighting
      weightedSum += point[field] * weight
      weightTotal += weight
    })
    
    const wma = weightedSum / weightTotal

    // Calculate trend (simple linear regression)
    const trend = this.calculateTrend(field)
    
    // Apply trend to prediction
    const prediction = wma + (trend * daysAhead)
    
    // Add seasonal adjustment (day of week pattern)
    const seasonal = this.getSeasonalAdjustment(field, daysAhead)
    
    return Math.max(0, prediction * seasonal)
  }

  /**
   * Calculate trend using linear regression
   */
  private calculateTrend(field: 'inflow' | 'outflow'): number {
    const data = this.historicalData.slice(-30)
    const n = data.length
    
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0
    
    data.forEach((point, index) => {
      const x = index
      const y = point[field]
      sumX += x
      sumY += y
      sumXY += x * y
      sumX2 += x * x
    })
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    return slope
  }

  /**
   * Get seasonal adjustment factor (day of week patterns)
   */
  private getSeasonalAdjustment(field: 'inflow' | 'outflow', daysAhead: number): number {
    // Group by day of week
    const dayAverages: number[] = [0, 0, 0, 0, 0, 0, 0]
    const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0]
    
    this.historicalData.forEach(point => {
      const dayOfWeek = point.date.getDay()
      dayAverages[dayOfWeek] += point[field]
      dayCounts[dayOfWeek]++
    })
    
    // Calculate averages
    for (let i = 0; i < 7; i++) {
      if (dayCounts[i] > 0) {
        dayAverages[i] /= dayCounts[i]
      }
    }
    
    const overallAverage = dayAverages.reduce((a, b) => a + b, 0) / 7
    
    // Get day of week for prediction
    const futureDate = new Date(this.historicalData[this.historicalData.length - 1].date)
    futureDate.setDate(futureDate.getDate() + daysAhead)
    const futureDayOfWeek = futureDate.getDay()
    
    // Return adjustment factor
    return dayAverages[futureDayOfWeek] / overallAverage || 1
  }

  /**
   * Calculate confidence score (0-1)
   */
  private calculateConfidence(): number {
    if (this.historicalData.length < 14) return 0.5
    
    const recentData = this.historicalData.slice(-30)
    
    // Calculate coefficient of variation for both inflow and outflow
    const inflowCV = this.coefficientOfVariation(recentData.map(d => d.inflow))
    const outflowCV = this.coefficientOfVariation(recentData.map(d => d.outflow))
    
    // Lower CV = higher confidence
    const avgCV = (inflowCV + outflowCV) / 2
    const confidence = Math.max(0.3, Math.min(0.95, 1 - avgCV))
    
    return confidence
  }

  /**
   * Calculate coefficient of variation
   */
  private coefficientOfVariation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    return stdDev / mean
  }

  /**
   * Get forecast accuracy metrics
   */
  getAccuracyMetrics(): {
    mape: number // Mean Absolute Percentage Error
    rmse: number // Root Mean Square Error
    confidence: number
  } {
    // Use last 7 days to test accuracy
    const testData = this.historicalData.slice(-7)
    const trainData = this.historicalData.slice(0, -7)
    
    if (trainData.length < 7) {
      return { mape: 0, rmse: 0, confidence: 0.5 }
    }

    // Temporarily use train data
    const originalData = this.historicalData
    this.historicalData = trainData
    
    let totalPercentError = 0
    let totalSquaredError = 0
    
    testData.forEach((actual, index) => {
      const prediction = this.predictValue('netFlow' as any, index + 1)
      const actualValue = actual.netFlow
      
      const percentError = Math.abs((actualValue - prediction) / actualValue)
      const squaredError = Math.pow(actualValue - prediction, 2)
      
      totalPercentError += percentError
      totalSquaredError += squaredError
    })
    
    // Restore original data
    this.historicalData = originalData
    
    const mape = (totalPercentError / testData.length) * 100
    const rmse = Math.sqrt(totalSquaredError / testData.length)
    const confidence = Math.max(0.3, Math.min(0.95, 1 - (mape / 100)))
    
    return { mape, rmse, confidence }
  }

  /**
   * Detect anomalies in recent data
   */
  detectAnomalies(): Array<{
    date: Date
    type: 'inflow' | 'outflow'
    value: number
    expected: number
    deviation: number
  }> {
    const anomalies: Array<{
      date: Date
      type: 'inflow' | 'outflow'
      value: number
      expected: number
      deviation: number
    }> = []
    
    const recentData = this.historicalData.slice(-30)
    
    // Calculate mean and std dev for inflow and outflow
    const inflowMean = recentData.reduce((sum, d) => sum + d.inflow, 0) / recentData.length
    const outflowMean = recentData.reduce((sum, d) => sum + d.outflow, 0) / recentData.length
    
    const inflowStdDev = Math.sqrt(
      recentData.reduce((sum, d) => sum + Math.pow(d.inflow - inflowMean, 2), 0) / recentData.length
    )
    const outflowStdDev = Math.sqrt(
      recentData.reduce((sum, d) => sum + Math.pow(d.outflow - outflowMean, 2), 0) / recentData.length
    )
    
    // Check last 7 days for anomalies (> 2 standard deviations)
    this.historicalData.slice(-7).forEach(point => {
      const inflowDeviation = Math.abs(point.inflow - inflowMean) / inflowStdDev
      const outflowDeviation = Math.abs(point.outflow - outflowMean) / outflowStdDev
      
      if (inflowDeviation > 2) {
        anomalies.push({
          date: point.date,
          type: 'inflow',
          value: point.inflow,
          expected: inflowMean,
          deviation: inflowDeviation
        })
      }
      
      if (outflowDeviation > 2) {
        anomalies.push({
          date: point.date,
          type: 'outflow',
          value: point.outflow,
          expected: outflowMean,
          deviation: outflowDeviation
        })
      }
    })
    
    return anomalies
  }
}

/**
 * Generate mock historical data for testing
 */
export function generateMockHistoricalData(days: number = 60): HistoricalData[] {
  const data: HistoricalData[] = []
  const baseInflow = 5000
  const baseOutflow = 3500
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))
    
    // Add trend
    const trend = i * 10
    
    // Add seasonality (day of week)
    const dayOfWeek = date.getDay()
    const seasonal = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.0
    
    // Add randomness
    const randomFactor = 0.8 + Math.random() * 0.4
    
    const inflow = (baseInflow + trend) * seasonal * randomFactor
    const outflow = (baseOutflow + trend * 0.8) * seasonal * randomFactor
    
    data.push({
      date,
      inflow,
      outflow,
      netFlow: inflow - outflow
    })
  }
  
  return data
}