# 🧪 AI Features Testing Guide

## Prerequisites

- ✅ Dev server running: `npm run dev`
- ✅ Application accessible at: http://localhost:3002
- ✅ Browser open (Chrome/Firefox recommended)

---

## Test 1: AI Invoice Uploader

### Steps to Test:

1. **Navigate to Payment Scheduler**
   - Go to http://localhost:3002/dashboard
   - Click "Schedule Payment" button
   - You should see the payment scheduler modal

2. **Locate AI Upload Button**
   - Look for "Upload Invoice (AI Powered)" button
   - Should be at the top of Step 1
   - Has a dashed border and upload icon

3. **Click Upload Button**
   - Click "Upload Invoice (AI Powered)"
   - Invoice uploader component should appear
   - Should see file upload area

4. **Upload Test Invoice**
   - Click "Choose Invoice File"
   - Select any PDF, PNG, or JPG file
   - Watch for "Extracting Data..." loading state

5. **Verify Extraction**
   - Should see "Invoice data extracted successfully!" message
   - Check extracted data:
     - Supplier name
     - Amount
     - Currency
     - Due date
     - Description
     - Wallet address (if available)

6. **Verify Auto-Fill**
   - Data should auto-fill the payment form
   - Should automatically move to Step 2
   - All fields should be populated

### Expected Results:
- ✅ Upload button visible
- ✅ File upload works
- ✅ Loading state shows
- ✅ Success message appears
- ✅ Data extracted correctly
- ✅ Form auto-fills
- ✅ Moves to Step 2

### Fallback Behavior:
- If no Anthropic API key: Uses mock data
- Mock data includes:
  - Supplier: "Design Agency Ltd"
  - Amount: "2500"
  - Currency: "USDC"
  - Description: "Monthly design retainer"

---

## Test 2: AI Currency Recommender

### Steps to Test:

1. **Navigate to Step 2**
   - Either continue from invoice upload
   - Or manually enter recipient in Step 1

2. **Enter Recipient Address**
   - Enter any Ethereum address
   - Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f5678`

3. **Enter Amount**
   - Type any amount (e.g., "1000")
   - Wait 500ms for debounce

4. **Observe Recommendation**
   - AI recommendation card should appear
   - Should show:
     - Recommended currency (USDC/EURC)
     - Reasoning explanation
     - Fee percentage
     - Settlement time
     - Potential savings
     - Confidence score with visual bars

5. **Test Different Scenarios**
   
   **Scenario A: EU-like Address**
   - Address with 'e' or 'f': `0xef1234567890abcdef1234567890abcdef123456`
   - Should recommend: EURC
   - Reason: "EU-based recipient"
   
   **Scenario B: Large Amount**
   - Amount: 15000
   - Should recommend: USDC
   - Reason: "Best liquidity for large payments"
   
   **Scenario C: Small Amount**
   - Amount: 500
   - Should recommend: USDC
   - Reason: "Optimal for standard payments"

6. **Verify Real-time Updates**
   - Change amount
   - Recommendation should update
   - Savings should recalculate

### Expected Results:
- ✅ Recommendation appears after typing
- ✅ Shows currency (USDC/EURC)
- ✅ Displays reasoning
- ✅ Shows fees, speed, savings
- ✅ Confidence score visible (0-100%)
- ✅ Updates in real-time
- ✅ Beautiful gradient design

---

## Test 3: Complete Payment Flow with AI

### Full Integration Test:

1. **Start Fresh**
   - Open payment scheduler
   - Step 1 should be visible

2. **Upload Invoice**
   - Click "Upload Invoice (AI Powered)"
   - Upload test file
   - Verify extraction

3. **Review Auto-Filled Data**
   - Check Step 2 has data
   - Verify currency recommendation appears
   - Review suggested currency

4. **Adjust if Needed**
   - Modify amount
   - Watch recommendation update
   - Change currency if desired

5. **Continue to Step 3**
   - Click "Continue"
   - Review payment summary
   - Verify all data correct

6. **Complete Flow**
   - Click "Schedule Payment"
   - (Will fail without wallet, but that's OK)

### Expected Results:
- ✅ Smooth flow from upload to schedule
- ✅ AI features enhance UX
- ✅ No errors in console
- ✅ All data persists through steps

---

## Test 4: Error Handling

### Test Error Scenarios:

1. **Invalid File Type**
   - Try uploading .txt or .doc file
   - Should show error: "Please upload PDF or image"

2. **Large File**
   - Try uploading file > 10MB
   - Should show error: "File size must be less than 10MB"

3. **No Recipient**
   - Don't enter recipient
   - Currency recommender should not appear

4. **No Amount**
   - Enter recipient but no amount
   - Currency recommender should not appear

5. **API Failure**
   - If API fails, should fallback to mock data
   - Should still work, just with demo data

### Expected Results:
- ✅ Appropriate error messages
- ✅ Graceful fallbacks
- ✅ No crashes
- ✅ User can continue

---

## Test 5: UI/UX Verification

### Visual Checks:

1. **Invoice Uploader**
   - [ ] Dashed border on upload area
   - [ ] Upload icon visible
   - [ ] "Powered by Claude AI" badge
   - [ ] Loading spinner during extraction
   - [ ] Success checkmark after extraction
   - [ ] Green success message
   - [ ] Extracted data in grid layout
   - [ ] "Upload Another" button

2. **Currency Recommender**
   - [ ] Gradient blue background
   - [ ] Brain icon in blue circle
   - [ ] Currency name bold
   - [ ] Confidence bars (5 bars)
   - [ ] Percentage shown
   - [ ] Reasoning text clear
   - [ ] 3-column grid for metrics
   - [ ] Icons for fees, speed, savings
   - [ ] Green color for savings

3. **Payment Scheduler Integration**
   - [ ] Upload button prominent
   - [ ] "Enter Manually Instead" option
   - [ ] Smooth transitions
   - [ ] No layout shifts
   - [ ] Responsive design

### Expected Results:
- ✅ Professional appearance
- ✅ Consistent styling
- ✅ Clear visual hierarchy
- ✅ Smooth animations
- ✅ Mobile-friendly

---

## Test 6: Console Checks

### Open Browser Console (F12):

1. **Check for Errors**
   - Should see no red errors
   - Warnings are OK

2. **Check Network Requests**
   - Go to Network tab
   - Upload invoice
   - Should see POST to `/api/extract-invoice`
   - Should return 200 OK

3. **Check API Response**
   - Click on the request
   - View response
   - Should have JSON with extracted data

4. **Check Currency Recommendation**
   - Enter recipient and amount
   - Should see POST to `/api/recommend-currency`
   - Should return 200 OK with recommendation

### Expected Results:
- ✅ No console errors
- ✅ API calls successful
- ✅ Proper JSON responses
- ✅ No 404 or 500 errors

---

## Test 7: Performance

### Check Performance:

1. **Upload Speed**
   - Upload should complete in < 3 seconds
   - (Without real API, instant with mock data)

2. **Recommendation Speed**
   - Should appear within 500ms of typing
   - Debounced to avoid too many requests

3. **No Lag**
   - Typing should be smooth
   - No freezing
   - Smooth animations

### Expected Results:
- ✅ Fast response times
- ✅ Smooth interactions
- ✅ No performance issues

---

## Common Issues & Solutions

### Issue 1: "Upload Invoice" button not showing
**Solution**: 
- Check PaymentScheduler.tsx imported correctly
- Verify InvoiceUploader component exists
- Check for TypeScript errors

### Issue 2: Currency recommender not appearing
**Solution**:
- Ensure both recipient AND amount are filled
- Check console for errors
- Verify CurrencyRecommender imported

### Issue 3: API routes returning 404
**Solution**:
- Restart dev server: `npm run dev`
- Check files exist in `app/api/` folder
- Verify Next.js 14 app router structure

### Issue 4: TypeScript errors
**Solution**:
- Run: `npm run build` to check for errors
- Fix any type mismatches
- Ensure all imports correct

### Issue 5: Styling looks broken
**Solution**:
- Check Tailwind CSS is working
- Verify globals.css imported
- Check for CSS conflicts

---

## Success Criteria

### AI Features Working If:
- ✅ Invoice upload button visible and clickable
- ✅ File upload triggers extraction
- ✅ Extracted data displays correctly
- ✅ Form auto-fills from invoice data
- ✅ Currency recommender appears with recipient + amount
- ✅ Recommendation shows currency, reasoning, metrics
- ✅ Confidence score displays with visual bars
- ✅ Real-time updates work
- ✅ No console errors
- ✅ Smooth user experience

---

## Quick Test Checklist

```
[ ] Dev server running
[ ] Navigate to /dashboard
[ ] Click "Schedule Payment"
[ ] See "Upload Invoice (AI Powered)" button
[ ] Click upload button
[ ] Upload test file
[ ] See extraction success message
[ ] Verify data extracted
[ ] Form auto-fills
[ ] Move to Step 2
[ ] Enter recipient address
[ ] Enter amount
[ ] See currency recommendation
[ ] Verify recommendation details
[ ] Check confidence score
[ ] Test different amounts
[ ] Verify real-time updates
[ ] No console errors
[ ] Smooth performance
```

---

## Demo Script for Judges

### 30-Second Demo:

1. **"Let me show you our AI-powered invoice processing"**
   - Click Schedule Payment
   - Click Upload Invoice
   - Upload sample invoice
   
2. **"Watch as AI extracts all the data automatically"**
   - Show extraction happening
   - Point out extracted fields
   - Highlight auto-fill

3. **"Now our AI recommends the best currency"**
   - Show currency recommendation
   - Explain reasoning
   - Point out savings calculation

4. **"This saves time, reduces errors, and cuts costs"**
   - Emphasize automation
   - Highlight 90% cost savings
   - Show instant processing

---

## Troubleshooting Commands

```bash
# Restart dev server
cd frontend
npm run dev

# Check for TypeScript errors
npm run build

# Clear Next.js cache
rm -rf .next
npm run dev

# Check API routes
curl http://localhost:3002/api/recommend-currency -X POST \
  -H "Content-Type: application/json" \
  -d '{"recipient":"0x123","amount":"1000"}'
```

---

## Next Steps After Testing

1. **If everything works**: ✅ Ready to demo!
2. **If issues found**: Debug using this guide
3. **For deployment**: Follow DEPLOY_INSTRUCTIONS.txt
4. **For demo**: Use the demo script above

---

**Your AI features are ready to impress! 🚀**

*Test thoroughly and win that hackathon! 🏆*