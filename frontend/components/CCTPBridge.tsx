'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import {
  initiateCCTPTransfer,
  monitorCCTPTransfer,
  completeCCTPTransfer,
  validateCCTPTransfer,
  calculateCCTPFees,
  estimateCCTPTime,
  getSupportedChains,
  type CCTPTransferParams,
  type CCTPTransferResult
} from '@/lib/circleCCTP'

interface CCTPBridgeProps {
  onClose: () => void
}

export default function CCTPBridge({ onClose }: CCTPBridgeProps) {
  const [step, setStep] = useState<'form' | 'confirming' | 'pending' | 'attesting' | 'completing' | 'success'>('form')
  const [formData, setFormData] = useState<CCTPTransferParams>({
    amount: '',
    sourceChain: 'ethereum',
    destinationChain: 'arbitrum',
    recipientAddress: ''
  })
  const [transferResult, setTransferResult] = useState<CCTPTransferResult | null>(null)
  const [error, setError] = useState<string>('')
  const [attestation, setAttestation] = useState<string>('')

  const supportedChains = getSupportedChains()
  const fees = formData.amount ? calculateCCTPFees(formData.amount) : null
  const estimatedTime = estimateCCTPTime(formData.sourceChain as any, formData.destinationChain as any)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate
    const validation = validateCCTPTransfer(formData)
    if (!validation.valid) {
      setError(validation.errors.join(', '))
      return
    }

    setStep('confirming')

    try {
      // Get signer
      if (!window.ethereum) {
        throw new Error('Please install MetaMask')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Initiate transfer
      setStep('pending')
      const result = await initiateCCTPTransfer(formData, signer)
      setTransferResult(result)

      // Monitor attestation
      setStep('attesting')
      const attestedResult = await monitorCCTPTransfer(
        result.messageHash,
        (status) => {
          console.log('Transfer status:', status)
        }
      )

      setAttestation(attestedResult.attestation || '')
      setStep('success')

    } catch (err: any) {
      console.error('CCTP transfer error:', err)
      setError(err.message || 'Transfer failed')
      setStep('form')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌉 Circle CCTP Bridge</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Source Chain</label>
              <select
                value={formData.sourceChain}
                onChange={(e) => setFormData({ ...formData, sourceChain: e.target.value as any })}
                className="input"
              >
                {supportedChains.map(chain => (
                  <option key={chain.name} value={chain.name.toLowerCase()}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Destination Chain</label>
              <select
                value={formData.destinationChain}
                onChange={(e) => setFormData({ ...formData, destinationChain: e.target.value as any })}
                className="input"
              >
                {supportedChains
                  .filter(chain => chain.name.toLowerCase() !== formData.sourceChain)
                  .map(chain => (
                    <option key={chain.name} value={chain.name.toLowerCase()}>
                      {chain.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount (USDC)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="100.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                required
              />
              <small className="text-gray-600">Minimum: 1 USDC</small>
            </div>

            <div className="form-group">
              <label>Recipient Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={formData.recipientAddress}
                onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                className="input"
                required
              />
            </div>

            {fees && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Transfer Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Protocol Fee:</span>
                    <span className="font-medium">${fees.protocolFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Gas:</span>
                    <span className="font-medium">${fees.gasFee}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="font-semibold">Total Fees:</span>
                    <span className="font-semibold">${fees.total}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Time:</span>
                    <span>{Math.round(estimatedTime / 60000)} minutes</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Bridge USDC
              </button>
            </div>
          </form>
        )}

        {step === 'confirming' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Confirm in your wallet...</p>
          </div>
        )}

        {step === 'pending' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium mb-2">Burning USDC on {formData.sourceChain}...</p>
            <p className="text-sm text-gray-600">Transaction submitted</p>
          </div>
        )}

        {step === 'attesting' && (
          <div className="text-center py-8">
            <div className="animate-pulse mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
            <p className="text-lg font-medium mb-2">Waiting for Circle attestation...</p>
            <p className="text-sm text-gray-600">This typically takes 10-20 minutes</p>
            {transferResult && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Transaction Hash:</p>
                <p className="text-xs font-mono break-all">{transferResult.txHash}</p>
              </div>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-lg font-medium mb-2">Transfer Complete!</p>
            <p className="text-sm text-gray-600 mb-4">
              {formData.amount} USDC bridged from {formData.sourceChain} to {formData.destinationChain}
            </p>
            
            {transferResult && (
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg text-left">
                  <p className="text-xs text-gray-600 mb-1">Burn Transaction:</p>
                  <p className="text-xs font-mono break-all">{transferResult.txHash}</p>
                </div>
                
                {attestation && (
                  <div className="p-3 bg-gray-50 rounded-lg text-left">
                    <p className="text-xs text-gray-600 mb-1">Attestation:</p>
                    <p className="text-xs font-mono break-all">{attestation.slice(0, 50)}...</p>
                  </div>
                )}
              </div>
            )}

            <button onClick={onClose} className="btn-primary">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}