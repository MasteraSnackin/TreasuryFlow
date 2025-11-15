'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, RefreshCw, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react'
import { CircleBridge, SUPPORTED_CHAINS, useCircleBridge } from '@/lib/circleBridge'
import { useWallet } from '@/lib/useWallet'

export default function CrossChainBridge() {
  const { address, isConnected } = useWallet()
  const { bridge, initializeBridge } = useCircleBridge()
  
  const [sourceChain, setSourceChain] = useState<keyof typeof SUPPORTED_CHAINS>('arc')
  const [destChain, setDestChain] = useState<keyof typeof SUPPORTED_CHAINS>('ethereum')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [balance, setBalance] = useState('0')
  const [fees, setFees] = useState<any>(null)
  const [transferring, setTransferring] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [nonce, setNonce] = useState('')
  const [status, setStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle')

  useEffect(() => {
    if (isConnected && bridge) {
      initializeBridge()
      loadBalance()
    }
  }, [isConnected, bridge, sourceChain])

  useEffect(() => {
    if (recipient) {
      setRecipient(recipient)
    } else if (address) {
      setRecipient(address)
    }
  }, [address])

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      estimateFees()
    }
  }, [amount, sourceChain, destChain])

  async function loadBalance() {
    if (!bridge || !address) return
    try {
      const bal = await bridge.getUSDCBalance(address)
      setBalance(bal)
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  async function estimateFees() {
    if (!bridge) return
    try {
      const feeEstimate = await bridge.estimateFees(sourceChain, destChain, amount)
      setFees(feeEstimate)
    } catch (error) {
      console.error('Error estimating fees:', error)
    }
  }

  async function handleBridge() {
    if (!bridge || !address) return
    
    setTransferring(true)
    setStatus('pending')
    
    try {
      const result = await bridge.bridgeUSDC({
        amount,
        sourceChain,
        destinationChain: destChain,
        recipient,
        token: 'USDC'
      })
      
      setTxHash(result.txHash)
      setNonce(result.nonce)
      
      // Poll for status
      pollTransferStatus(result.nonce)
      
    } catch (error: any) {
      console.error('Bridge error:', error)
      setStatus('failed')
      alert(`Bridge failed: ${error.message}`)
    } finally {
      setTransferring(false)
    }
  }

  async function pollTransferStatus(transferNonce: string) {
    if (!bridge) return
    
    const interval = setInterval(async () => {
      try {
        const statusResult = await bridge.getTransferStatus(transferNonce)
        
        if (statusResult.status === 'completed') {
          setStatus('completed')
          clearInterval(interval)
          loadBalance() // Refresh balance
        } else if (statusResult.status === 'failed') {
          setStatus('failed')
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }, 10000) // Poll every 10 seconds
    
    // Stop polling after 15 minutes
    setTimeout(() => clearInterval(interval), 15 * 60 * 1000)
  }

  function switchChains() {
    const temp = sourceChain
    setSourceChain(destChain)
    setDestChain(temp)
  }

  const sourceChainInfo = SUPPORTED_CHAINS[sourceChain]
  const destChainInfo = SUPPORTED_CHAINS[destChain]
  const canBridge = amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(balance) && recipient

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Cross-Chain Bridge</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4" />
          <span>Powered by Circle CCTP</span>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Connect your wallet to start bridging</p>
          <button className="btn-primary">Connect Wallet</button>
        </div>
      ) : (
        <>
          {/* Source Chain */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value as keyof typeof SUPPORTED_CHAINS)}
                className="input pr-10"
              >
                {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                  <option key={key} value={key}>
                    {chain.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                Balance: {parseFloat(balance).toFixed(2)} USDC
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input pr-20"
                step="0.01"
                min="0"
              />
              <button
                onClick={() => setAmount(balance)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={switchChains}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Switch chains"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Destination Chain */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <select
              value={destChain}
              onChange={(e) => setDestChain(e.target.value as keyof typeof SUPPORTED_CHAINS)}
              className="input"
            >
              {Object.entries(SUPPORTED_CHAINS)
                .filter(([key]) => key !== sourceChain)
                .map(([key, chain]) => (
                  <option key={key} value={key}>
                    {chain.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Recipient Address */}
          <div className="mb-6">
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
            <p className="text-xs text-gray-500 mt-1">
              Defaults to your connected wallet address
            </p>
          </div>

          {/* Fee Breakdown */}
          {fees && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">Fee Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Source Chain Gas:</span>
                  <span className="font-medium text-blue-900">${fees.sourceFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Bridge Fee (0.1%):</span>
                  <span className="font-medium text-blue-900">${fees.bridgeFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Destination Gas:</span>
                  <span className="font-medium text-blue-900">${fees.destinationFee}</span>
                </div>
                <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-blue-900">Total Fees:</span>
                  <span className="font-bold text-blue-900">${fees.total}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Estimated Time:</span>
                  <span className="font-medium text-blue-800">{fees.estimatedTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* You Will Receive */}
          {amount && fees && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">You will receive:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {(parseFloat(amount) - parseFloat(fees.bridgeFee)).toFixed(2)} USDC
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                On {destChainInfo.name} in approximately {fees.estimatedTime}
              </p>
            </div>
          )}

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={!canBridge || transferring}
            className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {transferring ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                Bridging...
              </>
            ) : (
              <>
                Bridge USDC
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
                    {status === 'completed' && 'Transfer Completed!'}
                    {status === 'failed' && 'Transfer Failed'}
                    {status === 'pending' && 'Transfer in Progress'}
                  </p>
                  
                  {txHash && (
                    <a
                      href={`${sourceChainInfo.explorerUrl}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View on {sourceChainInfo.name} Explorer →
                    </a>
                  )}
                  
                  {status === 'pending' && (
                    <p className="text-sm text-yellow-700 mt-1">
                      Waiting for attestation... This usually takes 5-10 minutes
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">How it works</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• USDC is burned on the source chain</li>
              <li>• Circle attests to the burn (5-10 minutes)</li>
              <li>• USDC is minted on the destination chain</li>
              <li>• No wrapped tokens - native USDC on both sides</li>
            </ul>
          </div>

          {/* Supported Chains */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">Supported Networks</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                <div
                  key={key}
                  className="p-3 bg-white border border-gray-200 rounded-lg text-center hover:border-primary-400 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">{chain.name}</p>
                  <p className="text-xs text-gray-500">Chain ID: {chain.chainId}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}