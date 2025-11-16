'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/useWallet'
import { getVaultContract, CONTRACTS, formatCurrency } from '@/lib/contracts'
import { isDemoMode, DEMO_DATA } from '@/lib/demoData'
import { ArrowLeft, CheckSquare, Square, Zap, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react'

interface Payment {
  id: number
  recipient: string
  recipientName?: string
  amount: string
  token: string
  nextExecution: Date
  description: string
  requiresApproval: boolean
  approved: boolean
  selected?: boolean
}

export default function BatchExecutePage() {
  const router = useRouter()
  const { address, isConnected } = useWallet()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isConnected) {
      loadPayments()
    }
  }, [isConnected])

  async function loadPayments() {
    try {
      setLoading(true)
      
      if (isDemoMode()) {
        // Use demo data
        const demoPayments = DEMO_DATA.payments.map(p => ({
          ...p,
          recipientName: p.recipientName || 'Unknown',
          selected: true // Pre-select all ready payments
        }))
        setPayments(demoPayments)
      } else {
        // Load from contract
        const vault = await getVaultContract()
        const paymentCount = await vault.paymentCount()
        const paymentList: Payment[] = []
        
        for (let i = 0; i < Number(paymentCount); i++) {
          const payment = await vault.getPayment(i)
          if (payment.active) {
            const isReady = Date.now() >= Number(payment.nextExecutionTime) * 1000
            const canExecute = !payment.requiresApproval || payment.approved
            
            paymentList.push({
              id: i,
              recipient: payment.recipient,
              amount: formatCurrency(payment.amount),
              token: payment.token === CONTRACTS.USDC ? 'USDC' : 'EURC',
              nextExecution: new Date(Number(payment.nextExecutionTime) * 1000),
              description: payment.description,
              requiresApproval: payment.requiresApproval,
              approved: payment.approved,
              selected: isReady && canExecute
            })
          }
        }
        
        setPayments(paymentList)
      }
    } catch (error) {
      console.error('Failed to load payments:', error)
    } finally {
      setLoading(false)
    }
  }

  function togglePayment(id: number) {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ))
  }

  function toggleAll() {
    const allSelected = selectedPayments.length === readyPayments.length
    setPayments(payments.map(p => {
      const isReady = Date.now() >= p.nextExecution.getTime()
      const canExecute = !p.requiresApproval || p.approved
      return isReady && canExecute ? { ...p, selected: !allSelected } : p
    }))
  }

  async function executeBatch() {
    if (!isConnected) {
      alert('Please connect your wallet')
      return
    }

    if (selectedPayments.length === 0) {
      alert('Please select at least one payment')
      return
    }

    setExecuting(true)

    try {
      if (isDemoMode()) {
        // Simulate execution
        await new Promise(resolve => setTimeout(resolve, 2000))
        setTxHash('0x' + Math.random().toString(16).slice(2, 66))
        setSuccess(true)
      } else {
        const vault = await getVaultContract()
        const paymentIds = selectedPayments.map(p => p.id)
        
        const tx = await vault.batchExecutePayments(paymentIds)
        setTxHash(tx.hash)
        await tx.wait()
        
        setSuccess(true)
        await loadPayments() // Reload to update next execution times
      }
    } catch (error: any) {
      console.error('Failed to execute batch:', error)
      alert(error.message || 'Failed to execute batch payments')
    } finally {
      setExecuting(false)
    }
  }

  const readyPayments = payments.filter(p => {
    const isReady = Date.now() >= p.nextExecution.getTime()
    const canExecute = !p.requiresApproval || p.approved
    return isReady && canExecute
  })

  const selectedPayments = payments.filter(p => p.selected)
  
  const totalAmount = selectedPayments.reduce((sum, p) => {
    return sum + parseFloat(p.amount)
  }, 0)

  const pendingApproval = payments.filter(p => p.requiresApproval && !p.approved)
  const notReady = payments.filter(p => Date.now() < p.nextExecution.getTime())

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Wallet Required</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to execute batch payments
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Batch Executed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            {selectedPayments.length} payment{selectedPayments.length !== 1 ? 's' : ''} executed
          </p>

          {txHash && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
              <p className="text-sm font-mono break-all">{txHash}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary flex-1"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setSuccess(false)
                setTxHash('')
                loadPayments()
              }}
              className="btn-primary flex-1"
            >
              Execute More
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Execute Batch Payments</h1>
              <p className="text-sm text-gray-500">Process multiple payments in one transaction</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payments...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-6 h-6" />
                  <span className="text-xs opacity-80">Ready</span>
                </div>
                <div className="text-3xl font-bold">{readyPayments.length}</div>
                <div className="text-sm opacity-80">Payments</div>
              </div>

              <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white">
                <div className="flex items-center justify-between mb-2">
                  <CheckSquare className="w-6 h-6" />
                  <span className="text-xs opacity-80">Selected</span>
                </div>
                <div className="text-3xl font-bold">{selectedPayments.length}</div>
                <div className="text-sm opacity-80">To Execute</div>
              </div>

              <div className="card bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-xs opacity-80">Total</span>
                </div>
                <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
                <div className="text-sm opacity-80">Amount</div>
              </div>

              <div className="card bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-xs opacity-80">Pending</span>
                </div>
                <div className="text-3xl font-bold">{notReady.length}</div>
                <div className="text-sm opacity-80">Not Ready</div>
              </div>
            </div>

            {/* Warnings */}
            {pendingApproval.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 mb-1">
                      {pendingApproval.length} Payment{pendingApproval.length !== 1 ? 's' : ''} Require Approval
                    </p>
                    <p className="text-sm text-yellow-800">
                      Large payments need approval before execution. Visit the Approvals page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ready Payments */}
            {readyPayments.length > 0 ? (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Ready for Execution</h2>
                  <button
                    onClick={toggleAll}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {selectedPayments.length === readyPayments.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  {readyPayments.map((payment) => (
                    <div
                      key={payment.id}
                      onClick={() => togglePayment(payment.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        payment.selected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {payment.selected ? (
                          <CheckSquare className="w-6 h-6 text-primary-600" />
                        ) : (
                          <Square className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{payment.description}</p>
                          {payment.recipientName && (
                            <span className="text-xs text-gray-500">• {payment.recipientName}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-mono truncate">
                          {payment.recipient}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {payment.amount} {payment.token}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ready now
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Execute Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-secondary flex-1"
                    disabled={executing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeBatch}
                    disabled={selectedPayments.length === 0 || executing}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {executing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Executing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Execute {selectedPayments.length} Payment{selectedPayments.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Payments Ready</h3>
                <p className="text-gray-600 mb-6">
                  All scheduled payments are either not ready yet or require approval
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary"
                >
                  Back to Dashboard
                </button>
              </div>
            )}

            {/* Not Ready Payments */}
            {notReady.length > 0 && (
              <div className="card mt-8">
                <h2 className="text-xl font-bold mb-4">Upcoming Payments</h2>
                <div className="space-y-3">
                  {notReady.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{payment.description}</p>
                        <p className="text-sm text-gray-600 font-mono">{payment.recipient.slice(0, 20)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {payment.amount} {payment.token}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ready: {payment.nextExecution.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}