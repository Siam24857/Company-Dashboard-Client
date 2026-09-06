'use client'

import { useEffect } from 'react'
import useDashboardStore from '@/store/dashboard.store'

const isMod = (e) => e.metaKey || e.ctrlKey

export default function useKeyboard() {
  useEffect(() => {
    const handler = (e) => {
      const s = useDashboardStore.getState()

      if (isMod(e) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        s.setCommandOpen(!s.commandOpen)
        return
      }
      if (isMod(e) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        s.toggleSidebar()
        return
      }
      if (isMod(e) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        s.setAiOpen(!s.aiOpen)
        return
      }
      if (e.key === 'Escape') {
        if (s.commandOpen) return s.setCommandOpen(false)
        if (s.aiOpen) return s.setAiOpen(false)
        if (s.focusMode) return s.setFocusMode(false)
      }
      if (isMod(e) && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        s.setTheme(s.theme === 'dark' ? 'light' : 'dark')
      }
      if (isMod(e) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        s.setFocusMode(!s.focusMode, null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}

export { useKeyboard }