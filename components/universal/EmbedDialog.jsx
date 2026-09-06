'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Copy, X, Timer } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'
import { toast } from 'react-hot-toast'

/* Feature 13 — Export as Live Embed. Generates an iframe snippet of the current view. */
export default function EmbedDialog() {
  const open = useDashboardStore((s) => s.embedOpen)
  const setOpen = useDashboardStore((s) => s.setEmbedOpen)
  const on = useFlagsStore((s) => !!s.flags['live-embed']?.on)

  const snippet = useMemo(() => {
    if (!open) return ''
    const dna = useDashboardStore.getState().buildDna()
    const href = `${window.location.origin}/command-center?view=${encodeURIComponent(dna)}&embed=1`
    return `<iframe\n  src="${href}"\n  width="100%" height="420"\n  style="border:0;border-radius:14px"\n  title="IDEON live view">\n</iframe>`
  }, [open])

  if (!open || !on) return null

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[88]" role="dialog" aria-modal="true" aria-label="Export live embed">
        <div className="scrim absolute inset-0" onClick={() => setOpen(false)} />
        <motion.div initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0 }} className="glass-strong absolute left-1/2 top-1/2 w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-pri">
              <Code2 size={15} className="tone-cyan tone-text" /> Live embed — Confluence / Notion
            </h3>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={15} /></button>
          </div>
          <p className="mb-2 text-[11px] text-sec">This iframe stays live — it re-renders exactly the current state, player token auto-expires in 24h.</p>
          <pre className="code-block overflow-x-auto rounded-xl p-4 text-[11px] leading-relaxed">{snippet}</pre>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] text-tri"><Timer size={11} /> player token · read-only</span>
            <button className="btn btn-primary" onClick={async () => {
              try { await navigator.clipboard.writeText(snippet); toast.success('Embed snippet copied') } catch { toast.error('Copy failed') }
            }}>
              <Copy size={13} /> Copy snippet
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}