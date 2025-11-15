/**
 * Notification System
 * 
 * Multi-channel notification delivery system supporting:
 * - Browser push notifications
 * - Email notifications
 * - Telegram bot
 * - Discord webhooks
 * - In-app notifications
 */

export enum NotificationChannel {
  BROWSER = 'BROWSER',
  EMAIL = 'EMAIL',
  TELEGRAM = 'TELEGRAM',
  DISCORD = 'DISCORD',
  IN_APP = 'IN_APP',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationCategory {
  PAYMENT = 'PAYMENT',
  APPROVAL = 'APPROVAL',
  SECURITY = 'SECURITY',
  TREASURY = 'TREASURY',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string
  timestamp: Date
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  data?: Record<string, any>
  channels: NotificationChannel[]
  read: boolean
  actionUrl?: string
  actionLabel?: string
  expiresAt?: Date
}

export interface NotificationPreferences {
  userAddress: string
  channels: {
    [NotificationChannel.BROWSER]: boolean
    [NotificationChannel.EMAIL]: boolean
    [NotificationChannel.TELEGRAM]: boolean
    [NotificationChannel.DISCORD]: boolean
    [NotificationChannel.IN_APP]: boolean
  }
  categories: {
    [NotificationCategory.PAYMENT]: NotificationPriority[]
    [NotificationCategory.APPROVAL]: NotificationPriority[]
    [NotificationCategory.SECURITY]: NotificationPriority[]
    [NotificationCategory.TREASURY]: NotificationPriority[]
    [NotificationCategory.SYSTEM]: NotificationPriority[]
  }
  email?: string
  telegramChatId?: string
  discordWebhook?: string
  quietHours?: {
    enabled: boolean
    start: string // HH:mm format
    end: string
  }
}

// In-memory storage (use database in production)
const notifications: Notification[] = []
const preferences = new Map<string, NotificationPreferences>()
const MAX_NOTIFICATIONS = 1000

/**
 * Send a notification through specified channels
 */
export async function sendNotification(
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
): Promise<Notification> {
  const fullNotification: Notification = {
    ...notification,
    id: generateId(),
    timestamp: new Date(),
    read: false,
  }

  // Store notification
  notifications.unshift(fullNotification)
  if (notifications.length > MAX_NOTIFICATIONS) {
    notifications.pop()
  }

  // Get user preferences
  const userPrefs = getUserPreferences()

  // Check if notification should be sent based on preferences
  if (!shouldSendNotification(fullNotification, userPrefs)) {
    console.log('Notification suppressed by user preferences:', fullNotification.title)
    return fullNotification
  }

  // Send through each enabled channel
  const promises: Promise<void>[] = []

  for (const channel of notification.channels) {
    if (userPrefs?.channels[channel]) {
      switch (channel) {
        case NotificationChannel.BROWSER:
          promises.push(sendBrowserNotification(fullNotification))
          break
        case NotificationChannel.EMAIL:
          promises.push(sendEmailNotification(fullNotification, userPrefs))
          break
        case NotificationChannel.TELEGRAM:
          promises.push(sendTelegramNotification(fullNotification, userPrefs))
          break
        case NotificationChannel.DISCORD:
          promises.push(sendDiscordNotification(fullNotification, userPrefs))
          break
        case NotificationChannel.IN_APP:
          // In-app notifications are handled by the UI
          break
      }
    }
  }

  // Send all notifications in parallel
  await Promise.allSettled(promises)

  // Trigger UI update
  notifyListeners(fullNotification)

  return fullNotification
}

/**
 * Get all notifications for current user
 */
export function getNotifications(filter?: {
  unreadOnly?: boolean
  category?: NotificationCategory
  priority?: NotificationPriority
  limit?: number
}): Notification[] {
  let results = [...notifications]

  if (filter?.unreadOnly) {
    results = results.filter(n => !n.read)
  }

  if (filter?.category) {
    results = results.filter(n => n.category === filter.category)
  }

  if (filter?.priority) {
    results = results.filter(n => n.priority === filter.priority)
  }

  if (filter?.limit) {
    results = results.slice(0, filter.limit)
  }

  return results
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): void {
  const notification = notifications.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
    notifyListeners(notification)
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
  notifications.forEach(n => n.read = true)
  notifyListeners(null)
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): void {
  const index = notifications.findIndex(n => n.id === notificationId)
  if (index !== -1) {
    notifications.splice(index, 1)
    notifyListeners(null)
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  notifications.length = 0
  notifyListeners(null)
}

/**
 * Get user notification preferences
 */
export function getUserPreferences(userAddress?: string): NotificationPreferences | null {
  const address = userAddress || getCurrentUserAddress()
  if (!address) return null

  let prefs = preferences.get(address)
  
  if (!prefs) {
    // Create default preferences
    prefs = {
      userAddress: address,
      channels: {
        [NotificationChannel.BROWSER]: true,
        [NotificationChannel.EMAIL]: false,
        [NotificationChannel.TELEGRAM]: false,
        [NotificationChannel.DISCORD]: false,
        [NotificationChannel.IN_APP]: true,
      },
      categories: {
        [NotificationCategory.PAYMENT]: [NotificationPriority.HIGH, NotificationPriority.URGENT],
        [NotificationCategory.APPROVAL]: [NotificationPriority.MEDIUM, NotificationPriority.HIGH, NotificationPriority.URGENT],
        [NotificationCategory.SECURITY]: [NotificationPriority.HIGH, NotificationPriority.URGENT],
        [NotificationCategory.TREASURY]: [NotificationPriority.HIGH, NotificationPriority.URGENT],
        [NotificationCategory.SYSTEM]: [NotificationPriority.URGENT],
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
    }
    preferences.set(address, prefs)
  }

  return prefs
}

/**
 * Update user notification preferences
 */
export function updateUserPreferences(
  updates: Partial<NotificationPreferences>
): NotificationPreferences {
  const address = getCurrentUserAddress()
  if (!address) throw new Error('No user address found')

  const current = getUserPreferences(address) || {
    userAddress: address,
    channels: {} as any,
    categories: {} as any,
  }

  const updated = { ...current, ...updates }
  preferences.set(address, updated)

  // Save to backend
  savePreferencesToBackend(updated).catch(console.error)

  return updated
}

/**
 * Check if notification should be sent based on preferences
 */
function shouldSendNotification(
  notification: Notification,
  prefs: NotificationPreferences | null
): boolean {
  if (!prefs) return true

  // Check category and priority preferences
  const allowedPriorities = prefs.categories[notification.category]
  if (!allowedPriorities.includes(notification.priority)) {
    return false
  }

  // Check quiet hours
  if (prefs.quietHours?.enabled && notification.priority !== NotificationPriority.URGENT) {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    if (isInQuietHours(currentTime, prefs.quietHours.start, prefs.quietHours.end)) {
      return false
    }
  }

  return true
}

function isInQuietHours(current: string, start: string, end: string): boolean {
  // Simple time comparison (doesn't handle midnight crossing perfectly)
  return current >= start || current <= end
}

/**
 * Send browser push notification
 */
async function sendBrowserNotification(notification: Notification): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('Browser notifications not supported')
    return
  }

  if (Notification.permission === 'granted') {
    try {
      const n = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: notification.id,
        requireInteraction: notification.priority === NotificationPriority.URGENT,
        data: notification.data,
      })

      n.onclick = () => {
        window.focus()
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl
        }
        n.close()
      }
    } catch (error) {
      console.error('Failed to send browser notification:', error)
    }
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(
  notification: Notification,
  prefs: NotificationPreferences
): Promise<void> {
  if (!prefs.email) {
    console.warn('No email address configured')
    return
  }

  try {
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: prefs.email,
        subject: notification.title,
        body: notification.message,
        priority: notification.priority,
        data: notification.data,
      }),
    })
  } catch (error) {
    console.error('Failed to send email notification:', error)
  }
}

/**
 * Send Telegram notification
 */
async function sendTelegramNotification(
  notification: Notification,
  prefs: NotificationPreferences
): Promise<void> {
  if (!prefs.telegramChatId) {
    console.warn('No Telegram chat ID configured')
    return
  }

  try {
    await fetch('/api/notifications/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: prefs.telegramChatId,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
      }),
    })
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
  }
}

/**
 * Send Discord notification
 */
async function sendDiscordNotification(
  notification: Notification,
  prefs: NotificationPreferences
): Promise<void> {
  if (!prefs.discordWebhook) {
    console.warn('No Discord webhook configured')
    return
  }

  try {
    await fetch('/api/notifications/discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhook: prefs.discordWebhook,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
      }),
    })
  } catch (error) {
    console.error('Failed to send Discord notification:', error)
  }
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Browser notifications not supported')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

// Helper functions

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getCurrentUserAddress(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('walletAddress')
}

async function savePreferencesToBackend(prefs: NotificationPreferences): Promise<void> {
  try {
    await fetch('/api/notifications/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    })
  } catch (error) {
    console.error('Failed to save preferences:', error)
  }
}

// Listener system for real-time updates
type NotificationListener = (notification: Notification | null) => void
const listeners: NotificationListener[] = []

export function addNotificationListener(listener: NotificationListener): () => void {
  listeners.push(listener)
  return () => {
    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }
}

function notifyListeners(notification: Notification | null): void {
  listeners.forEach(listener => listener(notification))
}

// React hook for notifications
import { useState, useEffect } from 'react'

export function useNotifications(filter?: {
  unreadOnly?: boolean
  category?: NotificationCategory
  limit?: number
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Initial load
    updateNotifications()

    // Listen for changes
    const unsubscribe = addNotificationListener(() => {
      updateNotifications()
    })

    return unsubscribe
  }, [filter])

  function updateNotifications() {
    const allNotifications = getNotifications(filter)
    setNotifications(allNotifications)
    setUnreadCount(getNotifications({ unreadOnly: true }).length)
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  paymentScheduled: (amount: string, currency: string, recipient: string) => ({
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.MEDIUM,
    title: 'Payment Scheduled',
    message: `Payment of ${amount} ${currency} scheduled to ${recipient.slice(0, 10)}...`,
    channels: [NotificationChannel.IN_APP, NotificationChannel.BROWSER],
  }),

  paymentExecuted: (amount: string, currency: string, txHash: string) => ({
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.HIGH,
    title: 'Payment Executed',
    message: `Payment of ${amount} ${currency} executed successfully`,
    channels: [NotificationChannel.IN_APP, NotificationChannel.BROWSER, NotificationChannel.EMAIL],
    data: { txHash },
    actionUrl: `/transactions?tx=${txHash}`,
    actionLabel: 'View Transaction',
  }),

  paymentFailed: (amount: string, currency: string, reason: string) => ({
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.URGENT,
    title: 'Payment Failed',
    message: `Payment of ${amount} ${currency} failed: ${reason}`,
    channels: [NotificationChannel.IN_APP, NotificationChannel.BROWSER, NotificationChannel.EMAIL, NotificationChannel.TELEGRAM],
  }),

  approvalRequired: (amount: string, currency: string, paymentId: number) => ({
    category: NotificationCategory.APPROVAL,
    priority: NotificationPriority.HIGH,
    title: 'Approval Required',
    message: `Large payment of ${amount} ${currency} requires your approval`,
    channels: [NotificationChannel.IN_APP, NotificationChannel.BROWSER, NotificationChannel.EMAIL],
    actionUrl: `/approvals?id=${paymentId}`,
    actionLabel: 'Review Payment',
  }),

  approvalGranted: (amount: string, currency: string, approver: string) => ({
    category: NotificationCategory.APPROVAL,
    priority: NotificationPriority.MEDIUM,
    title: 'Payment Approved',
    message: `Payment of ${amount} ${currency} approved by ${approver.slice(0, 10)}...`,
    channels: [NotificationChannel.IN_APP, NotificationChannel.BROWSER],
  }),

  securityAlert: (message: string) => ({
    category: NotificationCategory.SECURITY,
    priority: NotificationPriority.URGENT,
    title: 'Security Alert',
    message,
    channels: [NotificationChannel.IN_APP, NotificationChannel.BROWSER, NotificationChannel.EMAIL, NotificationChannel.TELEGRAM, NotificationChannel.DISCORD],
  }),

  lowBalance: (currency: string, balance: string, threshold: string) => ({
    category: NotificationCategory.TREASURY,
    priority: NotificationPriority.HIGH,
    title: 'Low Balance Warning',
    message: `${currency} balance (${balance}) is below threshold (${threshold})`,
    channels: [NotificationChannel.IN_APP, NotificationChannel.BROWSER, NotificationChannel.EMAIL],
  }),
}