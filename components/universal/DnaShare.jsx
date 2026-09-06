'use client'

import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { toast } from 'react-hot-toast'
import { Dna } from 'lucide-react'

/* Feature 16 — Dashboard DNA. Hash every view/filter combination into a shareable link. */
export default function DnaShare({ compact = false }) {
  const on = useFlagsStore((s) => !!s.flags['dna-share']?.on)
  if (!on) return null
  return (
    <button
      className={compact ? 'icon-btn' : 'btn'}
      title="Copy a hashed deep link of this exact state (Dashboard DNA)"
      onClick={async () => {
        const dna = useDashboardStore.getState().buildDna()
        const url = `${window.location.origin}/command-center#dna=${encodeURIComponent(dna)}`
        try {
          await navigator.clipboard.writeText(url)
          toast.success('Dashboard DNA copied')
        } catch {
          toast.error('Clipboard unavailable')
        }
        useDashboardStore.getState().logAction('Copied Dashboard DNA link')
      }}
    >
      <Dna size={13} /> {!compact && <span className="hidden sm:inline">Share DNA</span>}
    </button>
  )
}