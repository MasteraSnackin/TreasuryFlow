'use client'

import { useState } from 'react'
import AdvancedAnalytics from '@/components/AdvancedAnalytics'
import SpendingPatterns from '@/components/SpendingPatterns'
import SupplierPerformance from '@/components/SupplierPerformance'
import TaxReporting from '@/components/TaxReporting'

export default function AnalyticsTestPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'patterns' | 'suppliers' | 'tax'>('analytics')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Phase 4: Analytics & Reporting Test Suite
            </h1>
            
            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Advanced Analytics
              </button>
              <button
                onClick={() => setActiveTab('patterns')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'patterns'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔍 Spending Patterns
              </button>
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'suppliers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⭐ Supplier Performance
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'tax'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📄 Tax Reporting
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Instructions */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">🧪 Testing Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Switch between tabs to test each component</li>
            <li>• Check for console errors (F12 → Console)</li>
            <li>• Test responsive design (resize browser window)</li>
            <li>• Verify all charts render correctly</li>
            <li>• Test export functionality (CSV, IRS formats)</li>
            <li>• Check loading states and animations</li>
            <li>• Verify all interactive elements work</li>
          </ul>
        </div>

        {/* Component Display */}
        <div className="space-y-6">
          {activeTab === 'analytics' && (
            <div>
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <h2 className="font-semibold text-gray-900 mb-2">Component: AdvancedAnalytics</h2>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>File:</strong> frontend/components/AdvancedAnalytics.tsx (485 lines)
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Features:</strong> Time range selector, cash flow chart, category breakdown, 
                  30-day forecast, AI insights, CSV export
                </p>
              </div>
              <AdvancedAnalytics />
            </div>
          )}

          {activeTab === 'patterns' && (
            <div>
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <h2 className="font-semibold text-gray-900 mb-2">Component: SpendingPatterns</h2>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Files:</strong> 
                  <br />• frontend/lib/spendingAnalysis.ts (410 lines)
                  <br />• frontend/components/SpendingPatterns.tsx (410 lines)
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Features:</strong> Pattern identification, optimization opportunities, 
                  category insights, spending velocity, 3-month forecast
                </p>
              </div>
              <SpendingPatterns />
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div>
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <h2 className="font-semibold text-gray-900 mb-2">Component: SupplierPerformance</h2>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>File:</strong> frontend/components/SupplierPerformance.tsx (485 lines)
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Features:</strong> Supplier scorecards, performance metrics, 
                  sortable list, detailed modal, trend indicators
                </p>
              </div>
              <SupplierPerformance />
            </div>
          )}

          {activeTab === 'tax' && (
            <div>
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <h2 className="font-semibold text-gray-900 mb-2">Component: TaxReporting</h2>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>File:</strong> frontend/components/TaxReporting.tsx (420 lines)
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Features:</strong> Quarterly reports, annual summary, 
                  category breakdown, CSV/IRS export, deadline reminders
                </p>
              </div>
              <TaxReporting />
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-2">🔧 Debug Information</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Active Tab:</strong> {activeTab}</p>
            <p><strong>Viewport:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</p>
            <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</p>
          </div>
        </div>

        {/* Test Checklist */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-3">✅ Testing Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Advanced Analytics</h4>
              <ul className="space-y-1 text-green-700">
                <li>□ Time range selector works</li>
                <li>□ Cash flow chart renders</li>
                <li>□ Category chart displays</li>
                <li>□ Forecast chart shows</li>
                <li>□ CSV export downloads</li>
                <li>□ AI insights appear</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Spending Patterns</h4>
              <ul className="space-y-1 text-green-700">
                <li>□ Patterns identified</li>
                <li>□ Optimizations shown</li>
                <li>□ Category insights display</li>
                <li>□ Velocity alert works</li>
                <li>□ Forecast cards render</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Supplier Performance</h4>
              <ul className="space-y-1 text-green-700">
                <li>□ Supplier cards display</li>
                <li>□ Sorting works</li>
                <li>□ Modal opens/closes</li>
                <li>□ Score bars render</li>
                <li>□ Metrics calculate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Tax Reporting</h4>
              <ul className="space-y-1 text-green-700">
                <li>□ Quarterly cards show</li>
                <li>□ Annual totals correct</li>
                <li>□ CSV export works</li>
                <li>□ IRS format exports</li>
                <li>□ Categories expand</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}