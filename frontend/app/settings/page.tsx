'use client'

import { useState } from 'react'
import { Shield, Key, Bell, User, ChevronRight, Check, X } from 'lucide-react'
import { useWallet } from '@/lib/useWallet'
import { use2FA } from '@/lib/twoFactorAuth'
import TwoFactorSetup from '@/components/TwoFactorSetup'
import TwoFactorVerify from '@/components/TwoFactorVerify'
import { useToast } from '@/components/Toast'

export default function SettingsPage() {
  const { address, isConnected } = useWallet()
  const { config, enabled, disable } = use2FA(address)
  const { showToast } = useToast()
  
  const [showSetup, setShowSetup] = useState(false)
  const [showDisableVerify, setShowDisableVerify] = useState(false)

  function handleSetupComplete() {
    setShowSetup(false)
    showToast({
      type: 'success',
      title: '2FA Enabled',
      message: 'Two-factor authentication has been successfully enabled'
    })
  }

  function handleDisableVerified() {
    disable()
    setShowDisableVerify(false)
    showToast({
      type: 'success',
      title: '2FA Disabled',
      message: 'Two-factor authentication has been disabled'
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to access settings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account security and preferences
          </p>
        </div>

        {/* Security Section */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Security</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Protect your account with additional security measures
              </p>
            </div>
          </div>

          {/* 2FA Setting */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                    {enabled && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                        <Check className="w-3 h-3" />
                        Enabled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {enabled 
                      ? 'Your account is protected with 2FA. You\'ll need to enter a code for sensitive actions.'
                      : 'Add an extra layer of security by requiring a code from your phone'
                    }
                  </p>
                  {enabled && config?.backupCodes && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {config.backupCodes.length} backup codes remaining
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {enabled ? (
                  <button
                    onClick={() => setShowDisableVerify(true)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-lg transition-colors font-medium"
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSetup(true)}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Enable 2FA
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Account</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your wallet and account information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Connected Wallet</p>
                <p className="font-mono text-sm">{address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage how you receive notifications
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium mb-1">Payment Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified when payments are executed
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium mb-1">Security Alerts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified about security events
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium mb-1">Approval Requests</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified when approvals are needed
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSetup && address && (
        <TwoFactorSetup
          address={address}
          onComplete={handleSetupComplete}
          onCancel={() => setShowSetup(false)}
        />
      )}

      {showDisableVerify && address && (
        <TwoFactorVerify
          address={address}
          action="disable_2fa"
          actionDescription="Disable two-factor authentication"
          onVerified={handleDisableVerified}
          onCancel={() => setShowDisableVerify(false)}
        />
      )}
    </div>
  )
}