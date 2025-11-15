'use client'

import { useState } from 'react'
import { X, ArrowRight, Check, Upload } from 'lucide-react'
import { getVaultContract, CONTRACTS } from '@/lib/contracts'
import { ethers } from 'ethers'
import InvoiceUploader from './InvoiceUploader'
import CurrencyRecommender from './CurrencyRecommender'

interface PaymentSchedulerProps {
  onClose: () => void
  onScheduled: () => void
}

export default function PaymentScheduler({ onClose, onScheduled }: PaymentSchedulerProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showInvoiceUploader, setShowInvoiceUploader] = useState(false)
  const [formData, setFormData] = useState({
    recipient: '',
    recipientName: '',
    amount: '',
    currency: 'USDC',
    frequency: '2592000', // monthly
    description: ''
  })

  function handleInvoiceData(data: any) {
    setFormData({
      ...formData,
      recipient: data.walletAddress || formData.recipient,
      recipientName: data.supplierName,
      amount: data.amount,
      currency: data.currency,
      description: data.description
    })
    setShowInvoiceUploader(false)
    setStep(2)
  }

  async function handleSchedule() {
    try {
      setLoading(true)

      // Validate inputs
      if (!ethers.isAddress(formData.recipient)) {
        alert('Invalid Ethereum address')
        return
      }

      if (parseFloat(formData.amount) <= 0) {
        alert('Amount must be greater than 0')
        return
      }

      // Get contract
      const vault = await getVaultContract()
      const tokenAddress = formData.currency === 'USDC' ? CONTRACTS.USDC : CONTRACTS.EURC
      const amount = ethers.parseUnits(formData.amount, 6)

      // Schedule payment
      const tx = await vault.schedulePayment(
        formData.recipient,
        tokenAddress,
        amount,
        parseInt(formData.frequency),
        formData.description
      )

      await tx.wait()

      alert('Payment scheduled successfully!')
      onScheduled()
      onClose()
    } catch (error: any) {
      console.error('Failed to schedule payment:', error)
      alert(error.message || 'Failed to schedule payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Schedule Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 p-6 border-b border-gray-200">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="font-medium">Recipient</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <span className="font-medium">Amount</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="font-medium">Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              {/* AI Invoice Uploader Toggle */}
              {!showInvoiceUploader && (
                <button
                  onClick={() => setShowInvoiceUploader(true)}
                  className="w-full p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 text-primary-600 font-medium"
                >
                  <Upload className="w-5 h-5" />
                  Upload Invoice (AI Powered)
                </button>
              )}

              {showInvoiceUploader ? (
                <div>
                  <InvoiceUploader onDataExtracted={handleInvoiceData} />
                  <button
                    onClick={() => setShowInvoiceUploader(false)}
                    className="btn-secondary w-full mt-4"
                  >
                    Enter Manually Instead
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Address *
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={formData.recipient}
                      onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Design Agency Ltd"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      className="input"
                    />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.recipient}
                    className="btn-primary w-full"
                  >
                    Continue
                  </button>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* AI Currency Recommender */}
              {formData.recipient && formData.amount && (
                <CurrencyRecommender
                  recipient={formData.recipient}
                  amount={formData.amount}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input"
                  step="0.01"
                  min="0"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="input"
                >
                  <option value="604800">Weekly</option>
                  <option value="1209600">Bi-weekly</option>
                  <option value="2592000">Monthly</option>
                  <option value="7776000">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Monthly design retainer, Q1 development sprint, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.amount}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient</span>
                  <span className="font-mono">{formData.recipient.slice(0, 10)}...{formData.recipient.slice(-8)}</span>
                </div>

                {formData.recipientName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium">{formData.recipientName}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold text-xl">{formData.amount} {formData.currency}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency</span>
                  <span className="font-medium">
                    {formData.frequency === '604800' && 'Weekly'}
                    {formData.frequency === '1209600' && 'Bi-weekly'}
                    {formData.frequency === '2592000' && 'Monthly'}
                    {formData.frequency === '7776000' && 'Quarterly'}
                  </span>
                </div>

                {formData.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description</span>
                    <span className="font-medium text-right max-w-xs">{formData.description}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ⚡ This payment will be executed automatically based on the schedule. 
                  You can cancel or modify it anytime from the dashboard.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Scheduling...' : 'Schedule Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}