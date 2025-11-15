'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Zap, DollarSign, Settings, BarChart3, Users, FileText, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getModifierKey } from '@/lib/useKeyboardShortcuts'

interface Command {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  keywords: string[]
  category: string
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const commands: Command[] = [
    {
      id: 'home',
      label: 'Go to Home',
      icon: <Home className="w-4 h-4" />,
      action: () => {
        router.push('/')
        setIsOpen(false)
      },
      keywords: ['home', 'landing', 'main'],
      category: 'Navigation'
    },
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => {
        router.push('/dashboard')
        setIsOpen(false)
      },
      keywords: ['dashboard', 'overview', 'main'],
      category: 'Navigation'
    },
    {
      id: 'schedule-payment',
      label: 'Schedule Payment',
      icon: <DollarSign className="w-4 h-4" />,
      action: () => {
        router.push('/dashboard?action=schedule')
        setIsOpen(false)
      },
      keywords: ['payment', 'send', 'schedule', 'pay', 'transfer'],
      category: 'Actions'
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      icon: <Zap className="w-4 h-4" />,
      action: () => {
        router.push('/dashboard?tab=analytics')
        setIsOpen(false)
      },
      keywords: ['analytics', 'stats', 'reports', 'data', 'metrics'],
      category: 'Navigation'
    },
    {
      id: 'manage-suppliers',
      label: 'Manage Suppliers',
      icon: <Users className="w-4 h-4" />,
      action: () => {
        router.push('/dashboard?tab=suppliers')
        setIsOpen(false)
      },
      keywords: ['suppliers', 'vendors', 'contacts', 'directory'],
      category: 'Navigation'
    },
    {
      id: 'view-transactions',
      label: 'View Transactions',
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        router.push('/dashboard?tab=transactions')
        setIsOpen(false)
      },
      keywords: ['transactions', 'history', 'payments', 'activity'],
      category: 'Navigation'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        router.push('/settings')
        setIsOpen(false)
      },
      keywords: ['settings', 'preferences', 'config', 'configuration'],
      category: 'Navigation'
    },
  ]

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.keywords.some(kw => kw.includes(search.toLowerCase()))
  )

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = []
    }
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
        }
        if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault()
          filteredCommands[selectedIndex].action()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50 animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No commands found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {category}
                </div>
                {cmds.map((cmd, index) => {
                  const globalIndex = filteredCommands.indexOf(cmd)
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                        globalIndex === selectedIndex
                          ? 'bg-primary-100 dark:bg-primary-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        globalIndex === selectedIndex
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {cmd.icon}
                      </div>
                      <span className={`font-medium ${
                        globalIndex === selectedIndex
                          ? 'text-primary-900 dark:text-primary-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {cmd.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">ESC</kbd>
              Close
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
              {getModifierKey()}K
            </kbd>
            to open
          </span>
        </div>
      </div>
    </div>
  )
}