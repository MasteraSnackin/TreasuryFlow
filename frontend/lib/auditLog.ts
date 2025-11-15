/**
 * Audit Logging System
 * 
 * Comprehensive logging for security events, user actions, and system operations.
 * Provides searchable audit trail for compliance and security monitoring.
 */

export enum AuditEventType {
  // Authentication Events
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  WALLET_CONNECTED = 'WALLET_CONNECTED',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  
  // 2FA Events
  TWO_FA_ENABLED = 'TWO_FA_ENABLED',
  TWO_FA_DISABLED = 'TWO_FA_DISABLED',
  TWO_FA_VERIFIED = 'TWO_FA_VERIFIED',
  TWO_FA_FAILED = 'TWO_FA_FAILED',
  BACKUP_CODE_USED = 'BACKUP_CODE_USED',
  
  // Payment Events
  PAYMENT_SCHEDULED = 'PAYMENT_SCHEDULED',
  PAYMENT_EXECUTED = 'PAYMENT_EXECUTED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  BATCH_PAYMENT_EXECUTED = 'BATCH_PAYMENT_EXECUTED',
  
  // Approval Events
  APPROVAL_REQUESTED = 'APPROVAL_REQUESTED',
  APPROVAL_GRANTED = 'APPROVAL_GRANTED',
  APPROVAL_REJECTED = 'APPROVAL_REJECTED',
  APPROVER_ADDED = 'APPROVER_ADDED',
  APPROVER_REMOVED = 'APPROVER_REMOVED',
  
  // Treasury Events
  FUNDS_DEPOSITED = 'FUNDS_DEPOSITED',
  FUNDS_WITHDRAWN = 'FUNDS_WITHDRAWN',
  CURRENCY_SWAPPED = 'CURRENCY_SWAPPED',
  REBALANCE_EXECUTED = 'REBALANCE_EXECUTED',
  
  // Supplier Events
  SUPPLIER_ADDED = 'SUPPLIER_ADDED',
  SUPPLIER_UPDATED = 'SUPPLIER_UPDATED',
  SUPPLIER_REMOVED = 'SUPPLIER_REMOVED',
  
  // Settings Events
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  THRESHOLD_UPDATED = 'THRESHOLD_UPDATED',
  NOTIFICATION_SETTINGS_CHANGED = 'NOTIFICATION_SETTINGS_CHANGED',
  
  // Security Events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // System Events
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  API_CALL_MADE = 'API_CALL_MADE',
  CONTRACT_INTERACTION = 'CONTRACT_INTERACTION',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditLogEntry {
  id: string
  timestamp: Date
  eventType: AuditEventType
  severity: AuditSeverity
  userAddress: string | null
  ipAddress: string | null
  userAgent: string | null
  action: string
  details: Record<string, any>
  result: 'success' | 'failure' | 'pending'
  metadata?: {
    txHash?: string
    gasUsed?: string
    errorMessage?: string
    duration?: number
    [key: string]: any
  }
}

export interface AuditLogFilter {
  startDate?: Date
  endDate?: Date
  eventTypes?: AuditEventType[]
  userAddress?: string
  severity?: AuditSeverity[]
  result?: ('success' | 'failure' | 'pending')[]
  searchTerm?: string
}

// In-memory storage (use database in production)
const auditLogs: AuditLogEntry[] = []
const MAX_LOGS = 10000 // Keep last 10k logs in memory

/**
 * Log an audit event
 */
export function logAuditEvent(
  eventType: AuditEventType,
  action: string,
  details: Record<string, any>,
  options?: {
    userAddress?: string | null
    severity?: AuditSeverity
    result?: 'success' | 'failure' | 'pending'
    metadata?: Record<string, any>
  }
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateId(),
    timestamp: new Date(),
    eventType,
    severity: options?.severity || getSeverityForEventType(eventType),
    userAddress: options?.userAddress || getCurrentUserAddress(),
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    action,
    details,
    result: options?.result || 'success',
    metadata: options?.metadata
  }

  // Add to storage
  auditLogs.unshift(entry)

  // Trim if exceeds max
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.pop()
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUDIT] ${eventType}:`, entry)
  }

  // Send to backend in production
  if (process.env.NODE_ENV === 'production') {
    sendToBackend(entry).catch(console.error)
  }

  // Alert on critical events
  if (entry.severity === AuditSeverity.CRITICAL) {
    alertCriticalEvent(entry)
  }

  return entry
}

/**
 * Query audit logs with filters
 */
export function queryAuditLogs(filter?: AuditLogFilter): AuditLogEntry[] {
  let results = [...auditLogs]

  if (!filter) return results

  // Filter by date range
  if (filter.startDate) {
    results = results.filter(log => log.timestamp >= filter.startDate!)
  }
  if (filter.endDate) {
    results = results.filter(log => log.timestamp <= filter.endDate!)
  }

  // Filter by event types
  if (filter.eventTypes && filter.eventTypes.length > 0) {
    results = results.filter(log => filter.eventTypes!.includes(log.eventType))
  }

  // Filter by user address
  if (filter.userAddress) {
    results = results.filter(log => 
      log.userAddress?.toLowerCase() === filter.userAddress!.toLowerCase()
    )
  }

  // Filter by severity
  if (filter.severity && filter.severity.length > 0) {
    results = results.filter(log => filter.severity!.includes(log.severity))
  }

  // Filter by result
  if (filter.result && filter.result.length > 0) {
    results = results.filter(log => filter.result!.includes(log.result))
  }

  // Search term (searches action and details)
  if (filter.searchTerm) {
    const term = filter.searchTerm.toLowerCase()
    results = results.filter(log => 
      log.action.toLowerCase().includes(term) ||
      JSON.stringify(log.details).toLowerCase().includes(term)
    )
  }

  return results
}

/**
 * Get audit statistics
 */
export function getAuditStats(filter?: AuditLogFilter) {
  const logs = queryAuditLogs(filter)

  const stats = {
    total: logs.length,
    byEventType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    byResult: {} as Record<string, number>,
    byUser: {} as Record<string, number>,
    recentCritical: logs.filter(l => l.severity === AuditSeverity.CRITICAL).slice(0, 10),
    recentFailures: logs.filter(l => l.result === 'failure').slice(0, 10),
  }

  logs.forEach(log => {
    // Count by event type
    stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1

    // Count by severity
    stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1

    // Count by result
    stats.byResult[log.result] = (stats.byResult[log.result] || 0) + 1

    // Count by user
    if (log.userAddress) {
      stats.byUser[log.userAddress] = (stats.byUser[log.userAddress] || 0) + 1
    }
  })

  return stats
}

/**
 * Export audit logs to CSV
 */
export function exportAuditLogsToCSV(filter?: AuditLogFilter): string {
  const logs = queryAuditLogs(filter)

  const headers = [
    'Timestamp',
    'Event Type',
    'Severity',
    'User Address',
    'Action',
    'Result',
    'Details',
    'TX Hash',
    'IP Address'
  ]

  const rows = logs.map(log => [
    log.timestamp.toISOString(),
    log.eventType,
    log.severity,
    log.userAddress || 'N/A',
    log.action,
    log.result,
    JSON.stringify(log.details),
    log.metadata?.txHash || 'N/A',
    log.ipAddress || 'N/A'
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  return csv
}

/**
 * Export audit logs to JSON
 */
export function exportAuditLogsToJSON(filter?: AuditLogFilter): string {
  const logs = queryAuditLogs(filter)
  return JSON.stringify(logs, null, 2)
}

/**
 * Clear old audit logs (retention policy)
 */
export function clearOldLogs(daysToKeep: number = 90) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const initialCount = auditLogs.length
  const filtered = auditLogs.filter(log => log.timestamp >= cutoffDate)
  
  auditLogs.length = 0
  auditLogs.push(...filtered)

  const removed = initialCount - auditLogs.length
  console.log(`Cleared ${removed} audit logs older than ${daysToKeep} days`)

  return removed
}

// Helper functions

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getSeverityForEventType(eventType: AuditEventType): AuditSeverity {
  const criticalEvents = [
    AuditEventType.TWO_FA_DISABLED,
    AuditEventType.APPROVER_REMOVED,
    AuditEventType.FUNDS_WITHDRAWN,
    AuditEventType.SUSPICIOUS_ACTIVITY,
  ]

  const warningEvents = [
    AuditEventType.LOGIN_FAILED,
    AuditEventType.TWO_FA_FAILED,
    AuditEventType.PAYMENT_FAILED,
    AuditEventType.RATE_LIMIT_EXCEEDED,
    AuditEventType.ACCESS_DENIED,
  ]

  const errorEvents = [
    AuditEventType.ERROR_OCCURRED,
    AuditEventType.PAYMENT_CANCELLED,
  ]

  if (criticalEvents.includes(eventType)) return AuditSeverity.CRITICAL
  if (warningEvents.includes(eventType)) return AuditSeverity.WARNING
  if (errorEvents.includes(eventType)) return AuditSeverity.ERROR
  return AuditSeverity.INFO
}

function getCurrentUserAddress(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('walletAddress')
}

function getClientIP(): string | null {
  // In browser, this would come from server
  return null
}

function getUserAgent(): string | null {
  if (typeof window === 'undefined') return null
  return window.navigator.userAgent
}

async function sendToBackend(entry: AuditLogEntry): Promise<void> {
  try {
    await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    })
  } catch (error) {
    console.error('Failed to send audit log to backend:', error)
  }
}

function alertCriticalEvent(entry: AuditLogEntry): void {
  console.error('🚨 CRITICAL AUDIT EVENT:', entry)
  
  // Send alert notification
  if (typeof window !== 'undefined') {
    // Could trigger toast notification, email, etc.
  }
}

// React hook for audit logs
export function useAuditLogs(filter?: AuditLogFilter) {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchLogs = () => {
      const filtered = queryAuditLogs(filter)
      setLogs(filtered)
      setStats(getAuditStats(filter))
      setLoading(false)
    }

    fetchLogs()

    // Refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [filter])

  const exportCSV = () => {
    const csv = exportAuditLogsToCSV(filter)
    downloadFile(csv, 'audit-logs.csv', 'text/csv')
  }

  const exportJSON = () => {
    const json = exportAuditLogsToJSON(filter)
    downloadFile(json, 'audit-logs.json', 'application/json')
  }

  return { logs, stats, loading, exportCSV, exportJSON }
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// Import React for hook
import React from 'react'