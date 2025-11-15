# Multi-Sig Approval UI Testing Guide

## Server Status
✅ Development server running on: http://localhost:54112

## Test Scenarios

### 1. Basic Page Load Test
**URL**: http://localhost:54112/approvals

**Expected Behavior**:
- Page loads without errors
- Shows "Connect Wallet" message if not connected
- No console errors

**Potential Issues to Check**:
- [ ] Missing contract addresses in .env.local
- [ ] TypeScript compilation errors
- [ ] Component import errors
- [ ] Missing dependencies

### 2. Wallet Connection Test
**Steps**:
1. Navigate to /approvals
2. Click "Connect Wallet" (if available)
3. Connect MetaMask

**Expected Behavior**:
- Wallet connects successfully
- Address is displayed
- Approver status is checked

**Potential Issues**:
- [ ] useWallet hook not working
- [ ] Contract address not set
- [ ] Network mismatch

### 3. Approver Authorization Test
**Steps**:
1. Connect wallet
2. System checks if user is approver

**Expected Behavior**:
- If approver: Shows approval panel
- If not approver: Shows "Not an Approver" message

**Potential Issues**:
- [ ] Contract call fails
- [ ] Wrong contract ABI
- [ ] Network connection issues

### 4. Load Approvals Test
**Steps**:
1. Connect as approver
2. System loads pending approvals

**Expected Behavior**:
- Shows loading skeletons
- Loads payment data
- Displays approval status

**Potential Issues**:
- [ ] getPayment() call fails
- [ ] getApprovalStatus() call fails
- [ ] Data parsing errors

### 5. Approve Payment Test
**Steps**:
1. Click "Approve" on pending payment
2. Confirm in dialog
3. Sign transaction

**Expected Behavior**:
- Dialog opens
- Transaction is sent
- Toast notification shows
- Approval count updates

**Potential Issues**:
- [ ] approvePayment() call fails
- [ ] Transaction rejected
- [ ] State not updating

## Known Issues & Fixes

### Issue 1: Contract Address Not Set
**Symptom**: "No provider available" error

**Fix**:
```bash
# Check .env.local has contract addresses
NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

### Issue 2: Wrong Network
**Symptom**: "Please switch to Arc Testnet"

**Fix**:
- Switch MetaMask to Arc Testnet
- Or use Hardhat local network

### Issue 3: Not an Approver
**Symptom**: "Your wallet is not authorized"

**Fix**:
```javascript
// Add your address as approver in deployment
await vault.addApprover("YOUR_ADDRESS")
```

### Issue 4: No Pending Payments
**Symptom**: "No payments pending approval"

**Fix**:
```javascript
// Schedule a large payment (>$10K) to require approval
await vault.schedulePayment(
  recipient,
  usdcAddress,
  ethers.parseUnits("15000", 6), // $15K
  86400, // 1 day
  "Test payment requiring approval"
)
```

## Debug Checklist

### Environment Setup
- [ ] .env.local file exists
- [ ] Contract addresses are set
- [ ] RPC URL is correct
- [ ] All environment variables loaded

### Contract Deployment
- [ ] TreasuryVaultV2 deployed
- [ ] Deployment address matches .env
- [ ] Contract has USDC/EURC
- [ ] Approvers are configured

### Frontend Build
- [ ] No TypeScript errors
- [ ] All components compile
- [ ] No missing imports
- [ ] Dependencies installed

### Browser Console
- [ ] No JavaScript errors
- [ ] No failed network requests
- [ ] Contract calls succeed
- [ ] State updates correctly

## Manual Testing Steps

### Step 1: Check Page Loads
```
1. Open http://localhost:54112/approvals
2. Check browser console for errors
3. Verify page renders
```

### Step 2: Test Without Wallet
```
1. Ensure wallet is disconnected
2. Should see "Connect Wallet" message
3. No errors in console
```

### Step 3: Test With Non-Approver
```
1. Connect wallet that's not an approver
2. Should see "Not an Approver" message
3. No approval panel visible
```

### Step 4: Test With Approver
```
1. Connect wallet that IS an approver
2. Should see approval panel
3. Stats cards show correct numbers
4. Pending payments list loads
```

### Step 5: Test Approval Flow
```
1. Click "Approve" on a payment
2. Dialog opens with payment details
3. Click "Approve Payment"
4. MetaMask opens for signature
5. Sign transaction
6. Toast shows "Approval submitted"
7. Wait for confirmation
8. Toast shows "Payment approved!"
9. Approval count updates
10. Page refreshes data
```

### Step 6: Test Revocation Flow
```
1. Find payment you've approved
2. Click "Revoke"
3. Confirm in dialog
4. Sign transaction
5. Approval is revoked
6. Count decreases
```

## Common Errors & Solutions

### Error: "Property 'approvers' does not exist"
**Cause**: Contract ABI not updated
**Fix**: Ensure contracts.ts has V2 ABI with all functions

### Error: "Cannot read property 'address' of undefined"
**Cause**: Wallet not connected
**Fix**: Add wallet connection check

### Error: "Transaction reverted"
**Cause**: Various contract-level issues
**Fix**: Check contract state, approver status, payment status

### Error: "Failed to load approval data"
**Cause**: Network or contract call failure
**Fix**: Check RPC connection, contract address, network

## Performance Testing

### Load Time
- [ ] Page loads in < 2 seconds
- [ ] Data loads in < 3 seconds
- [ ] No lag when scrolling

### Real-time Updates
- [ ] Auto-refresh works (every 10s)
- [ ] Manual refresh works
- [ ] No memory leaks

### Responsiveness
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile
- [ ] Touch interactions smooth

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] High contrast mode works
- [ ] Focus indicators visible
- [ ] Error messages clear

## Browser Compatibility

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Next Steps After Testing

1. **If all tests pass**: Mark Phase 2.2 as complete
2. **If issues found**: Document and fix them
3. **Create bug report**: List all issues with reproduction steps
4. **Update documentation**: Add any new findings

## Test Results Template

```
Date: [DATE]
Tester: [NAME]
Environment: [Local/Testnet/Mainnet]

✅ PASSED:
- [List passed tests]

❌ FAILED:
- [List failed tests with details]

🐛 BUGS FOUND:
- [List bugs with reproduction steps]

📝 NOTES:
- [Any additional observations]
```

## Automated Testing (Future)

```typescript
// Example test structure
describe('MultiSigApprovalPanel', () => {
  it('should render without errors', () => {
    // Test implementation
  })
  
  it('should check approver status', () => {
    // Test implementation
  })
  
  it('should load pending approvals', () => {
    // Test implementation
  })
  
  it('should approve payment', () => {
    // Test implementation
  })
})
```

## Conclusion

This testing guide covers all critical paths for the multi-sig approval UI. Follow each test scenario systematically and document any issues found.

**Status**: Ready for testing
**Priority**: High
**Estimated Time**: 30-45 minutes for complete testing