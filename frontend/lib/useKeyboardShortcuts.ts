'use client'

import { useEffect, useCallback } from 'react'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean // Cmd on Mac, Win on Windows
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
      const altMatch = shortcut.alt ? event.altKey : !event.altKey
      const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault()
        shortcut.callback()
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Helper to get platform-specific modifier key name
export function getModifierKey(): string {
  if (typeof window === 'undefined') return 'Ctrl'
  return navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'
}

// Helper to format shortcut display
export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = []
  const modKey = getModifierKey()
  
  if (shortcut.meta) parts.push(modKey)
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  parts.push(shortcut.key.toUpperCase())
  
  return parts.join('+')
}