'use client'

import { Suspense } from 'react'
import MultiSigApprovalPanel from '@/components/MultiSigApprovalPanel'
import { CardSkeleton } from '@/components/LoadingSkeleton'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ApprovalsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Multi-Sig Approvals</h1>
              <p className="text-gray-600 mt-1">Review and approve pending payments</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Suspense fallback={
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        }>
          <MultiSigApprovalPanel />
        </Suspense>
      </div>
    </div>
  )
}