# Phase 4 Analytics - Troubleshooting Guide

## Common Issues and Solutions

### 1. TailwindCSS Module Not Found

**Error:**
```
Error: Cannot find module 'tailwindcss'
```

**Solution:**
```bash
cd frontend
fix-tailwind.bat  # This will reinstall everything properly
```

**Manual Fix:**
```bash
# Kill Node processes
taskkill /F /IM node.exe

# Remove and reinstall
rmdir /S /Q node_modules
del package-lock.json
npm cache clean --force
npm install

# Verify installation
dir node_modules\tailwindcss
```

---

### 2. Chart.js Not Rendering

**Symptoms:**
- Blank chart areas
- Console error: "Chart is not a constructor"

**Solution:**
Ensure Chart.js is properly registered in the component:

```typescript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)
```

---

### 3. TypeScript Errors in Charts

**Error:**
```
Type 'number | undefined' is not assignable to type 'number'
```

**Solution:**
Use null coalescing operator:
```typescript
const value = context.parsed.y ?? 0
```

---

### 4. ML Forecast Returns NaN

**Symptoms:**
- Forecast shows "NaN" values
- Console error: "Cannot read property of undefined"

**Root Cause:**
Insufficient historical data (need at least 7 days)

**Solution:**
```typescript
// In cashFlowForecast.ts
if (historicalData.length < 7) {
  console.warn('Insufficient data for ML forecast')
  return this.generateFallbackForecast(historicalData, days)
}
```

---

### 5. Spending Patterns Not Detected

**Symptoms:**
- "No patterns detected" message
- Empty pattern list

**Solution:**
Ensure transactions have proper structure:
```typescript
interface Transaction {
  timestamp: Date | string  // Must be valid date
  amount: string            // Must be numeric string
  category: string          // Must not be empty
  description: string
}
```

---

### 6. Supplier Performance Scores Incorrect

**Issue:**
All suppliers show 0 score

**Solution:**
Check that supplier data includes:
```typescript
{
  totalPaid: number,      // Must be > 0
  paymentCount: number,   // Must be > 0
  onTimePayments: number, // Optional but recommended
  avgPaymentTime: number  // Optional but recommended
}
```

---

### 7. Tax Report Export Fails

**Error:**
```
Failed to generate CSV
```

**Solution:**
Check browser console for specific error. Common causes:
- Pop-up blocker preventing download
- Insufficient data (need at least 1 transaction)
- Invalid date format in transactions

**Fix:**
```typescript
// Ensure dates are properly formatted
const formattedDate = format(new Date(transaction.timestamp), 'yyyy-MM-dd')
```

---

### 8. Analytics Page Won't Load

**Error:**
```
Module not found: Can't resolve '@/components/AdvancedAnalytics'
```

**Solution:**
1. Verify file exists: `frontend/components/AdvancedAnalytics.tsx`
2. Check import path in test page
3. Restart dev server

```bash
# Kill and restart
taskkill /F /IM node.exe
cd frontend
npm run dev
```

---

### 9. Performance Issues with Large Datasets

**Symptoms:**
- Slow chart rendering
- Browser freezing
- High memory usage

**Solution:**
Implement data pagination:

```typescript
// Limit data points
const maxDataPoints = 100
const sampledData = data.length > maxDataPoints
  ? data.filter((_, i) => i % Math.ceil(data.length / maxDataPoints) === 0)
  : data
```

---

### 10. Dark Mode Not Working in Analytics

**Issue:**
Charts don't adapt to dark mode

**Solution:**
Update chart options to use CSS variables:

```typescript
const options = {
  scales: {
    y: {
      grid: {
        color: 'var(--chart-grid-color)' // Use CSS variable
      }
    }
  }
}
```

Add to globals.css:
```css
:root {
  --chart-grid-color: rgba(0, 0, 0, 0.1);
}

.dark {
  --chart-grid-color: rgba(255, 255, 255, 0.1);
}
```

---

## Verification Checklist

After fixing issues, verify:

- [ ] Dev server starts without errors
- [ ] Analytics page loads at `/analytics-test`
- [ ] All 4 tabs render correctly
- [ ] Charts display data
- [ ] ML forecast shows predictions
- [ ] Spending patterns detected
- [ ] Supplier scores calculated
- [ ] Tax report exports successfully
- [ ] No console errors
- [ ] Performance is acceptable (<3s load time)

---

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Open browser DevTools (F12)
   - Look for red errors
   - Copy full error message

2. **Verify File Structure**
   ```
   frontend/
   ├── components/
   │   ├── AdvancedAnalytics.tsx
   │   ├── SpendingPatterns.tsx
   │   ├── SupplierPerformance.tsx
   │   └── TaxReporting.tsx
   ├── lib/
   │   ├── cashFlowForecast.ts
   │   └── spendingAnalysis.ts
   └── app/
       └── analytics-test/
           └── page.tsx
   ```

3. **Check Dependencies**
   ```bash
   npm list chart.js
   npm list react-chartjs-2
   npm list date-fns
   ```

4. **Review Documentation**
   - PHASE_4_COMPLETE.md
   - PHASE_4_TESTING_GUIDE.md

5. **Contact Support**
   - GitHub Issues: [repo]/issues
   - Discord: #treasuryflow-support
   - Email: support@treasuryflow.com

---

## Debug Mode

Enable verbose logging:

```typescript
// Add to analytics-test/page.tsx
const DEBUG = true

if (DEBUG) {
  console.log('Transactions:', transactions)
  console.log('Forecast:', forecast)
  console.log('Patterns:', patterns)
}
```

---

## Performance Optimization

If analytics are slow:

1. **Reduce Data Points**
   ```typescript
   const last30Days = transactions.filter(t => 
     new Date(t.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
   )
   ```

2. **Memoize Calculations**
   ```typescript
   const forecast = useMemo(() => 
     forecaster.forecast(transactions, 30),
     [transactions]
   )
   ```

3. **Lazy Load Charts**
   ```typescript
   const AdvancedAnalytics = dynamic(
     () => import('@/components/AdvancedAnalytics'),
     { ssr: false }
   )
   ```

---

## Known Limitations

1. **ML Forecast Accuracy**
   - Requires 30+ days of data for best results
   - Accuracy decreases beyond 90-day predictions
   - Seasonal patterns need 1+ year of data

2. **Browser Compatibility**
   - Chart.js requires modern browser
   - IE11 not supported
   - Safari 14+ recommended

3. **Data Volume**
   - Optimal: 100-10,000 transactions
   - Performance degrades above 50,000 transactions
   - Consider server-side aggregation for large datasets

---

## Success Criteria

Phase 4 is working correctly when:

✅ All components render without errors
✅ Charts display accurate data
✅ ML forecast shows reasonable predictions
✅ Spending patterns are identified
✅ Supplier scores are calculated
✅ Tax reports export successfully
✅ Page loads in <3 seconds
✅ No memory leaks
✅ Dark mode works properly
✅ Mobile responsive

---

Last Updated: 2025-01-14
Version: 1.0.0