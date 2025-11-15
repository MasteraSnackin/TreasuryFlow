'use client'

import { useState, useMemo } from 'react'
import { 
  Shield, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity
} from 'lucide-react'
import { 
  AuditLogEntry, 
  AuditEventType, 
  AuditSeverity,
  AuditLogFilter,
  useAuditLogs 
} from '@/lib/auditLog'
import { format } from 'date-fns'

export default function AuditLogViewer() {
  const [filter, setFilter] = useState<AuditLogFilter>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  const { logs, stats, loading, exportCSV, exportJSON } = useAuditLogs(filter)

  // Apply search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs
    const term = searchTerm.toLowerCase()
    return logs.filter(log => 
      log.action.toLowerCase().includes(term) ||
      log.eventType.toLowerCase().includes(term) ||
      log.userAddress?.toLowerCase().includes(term) ||
      JSON.stringify(log.details).toLowerCase().includes(term)
    )
  }, [logs, searchTerm])

  function getSeverityIcon(severity: AuditSeverity) {
    switch (severity) {
      case AuditSeverity.CRITICAL:
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case AuditSeverity.ERROR:
        return <XCircle className="w-4 h-4 text-red-500" />
      case AuditSeverity.WARNING:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />
    }
  }

  function getSeverityColor(severity: AuditSeverity) {
    switch (severity) {
      case AuditSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200'
      case AuditSeverity.ERROR:
        return 'bg-red-50 text-red-700 border-red-100'
      case AuditSeverity.WARNING:
        return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      default:
        return 'bg-green-50 text-green-700 border-green-100'
    }
  }

  function getResultIcon(result: string) {
    switch (result) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Audit Log</h2>
              <p className="text-sm text-gray-600">
                {filteredLogs.length} events {searchTerm && `matching "${searchTerm}"`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary inline-flex items-center gap-2 ${
                showFilters ? 'bg-blue-100 text-blue-700' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={exportCSV}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={exportJSON}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Total Events</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Successful</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {stats.byResult.success || 0}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600 font-medium">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {stats.byResult.failure || 0}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-600 font-medium">Critical</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                {stats.bySeverity.CRITICAL || 0}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events, actions, addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="input"
                  onChange={(e) => setFilter({
                    ...filter,
                    startDate: e.target.value ? new Date(e.target.value) : undefined
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="input"
                  onChange={(e) => setFilter({
                    ...filter,
                    endDate: e.target.value ? new Date(e.target.value) : undefined
                  })}
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  className="input"
                  onChange={(e) => setFilter({
                    ...filter,
                    severity: e.target.value ? [e.target.value as AuditSeverity] : undefined
                  })}
                >
                  <option value="">All</option>
                  <option value={AuditSeverity.INFO}>Info</option>
                  <option value={AuditSeverity.WARNING}>Warning</option>
                  <option value={AuditSeverity.ERROR}>Error</option>
                  <option value={AuditSeverity.CRITICAL}>Critical</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFilter({})
                  setSearchTerm('')
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Result
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No audit logs found</p>
                    <p className="text-sm mt-1">Events will appear here as they occur</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {log.eventType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                        {getSeverityIcon(log.severity)}
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 font-mono">
                          {log.userAddress ? `${log.userAddress.slice(0, 6)}...${log.userAddress.slice(-4)}` : 'System'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {log.action}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {getResultIcon(log.result)}
                        <span className="text-sm capitalize">{log.result}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Event Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Event Type</p>
                    <p className="font-medium">{selectedLog.eventType.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Timestamp</p>
                    <p className="font-medium">
                      {format(new Date(selectedLog.timestamp), 'PPpp')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Severity</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedLog.severity)}`}>
                      {getSeverityIcon(selectedLog.severity)}
                      {selectedLog.severity}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Result</p>
                    <div className="flex items-center gap-1">
                      {getResultIcon(selectedLog.result)}
                      <span className="font-medium capitalize">{selectedLog.result}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">User Address</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                    {selectedLog.userAddress || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Action</p>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Details</p>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Metadata</p>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.ipAddress && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">IP Address</p>
                    <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}