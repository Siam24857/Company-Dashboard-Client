'use client'

import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { toast } from 'react-hot-toast'
import { Clone } from 'lucide-react'

/* Feature 6 — One-Click Clone View. Opens the exact view (layout + filters) in a new tab. */
export default function CloneView({ label = 'Clone view' }) {
  const on = useFlagsStore((s) => !!s.flags['clone-view']?.on)
  if (!on) return null
  return (
    <button
      className="btn"
      onClick={() => {
        const dna = useDashboardStore.getState().buildDna()
        const url = `${window.location.origin}/command-center?view=${encodeURIComponent(dna)}`
        window.open(url, '_blank', 'noopener')
        useDashboardStore.getState().logAction('Cloned view into a new tab')
        toast.success('Cloned into a new tab — DNA encoded in URL')
      }}
      title="Duplicate current view + filters to a new tab"
    >
      <Clone size={13} /> <span className="hidden sm:inline">{label}</span>
    </button>
  )
}