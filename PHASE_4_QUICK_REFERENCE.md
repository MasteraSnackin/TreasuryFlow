# Phase 4 Analytics - Quick Reference Guide

## 🚀 Quick Start

```bash
# Navigate to frontend
cd frontend

# Start dev server
npm run dev

# Open analytics test page
http://localhost:3000/analytics-test
```

---

## 📊 Components Overview

### 1. Advanced Analytics Dashboard
**File:** `frontend/components/AdvancedAnalytics.tsx`
**Purpose:** Main analytics dashboard with charts and metrics
**Features:**
- 4 metric cards (Total Spent, Avg Transaction, Top Category, Forecast)
- Cash flow line chart
- Category breakdown pie chart
- Monthly spending bar chart
- Time range selector (7d, 30d, 90d, 1y)
- CSV export

**Usage:**
```tsx
import AdvancedAnalytics from '@/components/AdvancedAnalytics'

<AdvancedAnalytics transactions={transactions} />
```

---

### 2. ML Cash Flow Forecasting
**File:** `frontend/lib/cashFlowForecast.ts`
**Purpose:** Predict future cash flows using machine learning
**Algorithms:**
- Weighted Moving Average
- Linear Regression
- Seasonal Adjustment
- Anomaly Detection

**Usage:**
```typescript
import { CashFlowForecaster } from '@/lib/cashFlowForecast'

const forecaster = new CashFlowForecaster()
const forecast = forecaster.forecast(transactions, 30) // 30 days

console.log(forecast.predictions) // Array of {date, amount, confidence}
console.log(forecast.trend) // 'increasing' | 'decreasing' | 'stable'
console.log(forecast.confidence) // 0-100
```

---

### 3. Spending Pattern Analysis
**File:** `frontend/lib/spendingAnalysis.ts` + `frontend/components/SpendingPatterns.tsx`
**Purpose:** Identify spending patterns and optimization opportunities
**Features:**
- Pattern detection (recurring, seasonal, one-time)
- Category insights
- Optimization recommendations
- Spending velocity tracking

**Usage:**
```typescript
import { SpendingAnalyzer } from '@/lib/spendingAnalysis'

const analyzer = new SpendingAnalyzer()
const patterns = analyzer.identifyPatterns(transactions)
const insights = analyzer.getCategoryInsights(transactions)
const optimizations = analyzer.findOptimizations(transactions)
```

**Component:**
```tsx
import SpendingPatterns from '@/components/SpendingPatterns'

<SpendingPatterns transactions={transactions} />
```

---

### 4. Supplier Performance Metrics
**File:** `frontend/components/SupplierPerformance.tsx`
**Purpose:** Track and score supplier performance
**Metrics:**
- Overall performance score (0-100)
- Payment reliability
- Cost efficiency
- Response time
- Quality rating

**Usage:**
```tsx
import SupplierPerformance from '@/components/SupplierPerformance'

<SupplierPerformance suppliers={suppliers} />
```

**Supplier Data Structure:**
```typescript
interface Supplier {
  id: string
  name: string
  address: string
  totalPaid: number
  paymentCount: number
  onTimePayments?: number
  avgPaymentTime?: number
  tags: string[]
}
```

---

### 5. Tax Reporting Module
**File:** `frontend/components/TaxReporting.tsx`
**Purpose:** Generate tax reports and export data
**Features:**
- Quarterly summaries
- Annual reports
- CSV export
- IRS-compatible format
- Deadline reminders

**Usage:**
```tsx
import TaxReporting from '@/components/TaxReporting'

<TaxReporting transactions={transactions} />
```

---

## 🎯 Key Features

### Time Range Selection
```typescript
const timeRanges = {
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000
}
```

### CSV Export
```typescript
function exportToCSV(data: any[], filename: string) {
  const csv = convertToCSV(data)
  downloadFile(csv, filename, 'text/csv')
}
```

### Chart Configuration
```typescript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: { mode: 'index', intersect: false }
  }
}
```

---

## 📈 Data Requirements

### Minimum Data for Accurate Results

| Feature | Minimum Transactions | Recommended |
|---------|---------------------|-------------|
| Basic Analytics | 1 | 10+ |
| ML Forecast | 7 | 30+ |
| Pattern Detection | 10 | 50+ |
| Seasonal Analysis | 30 | 365+ |
| Supplier Scoring | 5 per supplier | 20+ per supplier |

### Transaction Data Structure
```typescript
interface Transaction {
  id: number
  timestamp: Date | string
  description: string
  amount: string
  currency: string
  category: string
  recipient?: string
  txHash?: string
  status?: string
}
```

---

## 🔧 Configuration

### Forecast Settings
```typescript
// In cashFlowForecast.ts
const FORECAST_CONFIG = {
  minDataPoints: 7,
  maxForecastDays: 90,
  confidenceThreshold: 0.7,
  seasonalPeriod: 7, // days
  anomalyThreshold: 2.5 // standard deviations
}
```

### Pattern Detection Settings
```typescript
// In spendingAnalysis.ts
const PATTERN_CONFIG = {
  recurringThreshold: 3, // occurrences
  seasonalMinPeriod: 7, // days
  velocityWindow: 7, // days
  optimizationThreshold: 0.1 // 10% savings
}
```

---

## 🎨 Styling

### Chart Colors
```typescript
const CHART_COLORS = {
  primary: 'rgb(59, 130, 246)',
  secondary: 'rgb(168, 85, 247)',
  success: 'rgb(34, 197, 94)',
  warning: 'rgb(251, 146, 60)',
  danger: 'rgb(239, 68, 68)'
}
```

### Dark Mode Support
All components support dark mode via Tailwind's `dark:` classes:
```tsx
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-white">Content</p>
</div>
```

---

## 🧪 Testing

### Test Page Location
```
frontend/app/analytics-test/page.tsx
```

### Access URL
```
http://localhost:3000/analytics-test
```

### Test Checklist
- [ ] All 4 tabs render
- [ ] Charts display data
- [ ] Time range selector works
- [ ] CSV export downloads
- [ ] ML forecast shows predictions
- [ ] Patterns are detected
- [ ] Supplier scores calculated
- [ ] Tax report generates
- [ ] No console errors
- [ ] Dark mode works

---

## 📱 Mobile Responsiveness

All components are mobile-responsive:
- Charts scale to container
- Tables become scrollable
- Cards stack vertically
- Touch-friendly buttons

Test on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

## ⚡ Performance Tips

### 1. Limit Data Points
```typescript
const recentTransactions = transactions.slice(-100)
```

### 2. Memoize Calculations
```typescript
const forecast = useMemo(() => 
  forecaster.forecast(transactions, 30),
  [transactions]
)
```

### 3. Lazy Load Charts
```typescript
const AdvancedAnalytics = dynamic(
  () => import('@/components/AdvancedAnalytics'),
  { ssr: false, loading: () => <LoadingSkeleton /> }
)
```

### 4. Debounce Updates
```typescript
const debouncedUpdate = useMemo(
  () => debounce(updateAnalytics, 500),
  []
)
```

---

## 🐛 Common Issues

### Charts Not Rendering
**Fix:** Ensure Chart.js is registered
```typescript
import { Chart as ChartJS } from 'chart.js'
ChartJS.register(/* all required elements */)
```

### Forecast Returns NaN
**Fix:** Check data has valid dates and amounts
```typescript
const validTransactions = transactions.filter(t => 
  !isNaN(Date.parse(t.timestamp)) && 
  !isNaN(parseFloat(t.amount))
)
```

### Performance Issues
**Fix:** Reduce data points or use pagination
```typescript
const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize)
```

---

## 📚 API Reference

### CashFlowForecaster
```typescript
class CashFlowForecaster {
  forecast(transactions: Transaction[], days: number): ForecastResult
  predictValue(historicalData: number[], index: number): number
  calculateTrend(data: number[]): 'increasing' | 'decreasing' | 'stable'
  detectAnomalies(data: number[]): number[]
}
```

### SpendingAnalyzer
```typescript
class SpendingAnalyzer {
  identifyPatterns(transactions: Transaction[]): Pattern[]
  getCategoryInsights(transactions: Transaction[]): CategoryInsight[]
  findOptimizations(transactions: Transaction[]): Optimization[]
  getSpendingVelocity(transactions: Transaction[]): VelocityMetric
}
```

---

## 🔗 Related Files

- **Documentation:** `PHASE_4_COMPLETE.md`
- **Testing Guide:** `PHASE_4_TESTING_GUIDE.md`
- **Troubleshooting:** `PHASE_4_TROUBLESHOOTING.md`
- **Implementation:** `PHASE_4_IMPLEMENTATION.md`

---

## 💡 Pro Tips

1. **Use Real Data:** ML works best with actual transaction history
2. **Regular Updates:** Refresh analytics daily for best accuracy
3. **Monitor Performance:** Keep transaction count under 10,000 for optimal speed
4. **Export Regularly:** Download CSV backups weekly
5. **Review Patterns:** Check spending patterns monthly for insights
6. **Validate Forecasts:** Compare predictions with actuals to improve accuracy

---

## 🎓 Learning Resources

- Chart.js Docs: https://www.chartjs.org/docs/
- React Chart.js 2: https://react-chartjs-2.js.org/
- Date-fns: https://date-fns.org/
- Machine Learning Basics: https://ml-cheatsheet.readthedocs.io/

---

Last Updated: 2025-01-14
Version: 1.0.0