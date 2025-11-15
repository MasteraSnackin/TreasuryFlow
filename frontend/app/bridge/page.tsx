'use client'

import { useState } from 'react'
import CrossChainBridge from '@/components/CrossChainBridge'
import { ArrowLeftRight, Clock, Shield, Zap } from 'lucide-react'

export default function BridgePage() {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cross-Chain Bridge</h1>
              <p className="text-gray-600 mt-1">Transfer USDC across 7+ blockchains instantly</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary"
            >
              <Clock className="w-4 h-4 mr-2" />
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Lightning Fast</h3>
            </div>
            <p className="text-sm text-gray-600">
              Transfers complete in 5-10 minutes using Circle's CCTP protocol
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Secure & Native</h3>
            </div>
            <p className="text-sm text-gray-600">
              No wrapped tokens - burn on source, mint native USDC on destination
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ArrowLeftRight className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Low Fees</h3>
            </div>
            <p className="text-sm text-gray-600">
              Only 0.1% bridge fee + minimal gas costs on Arc Network
            </p>
          </div>
        </div>

        {/* Main Bridge Component */}
        <div className="mb-8">
          <CrossChainBridge />
        </div>

        {/* Transfer History */}
        {showHistory && (
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Recent Transfers</h2>
            <TransferHistory />
          </div>
        )}

        {/* FAQ Section */}
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long does a transfer take?</h3>
              <p className="text-gray-600 text-sm">
                Most transfers complete in 5-10 minutes. The process involves burning USDC on the source chain, 
                waiting for Circle's attestation service to verify the burn, and then minting native USDC on the 
                destination chain.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What are the fees?</h3>
              <p className="text-gray-600 text-sm">
                Bridge fee is 0.1% of the transfer amount. You'll also pay gas fees on the source chain (very low 
                on Arc Network - typically $0.05-0.10 in USDC). The destination chain gas is covered by the protocol.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is it safe?</h3>
              <p className="text-gray-600 text-sm">
                Yes! Circle's CCTP is a battle-tested protocol that burns and mints native USDC. There are no 
                wrapped tokens or liquidity pools involved, eliminating common bridge risks. Circle is a regulated 
                financial institution backing USDC.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Which chains are supported?</h3>
              <p className="text-gray-600 text-sm">
                Currently supporting: Arc Network, Ethereum, Polygon, Arbitrum, Optimism, Base, and Avalanche. 
                More chains are being added regularly as Circle expands CCTP support.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel a transfer?</h3>
              <p className="text-gray-600 text-sm">
                Once a transfer is initiated and the USDC is burned on the source chain, it cannot be cancelled. 
                However, if the attestation fails (very rare), the funds remain on the source chain and the 
                transaction will revert.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What if my transfer gets stuck?</h3>
              <p className="text-gray-600 text-sm">
                If a transfer takes longer than 30 minutes, check the transaction on the source chain explorer. 
                If the burn was successful, the attestation is likely delayed. Contact support with your transaction 
                hash for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="card mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h2 className="text-xl font-bold mb-4 text-blue-900">Technical Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How CCTP Works</h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. User initiates transfer on source chain</li>
                <li>2. USDC is burned via TokenMessenger contract</li>
                <li>3. Circle's attestation service verifies the burn</li>
                <li>4. Attestation signature is generated</li>
                <li>5. User (or relayer) submits attestation to destination</li>
                <li>6. Native USDC is minted on destination chain</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Smart Contract Addresses</h3>
              <div className="text-sm text-blue-800 space-y-2 font-mono">
                <div>
                  <p className="text-blue-700">Arc TokenMessenger:</p>
                  <p className="text-xs break-all">0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5</p>
                </div>
                <div>
                  <p className="text-blue-700">Arc MessageTransmitter:</p>
                  <p className="text-xs break-all">0x0a992d191DEeC32aFe36203Ad87D7d289a738F81</p>
                </div>
                <div>
                  <p className="text-blue-700">USDC on Arc:</p>
                  <p className="text-xs break-all">0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white bg-opacity-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> TreasuryFlow uses Circle's official CCTP contracts. All transfers are 
              non-custodial and trustless. We never hold your funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Transfer History Component
function TransferHistory() {
  // Mock data - replace with actual API call
  const transfers = [
    {
      id: '1',
      amount: '1000.00',
      sourceChain: 'Arc Network',
      destChain: 'Ethereum',
      status: 'completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      txHash: '0x1234...5678'
    },
    {
      id: '2',
      amount: '500.00',
      sourceChain: 'Ethereum',
      destChain: 'Arc Network',
      status: 'pending',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      txHash: '0xabcd...efgh'
    },
    {
      id: '3',
      amount: '2500.00',
      sourceChain: 'Arc Network',
      destChain: 'Polygon',
      status: 'completed',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      txHash: '0x9876...5432'
    }
  ]

  return (
    <div className="space-y-3">
      {transfers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No transfers yet</p>
        </div>
      ) : (
        transfers.map((transfer) => (
          <div
            key={transfer.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${
                transfer.status === 'completed' ? 'bg-green-500' :
                transfer.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`} />
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{transfer.amount} USDC</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm text-gray-600">
                    {transfer.sourceChain} to {transfer.destChain}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{transfer.timestamp.toLocaleString()}</span>
                  <a
                    href={`https://explorer.arc.network/tx/${transfer.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {transfer.txHash}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                transfer.status === 'completed' ? 'bg-green-100 text-green-700' :
                transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}