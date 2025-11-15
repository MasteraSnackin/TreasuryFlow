'use client'

import { useState } from 'react'
import { 
  Moon, 
  Sun, 
  Inbox, 
  Users, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'
import { 
  CardSkeleton, 
  TableSkeleton, 
  ChartSkeleton,
  DashboardSkeleton,
  TransactionSkeleton 
} from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import ConfirmDialog from '@/components/ConfirmDialog'
import CommandPalette from '@/components/CommandPalette'

export default function Phase1TestPage() {
  const { theme, toggleTheme } = useTheme()
  const [showLoading, setShowLoading] = useState(false)
  const [showEmpty, setShowEmpty] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmVariant, setConfirmVariant] = useState<'danger' | 'warning' | 'info'>('danger')
  const [loading, setLoading] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setShowConfirm(false)
    alert('Action confirmed!')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🧪 Phase 1 Testing Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Test all Phase 1 improvements in one place
            </p>
          </div>
          
          {/* Theme Toggle Test */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-6 h-6 text-yellow-500" />
            ) : (
              <Moon className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Test 1: Dark Mode */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            ✅ Test 1: Dark Mode Theme System
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-300">
                Current Theme: <strong>{theme}</strong>
              </span>
              <button onClick={toggleTheme} className="btn-primary">
                Toggle Theme
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Card Background</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">Border Style</p>
              </div>
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-sm text-primary-700 dark:text-primary-300">Accent Color</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Danger Button
              </button>
            </div>

            <input 
              type="text" 
              placeholder="Test input field" 
              className="input"
            />

            <div className="flex gap-2">
              <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Badge 1
              </span>
              <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Badge 2
              </span>
              <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Badge 3
              </span>
            </div>
          </div>
        </div>

        {/* Test 2: Loading Skeletons */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            ✅ Test 2: Loading Skeletons
          </h2>
          <div className="space-y-4">
            <button 
              onClick={() => {
                setShowLoading(true)
                setTimeout(() => setShowLoading(false), 3000)
              }}
              className="btn-primary"
            >
              Show Loading States (3s)
            </button>

            {showLoading ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Card Skeleton</h3>
                  <CardSkeleton />
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Table Skeleton</h3>
                  <TableSkeleton rows={5} />
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Chart Skeleton</h3>
                  <ChartSkeleton />
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Transaction Skeleton</h3>
                  <TransactionSkeleton count={3} />
                </div>
              </div>
            ) : (
              <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Click button to see loading skeletons
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Test 3: Keyboard Shortcuts */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            ✅ Test 3: Keyboard Shortcuts & Command Palette
          </h2>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200 mb-3">
                <strong>Try these shortcuts:</strong>
              </p>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>• <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">Cmd/Ctrl + K</kbd> - Open command palette</li>
                <li>• <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">↑ ↓</kbd> - Navigate commands</li>
                <li>• <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">Enter</kbd> - Execute command</li>
                <li>• <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">ESC</kbd> - Close palette</li>
              </ul>
            </div>

            <button 
              onClick={() => setShowCommandPalette(true)}
              className="btn-primary"
            >
              Open Command Palette Manually
            </button>
          </div>
        </div>

        {/* Test 4: Empty States */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            ✅ Test 4: Empty States
          </h2>
          <div className="space-y-4">
            <button 
              onClick={() => setShowEmpty(!showEmpty)}
              className="btn-secondary"
            >
              {showEmpty ? 'Hide' : 'Show'} Empty States
            </button>

            {showEmpty && (
              <div className="space-y-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    Empty State - No Payments
                  </h3>
                  <EmptyState
                    icon={Inbox}
                    title="No payments scheduled"
                    description="Get started by scheduling your first payment"
                    action={{
                      label: "Schedule Payment",
                      onClick: () => alert('Schedule payment clicked!')
                    }}
                  />
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
                    Empty State - No Suppliers (with secondary action)
                  </h3>
                  <EmptyState
                    icon={Users}
                    title="No suppliers found"
                    description="Add suppliers to your directory to get started"
                    action={{
                      label: "Add Supplier",
                      onClick: () => alert('Add supplier clicked!')
                    }}
                    secondaryAction={{
                      label: "Import CSV",
                      onClick: () => alert('Import CSV clicked!')
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test 5: Confirmation Dialogs */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            ✅ Test 5: Confirmation Dialogs
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Test different confirmation dialog variants:
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setConfirmVariant('danger')
                  setShowConfirm(true)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Danger Dialog
              </button>
              
              <button 
                onClick={() => {
                  setConfirmVariant('warning')
                  setShowConfirm(true)
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Warning Dialog
              </button>
              
              <button 
                onClick={() => {
                  setConfirmVariant('info')
                  setShowConfirm(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Info Dialog
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Test checklist:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Click confirm button (shows loading for 2s)</li>
                <li>✓ Click cancel button (closes immediately)</li>
                <li>✓ Press ESC key (closes immediately)</li>
                <li>✓ Check all three variants (danger, warning, info)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Summary */}
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            🎯 Testing Checklist
          </h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>Dark mode toggles correctly</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>Theme persists after page refresh</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>Loading skeletons animate smoothly</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>Command palette opens with Cmd/Ctrl+K</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>Arrow keys navigate command palette</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>Empty states display correctly</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>Confirmation dialogs work (all variants)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>Loading states in dialogs work</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>ESC key closes modals</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <span>All features work in both light and dark mode</span>
            </label>
          </div>
        </div>

      </div>

      {/* Command Palette */}
      <CommandPalette />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={
          confirmVariant === 'danger' ? 'Delete Payment?' :
          confirmVariant === 'warning' ? 'Proceed with Action?' :
          'Confirm Action'
        }
        description={
          confirmVariant === 'danger' ? 'This action cannot be undone. The payment will be permanently deleted.' :
          confirmVariant === 'warning' ? 'This action may have consequences. Are you sure you want to continue?' :
          'Please confirm that you want to proceed with this action.'
        }
        variant={confirmVariant}
        confirmText={
          confirmVariant === 'danger' ? 'Yes, Delete' :
          confirmVariant === 'warning' ? 'Yes, Proceed' :
          'Confirm'
        }
        cancelText="Cancel"
        loading={loading}
      />
    </div>
  )
}