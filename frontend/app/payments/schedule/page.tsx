'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/useWallet'
import { getVaultContract, CONTRACTS } from '@/lib/contracts'
import { ethers } from 'ethers'
import { ArrowLeft, Calendar, DollarSign, Clock, FileText, CheckCircle } from 'lucide-react'

export default function SchedulePaymentPage() {
  const router = useRouter()
  const { address, isConnected } = useWallet()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState('')

  // Form data
  const [formData, setFormData] = useState({
    recipient: '',
    recipientName: '',
    amount: '',
    currency: 'USDC',
    frequency: '2592000', // Monthly
    description: ''
  })

  const frequencies = [
    { value: '604800', label: 'Weekly', days: 7 },
    { value: '1209600', label: 'Bi-weekly', days: 14 },
    { value: '2592000', label: 'Monthly', days: 30 },
    { value: '7776000', label: 'Quarterly', days: 90 },
    { value: '31536000', label: 'Yearly', days: 365 }
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    setLoading(true)

    try {
      const vault = await getVaultContract()
      const tokenAddress = formData.currency === 'USDC' ? CONTRACTS.USDC : CONTRACTS.EURC
      const amount = ethers.parseUnits(formData.amount, 6)

      const tx = await vault.schedulePayment(
        formData.recipient,
        tokenAddress,
        amount,
        parseInt(formData.frequency),
        formData.description
      )

      setTxHash(tx.hash)
      await tx.wait()

      setStep(4) // Success step
    } catch (error: any) {
      console.error('Failed to schedule payment:', error)
      alert(error.message || 'Failed to schedule payment')
    } finally {
      setLoading(false)
    }
  }

  function validateStep1() {
    return ethers.isAddress(formData.recipient) && formData.recipientName.length > 0
  }

  function validateStep2() {
    return parseFloat(formData.amount) > 0 && formData.description.length > 0
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Wallet Required</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to schedule payments
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Schedule Payment</h1>
              <p className="text-sm text-gray-500">Set up automated recurring payments</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Recipient</span>
            <span className="text-xs text-gray-600">Payment Details</span>
            <span className="text-xs text-gray-600">Review</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Recipient */}
          {step === 1 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Recipient Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Wallet Address *
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="input"
                    required
                  />
                  {formData.recipient && !ethers.isAddress(formData.recipient) && (
                    <p className="text-sm text-red-600 mt-1">Invalid Ethereum address</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Design Agency Ltd"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="input"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For your records - not stored on-chain
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!validateStep1()}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {step === 2 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Payment Details</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency *
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="input"
                    >
                      <option value="USDC">USDC</option>
                      <option value="EURC">EURC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="input"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label} (every {freq.days} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    placeholder="Monthly design retainer"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                {/* Estimated Annual Cost */}
                {formData.amount && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Estimated Annual Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {(parseFloat(formData.amount) * (31536000 / parseInt(formData.frequency))).toFixed(2)} {formData.currency}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!validateStep2()}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Review Payment Schedule</h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Recipient</p>
                  <p className="font-semibold">{formData.recipientName}</p>
                  <p className="text-sm font-mono text-gray-600">{formData.recipient}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-2xl font-bold">{formData.amount} {formData.currency}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Frequency</p>
                    <p className="text-lg font-semibold">
                      {frequencies.find(f => f.value === formData.frequency)?.label}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="font-medium">{formData.description}</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-1">First Payment</p>
                      <p className="text-sm text-yellow-800">
                        Will be executed {frequencies.find(f => f.value === formData.frequency)?.days} days from now
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : 'Schedule Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Payment Scheduled!</h2>
              <p className="text-gray-600 mb-6">
                Your recurring payment has been successfully scheduled
              </p>

              {txHash && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
                  <p className="text-sm font-mono break-all">{txHash}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-secondary flex-1"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => {
                    setStep(1)
                    setFormData({
                      recipient: '',
                      recipientName: '',
                      amount: '',
                      currency: 'USDC',
                      frequency: '2592000',
                      description: ''
                    })
                    setTxHash('')
                  }}
                  className="btn-primary flex-1"
                >
                  Schedule Another
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}