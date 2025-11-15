'use client'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  count?: number
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  count = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%')
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={style}
        />
      ))}
    </>
  )
}

export function CardSkeleton() {
  return (
    <div className="card">
      <Skeleton height={24} className="mb-4" width="60%" />
      <Skeleton height={16} className="mb-2" />
      <Skeleton height={16} className="mb-2" width="80%" />
      <Skeleton height={16} width="40%" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="30%" />
            <Skeleton height={14} width="50%" />
          </div>
          <Skeleton height={32} width={80} />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="card">
      <Skeleton height={24} className="mb-6" width="40%" />
      <div className="h-64 flex items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            height={Math.random() * 200 + 50}
            className="flex-1"
          />
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton height={32} width={200} />
        <Skeleton height={40} width={150} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Chart */}
      <ChartSkeleton />

      {/* Table */}
      <div className="card">
        <Skeleton height={24} className="mb-4" width="30%" />
        <TableSkeleton rows={5} />
      </div>
    </div>
  )
}

export function PaymentSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton height={20} width="40%" className="mb-2" />
          <Skeleton height={16} width="60%" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Skeleton height={14} width="30%" className="mb-2" />
          <Skeleton height={40} />
        </div>
        <div>
          <Skeleton height={14} width="30%" className="mb-2" />
          <Skeleton height={40} />
        </div>
        <div>
          <Skeleton height={14} width="30%" className="mb-2" />
          <Skeleton height={40} />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Skeleton height={40} className="flex-1" />
        <Skeleton height={40} className="flex-1" />
      </div>
    </div>
  )
}

export function TransactionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton height={18} width="40%" />
            <Skeleton height={14} width="60%" />
            <Skeleton height={12} width="30%" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton height={20} width={80} />
            <Skeleton height={14} width={60} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton height={28} width={250} className="mb-2" />
        <Skeleton height={16} width={400} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton height={14} width="50%" className="mb-3" />
            <Skeleton height={32} width="70%" className="mb-2" />
            <Skeleton height={12} width="40%" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Table */}
      <div className="card">
        <Skeleton height={24} className="mb-4" width="35%" />
        <TableSkeleton rows={8} />
      </div>
    </div>
  )
}

export function SupplierSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton height={18} width={150} />
                <Skeleton height={20} width={60} />
              </div>
              <Skeleton height={14} width={200} />
              <Skeleton height={12} width={120} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right space-y-1">
              <Skeleton height={14} width={80} />
              <Skeleton height={20} width={100} />
              <Skeleton height={12} width={90} />
            </div>
            <div className="flex gap-2">
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function HealthScoreSkeleton() {
  return (
    <div className="card">
      <Skeleton height={24} width={250} className="mb-6" />
      
      {/* Score Circle */}
      <div className="flex items-center justify-center mb-8">
        <Skeleton variant="circular" width={160} height={160} />
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton variant="circular" width={20} height={20} />
              <div className="flex-1 space-y-1">
                <Skeleton height={16} width="40%" />
                <Skeleton height={12} width="60%" />
              </div>
            </div>
            <Skeleton height={18} width={60} />
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton height={18} width={150} />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={14} width={`${90 - i * 10}%`} />
          ))}
        </div>
      </div>
    </div>
  )
}