'use client'

import { useState } from 'react'
import { Shield, X, AlertCircle } from 'lucide-react'
import { use2FA } from '@/lib/twoFactorAuth'

interface TwoFactorVerifyProps {
  address: string
  action: string
  actionDescription: string
  onVerified: () => void
  onCancel: () => void
}

export default function TwoFactorVerify({ 
  address, 
  action, 
  actionDescription, 
  onVerified, 
  onCancel 
}: TwoFactorVerifyProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isBackupCode, setIsBackupCode] = useState(false)
  const { verify, config } = use2FA(address)

  function handleVerify() {
    if (!code.trim()) {
      setError('Please enter a code')
      return
    }

    const isValid = verify(code)
    
    if (isValid) {
      onVerified()
    } else {
      setError(isBackupCode ? 'Invalid backup code' : 'Invalid verification code')
      setCode('')
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && code.length >= 6) {
      handleVerify()
    }
  }

  const remainingBackupCodes = config?.backupCodes?.length || 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verification required</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Action Description */}
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Action:</strong> {actionDescription}
            </p>
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {isBackupCode ? 'Backup Code' : 'Verification Code'}
            </label>
            <input
              type="text"
              inputMode={isBackupCode ? 'text' : 'numeric'}
              pattern={isBackupCode ? undefined : '[0-9]*'}
              maxLength={isBackupCode ? 8 : 6}
              value={code}
              onChange={(e) => {
                setError('')
                const value = isBackupCode 
                  ? e.target.value.toUpperCase()
                  : e.target.value.replace(/\D/g, '')
                setCode(value)
              }}
              onKeyPress={handleKeyPress}
              placeholder={isBackupCode ? 'XXXXXXXX' : '000000'}
              className="input text-center text-2xl font-mono tracking-widest"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Backup Code Toggle */}
          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => {
                setIsBackupCode(!isBackupCode)
                setCode('')
                setError('')
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isBackupCode ? 'Use authenticator code' : 'Use backup code'}
            </button>
            {isBackupCode && remainingBackupCodes > 0 && (
              <span className="text-gray-600 dark:text-gray-400">
                {remainingBackupCodes} backup {remainingBackupCodes === 1 ? 'code' : 'codes'} remaining
              </span>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isBackupCode ? (
                <>
                  💡 <strong>Tip:</strong> Each backup code can only be used once. After using it, you'll have {remainingBackupCodes - 1} remaining.
                </>
              ) : (
                <>
                  💡 <strong>Tip:</strong> Open your authenticator app and enter the 6-digit code. The code changes every 30 seconds.
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={code.length < (isBackupCode ? 6 : 6)}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}