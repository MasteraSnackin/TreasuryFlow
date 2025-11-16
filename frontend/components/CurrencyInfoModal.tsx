'use client'

import { useState } from 'react'
import { X, Info, DollarSign, Globe, Shield, Zap } from 'lucide-react'

export default function CurrencyInfoModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Info Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
      >
        <Info className="w-4 h-4" />
        What are USDC & EURC?
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Understanding Stablecoins in TreasuryFlow</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* USDC Section */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-1">USDC (USD Coin)</h3>
                    <p className="text-sm text-blue-700">Digital US Dollar • 1 USDC = $1.00 USD</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">💰 What is it?</p>
                    <p className="text-sm text-gray-700">
                      USDC is a stablecoin pegged 1:1 to the US Dollar. Each USDC is backed by real USD reserves held by Circle, making it as stable as traditional dollars but with the speed and efficiency of blockchain technology.
                    </p>
                  </div>

                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">🏢 Why TreasuryFlow uses USDC:</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• <strong>Instant payments</strong> - Send money globally in seconds, not days</li>
                      <li>• <strong>Low fees</strong> - Pay $0.08 instead of $25+ for wire transfers</li>
                      <li>• <strong>24/7 availability</strong> - No bank hours or weekend delays</li>
                      <li>• <strong>Programmable</strong> - Automate recurring payments and approvals</li>
                      <li>• <strong>Transparent</strong> - Every transaction is verifiable on-chain</li>
                    </ul>
                  </div>

                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">✅ Perfect for:</p>
                    <p className="text-sm text-gray-700">
                      US-based suppliers, contractors, and service providers. Ideal for payroll, vendor payments, and operational expenses in USD.
                    </p>
                  </div>
                </div>
              </div>

              {/* EURC Section */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-900 mb-1">EURC (Euro Coin)</h3>
                    <p className="text-sm text-purple-700">Digital Euro • 1 EURC = €1.00 EUR</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">💶 What is it?</p>
                    <p className="text-sm text-gray-700">
                      EURC is a Euro-backed stablecoin, also issued by Circle. Each EURC is backed 1:1 by Euro reserves, providing the same stability and benefits as USDC but for European transactions.
                    </p>
                  </div>

                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">🌍 Why TreasuryFlow uses EURC:</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• <strong>No FX fees</strong> - Pay European suppliers in their native currency</li>
                      <li>• <strong>Avoid conversion losses</strong> - No USD→EUR exchange rate risk</li>
                      <li>• <strong>Faster settlements</strong> - Skip SWIFT and correspondent banks</li>
                      <li>• <strong>Multi-currency treasury</strong> - Hold both USD and EUR reserves</li>
                      <li>• <strong>Regulatory compliant</strong> - Meets EU financial regulations</li>
                    </ul>
                  </div>

                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">✅ Perfect for:</p>
                    <p className="text-sm text-gray-700">
                      European suppliers, contractors, and service providers. Ideal for cross-border payments without currency conversion fees.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  TreasuryFlow Advantages
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="font-semibold text-green-900 mb-2">⚡ Speed</p>
                    <p className="text-sm text-gray-700">
                      Traditional: 3-5 business days<br />
                      <strong className="text-green-700">TreasuryFlow: &lt;2 seconds</strong>
                    </p>
                  </div>

                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="font-semibold text-green-900 mb-2">💰 Cost</p>
                    <p className="text-sm text-gray-700">
                      Traditional: $25-50 per wire<br />
                      <strong className="text-green-700">TreasuryFlow: $0.08 per payment</strong>
                    </p>
                  </div>

                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="font-semibold text-green-900 mb-2">🌐 Availability</p>
                    <p className="text-sm text-gray-700">
                      Traditional: Business hours only<br />
                      <strong className="text-green-700">TreasuryFlow: 24/7/365</strong>
                    </p>
                  </div>

                  <div className="bg-white bg-opacity-60 rounded-lg p-4">
                    <p className="font-semibold text-green-900 mb-2">🔄 Automation</p>
                    <p className="text-sm text-gray-700">
                      Traditional: Manual processing<br />
                      <strong className="text-green-700">TreasuryFlow: Fully automated</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Trust
                </h3>

                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>Circle (USDC & EURC issuer)</strong> is a regulated financial institution with:
                  </p>
                  <ul className="ml-4 space-y-1">
                    <li>• Full reserve backing (1:1 with fiat currency)</li>
                    <li>• Monthly attestations by Grant Thornton LLP</li>
                    <li>• Compliance with US and EU regulations</li>
                    <li>• $150B+ in circulation (USDC)</li>
                    <li>• Used by Visa, Stripe, Coinbase, and major institutions</li>
                  </ul>
                </div>
              </div>

              {/* Use Case Example */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Real-World Example</h3>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Scenario:</strong> Your company needs to pay a US developer ($5,000) and a German designer (€3,500) monthly.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-red-700 mb-2">❌ Traditional Banking</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Wire fees: $50 × 2 = $100/month</li>
                      <li>• FX conversion: ~3% = $105/month</li>
                      <li>• Processing time: 3-5 days each</li>
                      <li>• Manual work: 2 hours/month</li>
                      <li><strong className="text-red-700">Total cost: $205/month</strong></li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-green-700 mb-2">✅ TreasuryFlow</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Transaction fees: $0.08 × 2 = $0.16/month</li>
                      <li>• FX conversion: $0 (pay in EURC)</li>
                      <li>• Processing time: &lt;2 seconds</li>
                      <li>• Manual work: 0 hours (automated)</li>
                      <li><strong className="text-green-700">Total cost: $0.16/month</strong></li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-green-700 font-semibold mt-3 text-center">
                  💰 Save $2,458 per year + countless hours of manual work!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}