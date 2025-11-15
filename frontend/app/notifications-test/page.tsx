'use client'

import { useState, useEffect } from 'react'
import { 
  sendNotification, 
  NotificationTemplates,
  NotificationChannel,
  NotificationCategory,
  NotificationPriority,
  requestNotificationPermission,
  useNotifications
} from '@/lib/notifications'
import NotificationCenter from '@/components/NotificationCenter'
import NotificationPreferences from '@/components/NotificationPreferences'
import { Bell, Send, Settings, TestTube } from 'lucide-react'

export default function NotificationsTestPage() {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default')
  const [testResult, setTestResult] = useState<string>('')
  const { notifications, unreadCount } = useNotifications()

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission)
    }

    // Generate sample notifications on mount
    generateSampleNotifications()
  }, [])

  async function handleRequestPermission() {
    const permission = await requestNotificationPermission()
    setBrowserPermission(permission)
    setTestResult(permission === 'granted' ? '✅ Permission granted!' : '❌ Permission denied')
  }

  async function generateSampleNotifications() {
    // Wait a bit for component to mount
    await new Promise(resolve => setTimeout(resolve, 500))

    // Payment notifications
    await sendNotification(
      NotificationTemplates.paymentScheduled('2500', 'USDC', '0x742d35Cc6634C0532925a3b844Bc9e7595f5678')
    )

    await sendNotification(
      NotificationTemplates.paymentExecuted('1000', 'USDC', '0xabcdef1234567890')
    )

    // Approval notification
    await sendNotification(
      NotificationTemplates.approvalRequired('15000', 'USDC', 5)
    )

    // Security alert
    await sendNotification(
      NotificationTemplates.securityAlert('Multiple failed login attempts detected from unknown IP')
    )

    // Low balance warning
    await sendNotification(
      NotificationTemplates.lowBalance('EURC', '450', '1000')
    )
  }

  async function testPaymentNotification() {
    setTestResult('Sending payment notification...')
    try {
      await sendNotification(
        NotificationTemplates.paymentExecuted(
          '5000',
          'USDC',
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        )
      )
      setTestResult('✅ Payment notification sent!')
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async function testApprovalNotification() {
    setTestResult('Sending approval notification...')
    try {
      await sendNotification(
        NotificationTemplates.approvalRequired('25000', 'EURC', 10)
      )
      setTestResult('✅ Approval notification sent!')
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async function testSecurityAlert() {
    setTestResult('Sending security alert...')
    try {
      await sendNotification(
        NotificationTemplates.securityAlert('Suspicious activity: Large withdrawal attempt detected')
      )
      setTestResult('✅ Security alert sent!')
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async function testCustomNotification() {
    setTestResult('Sending custom notification...')
    try {
      await sendNotification({
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.MEDIUM,
        title: 'Custom Test Notification',
        message: 'This is a custom notification with all channels enabled',
        channels: [
          NotificationChannel.BROWSER,
          NotificationChannel.EMAIL,
          NotificationChannel.TELEGRAM,
          NotificationChannel.DISCORD,
          NotificationChannel.IN_APP
        ],
        actionUrl: '/notifications-test',
        actionLabel: 'View Test Page'
      })
      setTestResult('✅ Custom notification sent!')
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Notification Center */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TestTube className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Notifications Test Page</h1>
                <p className="text-sm text-gray-600">Test and debug Phase 3 notification system</p>
              </div>
            </div>
            <NotificationCenter />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <div className="space-y-6">
            {/* Browser Permission */}
            <div className="card">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Browser Notifications
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                  <p className="font-semibold">
                    {browserPermission === 'granted' && '✅ Granted'}
                    {browserPermission === 'denied' && '❌ Denied'}
                    {browserPermission === 'default' && '⏳ Not Requested'}
                  </p>
                </div>

                {browserPermission !== 'granted' && (
                  <button
                    onClick={handleRequestPermission}
                    className="btn-primary w-full"
                  >
                    Request Browser Permission
                  </button>
                )}

                <p className="text-xs text-gray-500">
                  Browser notifications require user permission. Click the button above to request access.
                </p>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="card">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Test Notifications
              </h2>

              <div className="space-y-3">
                <button
                  onClick={testPaymentNotification}
                  className="btn-primary w-full"
                >
                  💰 Test Payment Notification
                </button>

                <button
                  onClick={testApprovalNotification}
                  className="btn-secondary w-full"
                >
                  ✋ Test Approval Notification
                </button>

                <button
                  onClick={testSecurityAlert}
                  className="btn-secondary w-full"
                >
                  🚨 Test Security Alert
                </button>

                <button
                  onClick={testCustomNotification}
                  className="btn-secondary w-full"
                >
                  ⚙️ Test Custom Notification
                </button>

                <button
                  onClick={generateSampleNotifications}
                  className="btn-secondary w-full"
                >
                  🔄 Generate Sample Notifications
                </button>
              </div>

              {testResult && (
                <div className={`mt-4 p-3 rounded-lg ${
                  testResult.includes('✅') ? 'bg-green-50 text-green-700' : 
                  testResult.includes('❌') ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {testResult}
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="card">
              <h2 className="text-lg font-bold mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{notifications.length}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 mb-1">Unread</p>
                  <p className="text-2xl font-bold text-red-900">{unreadCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <div className="card mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Configure which channels and priorities you want to receive
              </p>
            </div>
            <NotificationPreferences />
          </div>
        </div>

        {/* Debug Information */}
        <div className="card mt-6">
          <h2 className="text-lg font-bold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm font-mono">
            <p><strong>Browser Support:</strong> {'Notification' in window ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Permission:</strong> {browserPermission}</p>
            <p><strong>Total Notifications:</strong> {notifications.length}</p>
            <p><strong>Unread Count:</strong> {unreadCount}</p>
            <p><strong>Local Storage:</strong> {typeof localStorage !== 'undefined' ? '✅ Available' : '❌ Not Available'}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="card mt-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-bold mb-4 text-blue-900">Testing Instructions</h2>
          <ol className="space-y-2 text-sm text-blue-800">
            <li><strong>1.</strong> Click "Request Browser Permission" to enable desktop notifications</li>
            <li><strong>2.</strong> Click any test button to send a notification</li>
            <li><strong>3.</strong> Check the notification center (bell icon) to see in-app notifications</li>
            <li><strong>4.</strong> Configure preferences to test different channels</li>
            <li><strong>5.</strong> Open browser console to see API calls and logs</li>
            <li><strong>6.</strong> Test quiet hours by setting them in preferences</li>
          </ol>
        </div>
      </div>
    </div>
  )
}