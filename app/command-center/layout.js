'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/shell/Sidebar'
import Header from '@/components/shell/Header'
import PremiumBar from '@/components/shell/PremiumBar'
import StickyFooter from '@/components/shell/StickyFooter'
import CommandPalette from '@/components/shell/CommandPalette'
import AIPanel from '@/components/shell/AIPanel'
import HUN from '@/components/shell/HUN'
import AdminPanel from '@/components/shell/AdminPanel'
import useDashboardStore from '@/store/dashboard.store'
import useAdminStore from '@/store/admin.store'
import useKeyboard from '@/hooks/useKeyboard'
import useLiveData from '@/hooks/useLiveData'
import MoodAura from '@/components/universal/MoodAura'
import StoryMode from '@/components/universal/StoryMode'
import MorningBrief from '@/components/user/MorningBrief'
import Cheatsheet from '@/components/universal/Cheatsheet'
import OfflineStaging, { useOnlineStatus } from '@/components/universal/OfflineStaging'
import UndoSnackbar from '@/components/universal/UndoSnackbar'
import EmbedDialog from '@/components/universal/EmbedDialog'
import ExplainDialog from '@/components/universal/ExplainDialog'
import ThresholdWhisperer from '@/components/universal/ThresholdWhisperer'
import HoloTooltip, { HoloAura } from '@/components/wow/HoloTooltip'
import CollabCursors from '@/components/wow/CollabCursors'
import ClickHeatmap from '@/components/wow/ClickHeatmap'

export default function CommandCenterLayout({ children }) {
  useKeyboard()
  useLiveData()
  useOnlineStatus()
  const router = useRouter()
  const focusMode = useDashboardStore((s) => s.focusMode)
  const palette = useDashboardStore((s) => s.palette)
  const scrub = useDashboardStore((s) => s.scrub)
  const maintenance = useAdminStore((s) => s.maintenance)
  const emergency = useAdminStore((s) => s.emergency)
  const themeMix = useDashboardStore((s) => s.themeMix)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-palette', palette)
    if (scrub) root.setAttribute('data-scrub', '1')
    else root.removeAttribute('data-scrub')
    if (typeof themeMix === 'number') root.style.setProperty('--theme-mix', `${Math.round(themeMix)}%`)
  }, [palette, scrub, themeMix])

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      const dna = q.get('view') || window.location.hash.replace(/^#dna=/, '')
      if (dna) useDashboardStore.getState().applyDna(dna)
    } catch { /* noop */ }
  }, [])

  return (
    <div className="flex min-h-screen text-pri">
      <HoloAura />
      {!focusMode && <Sidebar />}

      <div className="flex min-w-0 flex-1 flex-col">
        {!focusMode && <Header />}
        {!focusMode && <PremiumBar />}

        <main
          id="main"
          className="relative flex-1"
          aria-label="Command center content"
          style={{ minHeight: focusMode ? '100vh' : 'calc(100vh - 60px)' }}
        >
          {children}
        </main>

        {!focusMode && <StickyFooter />}
      </div>

      <CommandPalette push={router.push} />
      <AIPanel />

      {/* fixed/overlay layers */}
      <MoodAura />
      <StoryMode />
      <MorningBrief />
      <Cheatsheet />
      <OfflineStaging />
      <UndoSnackbar />
      <EmbedDialog />
      <ExplainDialog />
      <ThresholdWhisperer />
      <HoloTooltip />
      <CollabCursors />
      <ClickHeatmap />

      <HUN />
      <AdminPanel />

      {maintenance && (
        <div className="glass-strong fixed bottom-4 left-1/2 z-[95] -translate-x-1/2 rounded-2xl px-4 py-2 text-[11px] text-pri shadow-2xl" role="status">
          🔧 <strong>Maintenance</strong> — read-only until further notice. Your data is safe.
        </div>
      )}
      {emergency && (
        <div className="tone-critical tone-faint fixed left-0 top-0 z-[98] w-full px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-widest" role="alert">
          ⚠ Emergency lockdown active — external access blocked
        </div>
      )}
    </div>
  )
}