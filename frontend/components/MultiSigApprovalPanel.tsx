'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { CheckCircle, XCircle, Clock, Users, Shield, AlertTriangle } from 'lucide-react'
import { useWallet } from '@/lib/useWallet'
import { getVaultContract } from '@/lib/contracts'
import { CardSkeleton } from './LoadingSkeleton'
import ConfirmDialog from './ConfirmDialog'
import { useToast } from './Toast'

interface Payment {
  id: number
  recipient: string
  recipientName?: string
  amount: string
  currency: string
  description: string
  nextExecutionTime: number
  requiresApproval: boolean
  approved: boolean
  approvalCount: number
  requiredApprovals: number
  approvalDeadline: number
  approvers: string[]
  hasApproved: boolean
  canExecute: boolean
  active: boolean
}

export default function MultiSigApprovalPanel() {
  const { address, isConnected } = useWallet()
  const { showToast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [isApprover, setIsApprover] = useState(false)
  const [requiredApprovals, setRequiredApprovals] = useState(2)
  const [approverCount, setApproverCount] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      loadApprovalData()
      const interval = setInterval(loadApprovalData, 10000) // Refresh every 10s
      return () => clearInterval(interval)
    }
  }, [isConnected, address])

  async function loadApprovalData() {
    try {
      const vault = getVaultContract() as ethers.Contract
      
      // Check if user is approver
      const approverStatus = await vault.approvers(address) as boolean
      setIsApprover(approverStatus)

      // Get multi-sig config
      const required = await vault.requiredApprovals()
      setRequiredApprovals(Number(required))

      // Get approver count (simplified - in production, track this properly)
      setApproverCount(3) // Mock for now

      // Get payment count
      const count = await vault.paymentCount()
      const paymentList: Payment[] = []

      // Load all payments
      for (let i = 0; i < Number(count); i++) {
        const payment = await vault.getPayment(i)
        
        if (!payment.active || !payment.requiresApproval) continue

        // Get approval status
        const approvalStatus = await vault.getApprovalStatus(i)
        const hasApproved = await vault.hasApproved(i, address)
        
        const now = Math.floor(Date.now() / 1000)
        const canExecute = 
          approvalStatus.approvalCount >= required &&
          now >= payment.nextExecutionTime &&
          now >= approvalStatus.approvalDeadline

        paymentList.push({
          id: i,
          recipient: payment.recipient,
          recipientName: payment.description.split(' - ')[0] || 'Unknown',
          amount: ethers.formatUnits(payment.amount, 6),
          currency: payment.token.toLowerCase().includes('eurc') ? 'EURC' : 'USDC',
          description: payment.description,
          nextExecutionTime: Number(payment.nextExecutionTime),
          requiresApproval: payment.requiresApproval,
          approved: payment.approved,
          approvalCount: Number(approvalStatus.approvalCount),
          requiredApprovals: Number(required),
          approvalDeadline: Number(approvalStatus.approvalDeadline),
          approvers: approvalStatus.approvers,
          hasApproved,
          canExecute,
          active: payment.active
        })
      }

      setPayments(paymentList)
    } catch (error) {
      console.error('Failed to load approval data:', error)
      showToast({
        type: 'error',
        title: 'Failed to load approvals',
        message: 'Please refresh the page'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(payment: Payment) {
    setSelectedPayment(payment)
    setShowApproveDialog(true)
  }

  async function confirmApprove() {
    if (!selectedPayment) return

    setProcessing(true)
    try {
      const vault = await getVaultContract(true) as ethers.Contract
      const tx = await vault.approvePayment(selectedPayment.id)
      
      showToast({
        type: 'info',
        title: 'Approval submitted',
        message: 'Waiting for confirmation...'
      })

      await tx.wait()

      showToast({
        type: 'success',
        title: 'Payment approved!',
        message: `${selectedPayment.approvalCount + 1}/${selectedPayment.requiredApprovals} approvals`
      })

      await loadApprovalData()
    } catch (error: any) {
      console.error('Approval failed:', error)
      showToast({
        type: 'error',
        title: 'Approval failed',
        message: error.reason || error.message
      })
    } finally {
      setProcessing(false)
      setShowApproveDialog(false)
      setSelectedPayment(null)
    }
  }

  async function handleRevoke(payment: Payment) {
    setSelectedPayment(payment)
    setShowRevokeDialog(true)
  }

  async function confirmRevoke() {
    if (!selectedPayment) return

    setProcessing(true)
    try {
      const vault = await getVaultContract(true) as ethers.Contract
      const tx = await vault.revokeApproval(selectedPayment.id)
      
      showToast({
        type: 'info',
        title: 'Revocation submitted',
        message: 'Waiting for confirmation...'
      })

      await tx.wait()

      showToast({
        type: 'success',
        title: 'Approval revoked',
        message: 'Your approval has been withdrawn'
      })

      await loadApprovalData()
    } catch (error: any) {
      console.error('Revocation failed:', error)
      showToast({
        type: 'error',
        title: 'Revocation failed',
        message: error.reason || error.message
      })
    } finally {
      setProcessing(false)
      setShowRevokeDialog(false)
      setSelectedPayment(null)
    }
  }

  function formatTimeRemaining(timestamp: number): string {
    const now = Math.floor(Date.now() / 1000)
    const diff = timestamp - now

    if (diff <= 0) return 'Ready'

    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
        <p className="text-gray-600">Connect your wallet to view pending approvals</p>
      </div>
    )
  }

  if (!isApprover) {
    return (
      <div className="card text-center py-12">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Not an Approver</h3>
        <p className="text-gray-600">Your wallet is not authorized to approve payments</p>
        <p className="text-sm text-gray-500 mt-2">Contact the treasury owner to be added as an approver</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  const pendingPayments = payments.filter(p => p.approvalCount < p.requiredApprovals)
  const readyPayments = payments.filter(p => p.canExecute)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Multi-Sig Config</p>
              <p className="text-2xl font-bold">{requiredApprovals}-of-{approverCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold">{pendingPayments.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ready to Execute</p>
              <p className="text-2xl font-bold">{readyPayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Approvals</h3>
          <div className="space-y-3">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{payment.recipientName}</h4>
                      <span className="badge bg-yellow-100 text-yellow-800">
                        {payment.approvalCount}/{payment.requiredApprovals} Approved
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{payment.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-semibold">{payment.amount} {payment.currency}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Recipient</p>
                        <p className="font-mono text-xs">{payment.recipient.slice(0, 10)}...</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Timelock</p>
                        <p className="font-semibold">{formatTimeRemaining(payment.approvalDeadline)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Your Status</p>
                        <p className={`font-semibold ${payment.hasApproved ? 'text-green-600' : 'text-gray-600'}`}>
                          {payment.hasApproved ? '✓ Approved' : 'Not Approved'}
                        </p>
                      </div>
                    </div>

                    {/* Approvers List */}
                    {payment.approvers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">Approved by:</p>
                        <div className="flex flex-wrap gap-2">
                          {payment.approvers.map((approver, idx) => (
                            <span key={idx} className="badge bg-green-100 text-green-800 text-xs font-mono">
                              {approver.slice(0, 6)}...{approver.slice(-4)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {!payment.hasApproved ? (
                      <button
                        onClick={() => handleApprove(payment)}
                        disabled={processing}
                        className="btn-primary whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRevoke(payment)}
                        disabled={processing}
                        className="btn-secondary whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4 inline mr-2" />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready to Execute */}
      {readyPayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Ready to Execute</h3>
          <div className="space-y-3">
            {readyPayments.map((payment) => (
              <div key={payment.id} className="card bg-green-50 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h4 className="font-semibold text-lg">{payment.recipientName}</h4>
                      <span className="badge bg-green-600 text-white">
                        Fully Approved
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{payment.description}</p>
                    <p className="text-lg font-bold text-green-700">
                      {payment.amount} {payment.currency}
                    </p>
                  </div>
                  <div className="text-sm text-green-700">
                    <p className="font-semibold">✓ {payment.approvalCount}/{payment.requiredApprovals} Approved</p>
                    <p>✓ Timelock expired</p>
                    <p>✓ Ready to execute</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {payments.length === 0 && (
        <div className="card text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
          <p className="text-gray-600">No payments pending approval</p>
        </div>
      )}

      {/* Approve Dialog */}
      {showApproveDialog && selectedPayment && (
        <ConfirmDialog
          isOpen={showApproveDialog}
          title="Approve Payment"
          description={`Approve payment of ${selectedPayment.amount} ${selectedPayment.currency} to ${selectedPayment.recipientName}? Current approvals: ${selectedPayment.approvalCount}/${selectedPayment.requiredApprovals}`}
          confirmText="Approve Payment"
          variant="info"
          onConfirm={confirmApprove}
          onClose={() => {
            setShowApproveDialog(false)
            setSelectedPayment(null)
          }}
          loading={processing}
        />
      )}

      {/* Revoke Dialog */}
      {showRevokeDialog && selectedPayment && (
        <ConfirmDialog
          isOpen={showRevokeDialog}
          title="Revoke Approval"
          description={`Revoke your approval for payment of ${selectedPayment.amount} ${selectedPayment.currency} to ${selectedPayment.recipientName}? This will reduce the approval count.`}
          confirmText="Revoke Approval"
          variant="danger"
          onConfirm={confirmRevoke}
          onClose={() => {
            setShowRevokeDialog(false)
            setSelectedPayment(null)
          }}
          loading={processing}
        />
      )}
    </div>
  )
}