'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Building2, Smartphone, CheckCircle, AlertCircle, Loader2, Info, ArrowRight } from 'lucide-react'
import { 
  useCircleGateway, 
  PaymentMethod, 
  TransactionType, 
  FIAT_CURRENCIES,
  formatCurrency,
  getPaymentMethodName,
  KYCStatus
} from '@/lib/circleGateway'
import { useWallet } from '@/lib/useWallet'

export default function FiatOnRamp() {
  const { address, isConnected } = useWallet()
  const { gateway, loading, buyUSDC, sellUSDC } = useCircleGateway()
  
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD)
  const [fees, setFees] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_STARTED)
  const [transactionId, setTransactionId] = useState('')
  const [status, setStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle')

  useEffect(() => {
    if (isConnected && gateway) {
      checkKYCStatus()
    }
  }, [isConnected, gateway])

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      estimateFees()
    }
  }, [amount, currency, paymentMethod, mode])

  async function checkKYCStatus() {
    if (!gateway || !address) return
    
    try {
      // Mock KYC check - replace with actual API call
      setKycStatus(KYCStatus.APPROVED)
    } catch (error) {
      console.error('Error checking KYC:', error)
    }
  }

  async function estimateFees() {
    if (!gateway) return
    
    try {
      const estimate = await gateway.estimateFees(
        mode === 'buy' ? TransactionType.BUY : TransactionType.SELL,
        amount,
        currency,
        paymentMethod
      )
      setFees(estimate)
    } catch (error) {
      console.error('Error estimating fees:', error)
    }
  }

  async function handleTransaction() {
    if (!gateway || !address) return
    
    setProcessing(true)
    setStatus('pending')
    
    try {
      const transaction = mode === 'buy' 
        ? await buyUSDC({
            type: TransactionType.BUY,
            fiatAmount: amount,
            fiatCurrency: currency,
            paymentMethod,
            recipient: address
          })
        : await sellUSDC({
            type: TransactionType.SELL,
            fiatAmount: amount,
            fiatCurrency: currency,
            paymentMethod,
            recipient: address
          })
      
      setTransactionId(transaction.id)
      setStatus('completed')
      
      // Reset form
      setTimeout(() => {
        setAmount('')
        setStatus('idle')
      }, 3000)
      
    } catch (error: any) {
      console.error('Transaction error:', error)
      setStatus('failed')
      alert(`Transaction failed: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  async function startKYC() {
    if (!gateway || !address) return
    
    try {
      const result = await gateway.startKYC(address, window.location.href)
      window.location.href = result.verificationUrl
    } catch (error) {
      console.error('KYC error:', error)
      alert('Failed to start KYC verification')
    }
  }

  const currencyInfo = FIAT_CURRENCIES[currency as keyof typeof FIAT_CURRENCIES]
  const canTransact = amount && parseFloat(amount) > 0 && kycStatus === KYCStatus.APPROVED

  // Payment method icons
  const paymentMethodIcons = {
    [PaymentMethod.CARD]: <CreditCard className="w-5 h-5" />,
    [PaymentMethod.BANK_TRANSFER]: <Building2 className="w-5 h-5" />,
    [PaymentMethod.APPLE_PAY]: <Smartphone className="w-5 h-5" />,
    [PaymentMethod.GOOGLE_PAY]: <Smartphone className="w-5 h-5" />,
    [PaymentMethod.SEPA]: <Building2 className="w-5 h-5" />,
    [PaymentMethod.ACH]: <Building2 className="w-5 h-5" />
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Fiat On/Off Ramp</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4" />
          <span>Powered by Circle</span>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Connect your wallet to continue</p>
          <button className="btn-primary">Connect Wallet</button>
        </div>
      ) : kycStatus !== KYCStatus.APPROVED ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">KYC Verification Required</h3>
          <p className="text-gray-600 mb-6">
            Complete identity verification to buy or sell USDC with fiat currency
          </p>
          <button onClick={startKYC} className="btn-primary">
            Start Verification
          </button>
          <p className="text-xs text-gray-500 mt-4">
            Verification typically takes 2-5 minutes
          </p>
        </div>
      ) : (
        <>
          {/* Buy/Sell Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('buy')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                mode === 'buy'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Buy USDC
            </button>
            <button
              onClick={() => setMode('sell')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                mode === 'sell'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sell USDC
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'buy' ? 'Amount to Spend' : 'Amount to Sell'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input pl-12"
                step="0.01"
                min="0"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {mode === 'buy' ? currencyInfo.symbol : 'USDC'}
              </span>
            </div>
          </div>

          {/* Currency Selection (Buy mode only) */}
          {mode === 'buy' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input"
              >
                {Object.entries(FIAT_CURRENCIES).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.symbol} {info.name} ({code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(PaymentMethod).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === method
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${
                      paymentMethod === method ? 'text-primary-600' : 'text-gray-400'
                    }`}>
                      {paymentMethodIcons[method]}
                    </div>
                    <span className={`text-sm font-medium ${
                      paymentMethod === method ? 'text-primary-900' : 'text-gray-700'
                    }`}>
                      {getPaymentMethodName(method)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fee Breakdown */}
          {fees && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">Transaction Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">
                    {mode === 'buy' ? 'You Pay:' : 'You Sell:'}
                  </span>
                  <span className="font-medium text-blue-900">
                    {mode === 'buy' 
                      ? formatCurrency(amount, currency)
                      : `${amount} USDC`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Processing Fee:</span>
                  <span className="font-medium text-blue-900">{fees.processingFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Network Fee:</span>
                  <span className="font-medium text-blue-900">{fees.networkFee}</span>
                </div>
                <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-blue-900">
                    {mode === 'buy' ? 'You Receive:' : 'You Get:'}
                  </span>
                  <span className="font-bold text-blue-900">
                    {mode === 'buy'
                      ? `${fees.estimatedAmount} USDC`
                      : formatCurrency(fees.estimatedAmount, currency)
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Button */}
          <button
            onClick={handleTransaction}
            disabled={!canTransact || processing}
            className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                Processing...
              </>
            ) : (
              <>
                {mode === 'buy' ? 'Buy USDC' : 'Sell USDC'}
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </>
            )}
          </button>

          {/* Status Display */}
          {status !== 'idle' && (
            <div className={`mt-6 p-4 rounded-lg border ${
              status === 'completed' ? 'bg-green-50 border-green-200' :
              status === 'failed' ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-3">
                {status === 'completed' && <CheckCircle className="w-6 h-6 text-green-600" />}
                {status === 'failed' && <AlertCircle className="w-6 h-6 text-red-600" />}
                {status === 'pending' && <Loader2 className="w-6 h-6 text-yellow-600 animate-spin" />}
                
                <div className="flex-1">
                  <p className={`font-semibold ${
                    status === 'completed' ? 'text-green-900' :
                    status === 'failed' ? 'text-red-900' :
                    'text-yellow-900'
                  }`}>
                    {status === 'completed' && 'Transaction Completed!'}
                    {status === 'failed' && 'Transaction Failed'}
                    {status === 'pending' && 'Processing Transaction'}
                  </p>
                  
                  {transactionId && (
                    <p className="text-sm text-gray-600 mt-1">
                      Transaction ID: {transactionId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Boxes */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Transaction Limits</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Per Transaction:</span>
                  <span className="font-medium">$10 - $10,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Limit:</span>
                  <span className="font-medium">$50,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Limit:</span>
                  <span className="font-medium">$500,000</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Processing Times</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Card: Instant (2-5 minutes)</li>
                <li>• Bank Transfer: 1-3 business days</li>
                <li>• Apple/Google Pay: Instant</li>
                <li>• ACH: 3-5 business days</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}