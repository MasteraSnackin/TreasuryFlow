'use client'

import { useState } from 'react'
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react'
import {
  useNotifications,
  Notification,
  NotificationPriority,
  NotificationCategory,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from '@/lib/notifications'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { notifications, unreadCount } = useNotifications({
    unreadOnly: filter === 'unread',
    limit: 50
  })

  function getPriorityColor(priority: NotificationPriority): string {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'text-red-600 bg-red-50 border-red-200'
      case NotificationPriority.HIGH:
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case NotificationPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  function getCategoryIcon(category: NotificationCategory) {
    switch (category) {
      case NotificationCategory.PAYMENT:
        return <CheckCircle className="w-5 h-5" />
      case NotificationCategory.APPROVAL:
        return <AlertCircle className="w-5 h-5" />
      case NotificationCategory.SECURITY:
        return <AlertTriangle className="w-5 h-5" />
      case NotificationCategory.TREASURY:
        return <Info className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filter === 'unread'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Clear all notifications?')) {
                        clearAllNotifications()
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                  <button
                    onClick={() => window.location.href = '/settings#notifications'}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded ml-auto"
                  >
                    <Settings className="w-3 h-3" />
                    Settings
                  </button>
                </div>
              )}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No notifications</p>
                  <p className="text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getPriorityColor(notification.priority)}`}>
                          {getCategoryIcon(notification.category)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`font-medium text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>

                            {notification.actionLabel && (
                              <span className="text-xs text-blue-600 font-medium">
                                {notification.actionLabel} →
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}