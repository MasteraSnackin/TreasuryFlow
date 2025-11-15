'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Hash,
  Save,
  Check
} from 'lucide-react'
import {
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
  NotificationPreferences as Prefs,
  getUserPreferences,
  updateUserPreferences,
  requestNotificationPermission
} from '@/lib/notifications'

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Prefs | null>(null)
  const [saved, setSaved] = useState(false)
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    const prefs = getUserPreferences()
    setPreferences(prefs)
    
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  async function handleRequestBrowserPermission() {
    const permission = await requestNotificationPermission()
    setBrowserPermission(permission)
    
    if (permission === 'granted' && preferences) {
      const updated = {
        ...preferences,
        channels: {
          ...preferences.channels,
          [NotificationChannel.BROWSER]: true
        }
      }
      setPreferences(updated)
      updateUserPreferences(updated)
    }
  }

  function handleChannelToggle(channel: NotificationChannel) {
    if (!preferences) return

    const updated = {
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel]
      }
    }
    setPreferences(updated)
  }

  function handleCategoryPriorityToggle(
    category: NotificationCategory,
    priority: NotificationPriority
  ) {
    if (!preferences) return

    const currentPriorities = preferences.categories[category]
    const updated = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: currentPriorities.includes(priority)
          ? currentPriorities.filter(p => p !== priority)
          : [...currentPriorities, priority]
      }
    }
    setPreferences(updated)
  }

  function handleSave() {
    if (!preferences) return

    updateUserPreferences(preferences)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!preferences) {
    return <div className="card animate-pulse">Loading preferences...</div>
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Notification Channels</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose how you want to receive notifications
        </p>

        <div className="space-y-4">
          {/* Browser Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Browser Notifications</p>
                <p className="text-sm text-gray-600">
                  {browserPermission === 'granted' 
                    ? 'Enabled - You\'ll see desktop notifications'
                    : browserPermission === 'denied'
                    ? 'Blocked - Please enable in browser settings'
                    : 'Click to enable browser notifications'}
                </p>
              </div>
            </div>
            {browserPermission === 'granted' ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.channels[NotificationChannel.BROWSER]}
                  onChange={() => handleChannelToggle(NotificationChannel.BROWSER)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            ) : (
              <button
                onClick={handleRequestBrowserPermission}
                className="btn-primary text-sm"
                disabled={browserPermission === 'denied'}
              >
                Enable
              </button>
            )}
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">
                  {preferences.email || 'No email configured'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.channels[NotificationChannel.EMAIL]}
                onChange={() => handleChannelToggle(NotificationChannel.EMAIL)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Telegram Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Telegram Notifications</p>
                <p className="text-sm text-gray-600">
                  {preferences.telegramChatId || 'Not configured'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.channels[NotificationChannel.TELEGRAM]}
                onChange={() => handleChannelToggle(NotificationChannel.TELEGRAM)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Discord Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">Discord Notifications</p>
                <p className="text-sm text-gray-600">
                  {preferences.discordWebhook ? 'Webhook configured' : 'Not configured'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.channels[NotificationChannel.DISCORD]}
                onChange={() => handleChannelToggle(NotificationChannel.DISCORD)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Notification Priorities</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose which priority levels you want to receive for each category
        </p>

        <div className="space-y-6">
          {Object.entries(preferences.categories).map(([category, priorities]) => (
            <div key={category}>
              <p className="font-medium mb-3 capitalize">
                {category.toLowerCase().replace('_', ' ')}
              </p>
              <div className="flex gap-2">
                {[
                  NotificationPriority.LOW,
                  NotificationPriority.MEDIUM,
                  NotificationPriority.HIGH,
                  NotificationPriority.URGENT
                ].map(priority => (
                  <button
                    key={priority}
                    onClick={() => handleCategoryPriorityToggle(
                      category as NotificationCategory,
                      priority
                    )}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      priorities.includes(priority)
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Quiet Hours</h3>
        <p className="text-sm text-gray-600 mb-6">
          Suppress non-urgent notifications during specific hours
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.quietHours?.enabled || false}
              onChange={(e) => setPreferences({
                ...preferences,
                quietHours: {
                  ...preferences.quietHours!,
                  enabled: e.target.checked
                }
              })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="font-medium">Enable quiet hours</span>
          </label>

          {preferences.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    quietHours: {
                      ...preferences.quietHours!,
                      start: e.target.value
                    }
                  })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    quietHours: {
                      ...preferences.quietHours!,
                      end: e.target.value
                    }
                  })}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`btn-primary inline-flex items-center gap-2 ${
            saved ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  )
}