'use client'

import { useState, useEffect } from 'react'
import { 
  Wallet, 
  Plus, 
  Send, 
  Download, 
  Shield, 
  Fingerprint, 
  Mail, 
  Smartphone,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'
import { 
  useCircleWallet, 
  WalletType, 
  RecoveryMethod,
  formatWalletAddress,
  isBiometricSupported 
} from '@/lib/circleWallet'

export default function EmbeddedWallet({ userId }: { userId: string }) {
  const { 
    wallets, 
    activeWallet, 
    loading, 
    error, 
    createWallet, 
    sendTransaction,
    setActiveWallet,
    refreshWallets 
  } = useCircleWallet(userId)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [balance, setBalance] = useState({ usdc: '0', eurc: '0', native: '0' })

  useEffect(() => {
    if (activeWallet) {
      loadBalance()
    }
  }, [activeWallet])

  async function loadBalance() {
    // Mock balance - replace with actual API call
    setBalance({
      usdc: '1250.00',
      eurc: '850.00',
      native: '0.05'
    })
  }

  function copyAddress() {
    if (activeWallet) {
      navigator.clipboard.writeText(activeWallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (wallets.length === 0 && !loading) {
    return <CreateWalletPrompt onCreateClick={() => setShowCreateModal(true)} />
  }

  return (
    <div className="space-y-6">
      {/* Wallet Selector */}
      {wallets.length > 1 && (
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Wallet
          </label>
          <select
            value={activeWallet?.id || ''}
            onChange={(e) => {
              const wallet = wallets.find(w => w.id === e.target.value)
              if (wallet) setActiveWallet(wallet)
            }}
            className="input"
          >
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {formatWalletAddress(wallet.address)} - {wallet.blockchain}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Wallet Card */}
      {activeWallet && (
        <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Circle Wallet</p>
                <p className="font-semibold">{activeWallet.blockchain}</p>
              </div>
            </div>
            <button
              onClick={refreshWallets}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Address */}
          <div className="mb-6">
            <p className="text-sm opacity-75 mb-2">Wallet Address</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm">{formatWalletAddress(activeWallet.address, 12)}</p>
              <button
                onClick={copyAddress}
                className="p-1.5 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Balances */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <p className="text-xs opacity-75 mb-1">USDC</p>
              <p className="text-lg font-bold">${balance.usdc}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <p className="text-xs opacity-75 mb-1">EURC</p>
              <p className="text-lg font-bold">€{balance.eurc}</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <p className="text-xs opacity-75 mb-1">Native</p>
              <p className="text-lg font-bold">{balance.native}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setShowSendModal(true)}
          className="btn-primary flex flex-col items-center gap-2 py-4"
        >
          <Send className="w-6 h-6" />
          <span className="text-sm">Send</span>
        </button>
        <button
          onClick={() => setShowRecoveryModal(true)}
          className="btn-secondary flex flex-col items-center gap-2 py-4"
        >
          <Shield className="w-6 h-6" />
          <span className="text-sm">Recovery</span>
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-secondary flex flex-col items-center gap-2 py-4"
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm">New Wallet</span>
        </button>
      </div>

      {/* Security Features */}
      {activeWallet && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Security Features</h3>
          <div className="space-y-3">
            {activeWallet.recoveryMethods.map((method) => (
              <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {method === RecoveryMethod.EMAIL && <Mail className="w-5 h-5 text-gray-600" />}
                  {method === RecoveryMethod.PHONE && <Smartphone className="w-5 h-5 text-gray-600" />}
                  {method === RecoveryMethod.BIOMETRIC && <Fingerprint className="w-5 h-5 text-gray-600" />}
                  <span className="text-sm font-medium text-gray-900">
                    {method.charAt(0).toUpperCase() + method.slice(1)} Recovery
                  </span>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateWalletModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onCreate={createWallet}
        />
      )}

      {showSendModal && activeWallet && (
        <SendTransactionModal
          wallet={activeWallet}
          onClose={() => setShowSendModal(false)}
          onSend={sendTransaction}
        />
      )}

      {showRecoveryModal && activeWallet && (
        <RecoverySetupModal
          wallet={activeWallet}
          onClose={() => setShowRecoveryModal(false)}
        />
      )}
    </div>
  )
}

// Create Wallet Prompt
function CreateWalletPrompt({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="card text-center py-12">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Wallet className="w-10 h-10 text-primary-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Create Your Wallet</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Get started with a secure, embedded wallet powered by Circle. No seed phrases to remember!
      </p>
      <button onClick={onCreateClick} className="btn-primary">
        <Plus className="w-5 h-5 mr-2" />
        Create Wallet
      </button>
    </div>
  )
}

// Create Wallet Modal
function CreateWalletModal({ 
  userId, 
  onClose, 
  onCreate 
}: { 
  userId: string
  onClose: () => void
  onCreate: (request: any) => Promise<any>
}) {
  const [walletType, setWalletType] = useState<WalletType>(WalletType.EOA)
  const [blockchain, setBlockchain] = useState('arc')
  const [recoveryMethods, setRecoveryMethods] = useState<RecoveryMethod[]>([RecoveryMethod.EMAIL])
  const [creating, setCreating] = useState(false)

  const biometricSupported = isBiometricSupported()

  async function handleCreate() {
    setCreating(true)
    try {
      await onCreate({
        type: walletType,
        blockchain,
        recoveryMethods
      })
      onClose()
    } catch (error) {
      console.error('Error creating wallet:', error)
      alert('Failed to create wallet')
    } finally {
      setCreating(false)
    }
  }

  function toggleRecoveryMethod(method: RecoveryMethod) {
    if (recoveryMethods.includes(method)) {
      setRecoveryMethods(recoveryMethods.filter(m => m !== method))
    } else {
      setRecoveryMethods([...recoveryMethods, method])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Wallet</h2>

        {/* Wallet Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setWalletType(WalletType.EOA)}
              className={`p-4 rounded-lg border-2 transition-all ${
                walletType === WalletType.EOA
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-sm">Standard</p>
              <p className="text-xs text-gray-600 mt-1">EOA Wallet</p>
            </button>
            <button
              onClick={() => setWalletType(WalletType.SMART_CONTRACT)}
              className={`p-4 rounded-lg border-2 transition-all ${
                walletType === WalletType.SMART_CONTRACT
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-sm">Smart</p>
              <p className="text-xs text-gray-600 mt-1">Contract Wallet</p>
            </button>
          </div>
        </div>

        {/* Blockchain */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blockchain
          </label>
          <select
            value={blockchain}
            onChange={(e) => setBlockchain(e.target.value)}
            className="input"
          >
            <option value="arc">Arc Network</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
        </div>

        {/* Recovery Methods */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recovery Methods
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={recoveryMethods.includes(RecoveryMethod.EMAIL)}
                onChange={() => toggleRecoveryMethod(RecoveryMethod.EMAIL)}
                className="w-4 h-4"
              />
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Email Recovery</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={recoveryMethods.includes(RecoveryMethod.PHONE)}
                onChange={() => toggleRecoveryMethod(RecoveryMethod.PHONE)}
                className="w-4 h-4"
              />
              <Smartphone className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Phone Recovery</span>
            </label>

            {biometricSupported && (
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={recoveryMethods.includes(RecoveryMethod.BIOMETRIC)}
                  onChange={() => toggleRecoveryMethod(RecoveryMethod.BIOMETRIC)}
                  className="w-4 h-4"
                />
                <Fingerprint className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">Biometric</span>
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="btn-primary flex-1"
            disabled={creating || recoveryMethods.length === 0}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Wallet'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Send Transaction Modal
function SendTransactionModal({
  wallet,
  onClose,
  onSend
}: {
  wallet: any
  onClose: () => void
  onSend: (request: any) => Promise<any>
}) {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USDC')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    setSending(true)
    try {
      await onSend({
        to: recipient,
        value: amount
      })
      onClose()
    } catch (error) {
      console.error('Error sending transaction:', error)
      alert('Failed to send transaction')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Send Transaction</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="input font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input flex-1"
                step="0.01"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input w-32"
              >
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="btn-primary flex-1"
            disabled={sending || !recipient || !amount}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Recovery Setup Modal
function RecoverySetupModal({
  wallet,
  onClose
}: {
  wallet: any
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Recovery Options</h2>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-900">Active Recovery Methods</p>
            </div>
            <ul className="text-sm text-green-800 space-y-1 ml-8">
              {wallet.recoveryMethods.map((method: string) => (
                <li key={method}>• {method.charAt(0).toUpperCase() + method.slice(1)}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              Your wallet can be recovered using any of the methods above. Keep your recovery 
              information secure and up to date.
            </p>
          </div>
        </div>

        <button onClick={onClose} className="btn-primary w-full">
          Close
        </button>
      </div>
    </div>
  )
}