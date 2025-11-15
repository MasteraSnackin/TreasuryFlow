'use client'

import { useState } from 'react'
import { Shield, Copy, Check, Download, AlertTriangle } from 'lucide-react'
import { use2FA } from '@/lib/twoFactorAuth'

interface TwoFactorSetupProps {
  address: string
  onComplete: () => void
  onCancel: () => void
}

export default function TwoFactorSetup({ address, onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState(1)
  const [setup, setSetup] = useState<{ secret: string; qrCode: string; backupCodes: string[] } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedBackup, setCopiedBackup] = useState(false)
  const { setupNew, enable, verify } = use2FA(address)

  async function handleStartSetup() {
    try {
      const result = await setupNew()
      setSetup(result)
      setStep(2)
    } catch (err) {
      setError('Failed to generate 2FA setup. Please try again.')
    }
  }

  function copyToClipboard(text: string, type: 'secret' | 'backup') {
    navigator.clipboard.writeText(text)
    if (type === 'secret') {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } else {
      setCopiedBackup(true)
      setTimeout(() => setCopiedBackup(false), 2000)
    }
  }

  function downloadBackupCodes() {
    if (!setup) return
    
    const content = `TreasuryFlow 2FA Backup Codes\nWallet: ${address}\n\n${setup.backupCodes.join('\n')}\n\nKeep these codes safe! Each can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `treasuryflow-backup-codes-${address.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleVerify() {
    if (!setup) return
    
    const isValid = verify(verificationCode)
    
    if (isValid) {
      enable(setup.secret, setup.backupCodes)
      setStep(4)
    } else {
      setError('Invalid code. Please try again.')
      setVerificationCode('')
    }
  }

  function handleComplete() {
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Enable Two-Factor Authentication</h2>
              <p className="text-blue-100 text-sm">Add an extra layer of security to your account</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Introduction */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">What is 2FA?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Two-Factor Authentication adds an extra layer of security by requiring a code from your phone in addition to your wallet signature.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">You'll need:</h4>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>An authenticator app (Google Authenticator, Authy, 1Password, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>A safe place to store backup codes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>About 2 minutes to complete setup</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Important</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Save your backup codes! If you lose access to your authenticator app, these codes are the only way to regain access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onCancel} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleStartSetup} className="btn-primary flex-1">
                  Get Started
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Scan QR Code */}
          {step === 2 && setup && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Scan QR Code</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Open your authenticator app and scan this QR code:
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img src={setup.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg font-mono text-sm break-all">
                    {setup.secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(setup.secret, 'secret')}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy secret"
                  >
                    {copiedSecret ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Verify Code */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Verify Setup</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Enter the 6-digit code from your authenticator app to verify setup:
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    setError('')
                    setVerificationCode(e.target.value.replace(/\D/g, ''))
                  }}
                  placeholder="000000"
                  className="input text-center text-2xl font-mono tracking-widest"
                  autoFocus
                />
                {error && (
                  <p className="text-red-600 text-sm mt-2">{error}</p>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  💡 <strong>Tip:</strong> The code changes every 30 seconds. If it doesn't work, wait for the next code.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                  Back
                </button>
                <button 
                  onClick={handleVerify} 
                  disabled={verificationCode.length !== 6}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify & Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Backup Codes */}
          {step === 4 && setup && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Save Backup Codes</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Store these backup codes in a safe place. Each code can only be used once.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {setup.backupCodes.map((code, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 px-3 py-2 rounded">
                      {i + 1}. {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(setup.backupCodes.join('\n'), 'backup')}
                  className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
                >
                  {copiedBackup ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedBackup ? 'Copied!' : 'Copy All'}
                </button>
                <button
                  onClick={downloadBackupCodes}
                  className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">2FA Enabled!</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Your account is now protected with two-factor authentication.
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={handleComplete} className="btn-primary w-full">
                Complete Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}