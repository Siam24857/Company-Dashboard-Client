'use client'

import { useEffect, useRef } from 'react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 61 (sibling) · Click heatmap — visualize where people click, learn what draws attention. */
export default function ClickHeatmap() {
  const enabled = useFlagsStore((s) => !!s.flags['click-heatmap']?.on)
  const overlayOn = useDashboardStore((s) => s.heatOverlay)
  const st = useDashboardStore

  useEffect(() => {
    if (!enabled) return
    let count = 0
    const onClick = (e) => {
      const label = e.target?.getAttribute?.('aria-label') || (typeof e.target?.textContent === 'string' ? e.target.textContent.trim().slice(0, 18) : '') || 'unknown'
      st.getState().trackInteraction(label)
      st.getState().logAction(`Heatmap click: ${label || 'unknown'} (${e.clientX},${e.clientY})`)
      if (!st.getState().heatOverlay) return
      const dot = document.createElement('span')
      dot.className = 'heat-overlay-dot'
      dot.style.left = `${e.clientX}px`
      dot.style.top = `${e.clientY}px`
      document.body.appendChild(dot)
      count++
      if (count > 120) { document.querySelectorAll('.heat-overlay-dot').forEach((d) => d.remove()); count = 0 }
      setTimeout(() => (document.body.contains(dot)) && dot.remove(), 2600)
    }
    window.addEventListener('pointerdown', onClick, true)
    return () => window.removeEventListener('pointerdown', onClick, true)
  }, [enabled])

  if (!enabled || !overlayOn) return null
  return <style>{`.heat-overlay-dot{position:fixed;z-index:130;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:9999px;background:radial-gradient(circle,rgba(0,212,255,.9),transparent 65%);mix-blend-mode:screen;pointer-events:none;animation:heatFade 2.4s ease-out forwards}`}</style>
}