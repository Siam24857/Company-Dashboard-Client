'use client'

import { useEffect, useRef } from 'react'

/**
 * Imperative count-up that writes into a DOM node.
 * Usage: const ref = useRef(); useRenderedCount(ref, value, {decimals});
 */
export default function useRenderedCount(
  nodeRef,
  target,
  { duration = 900, decimals = 0, delay = 0 } = {}
) {
  useEffect(() => {
    const node = nodeRef.current
    if (!node) return undefined
    let raf
    const start = performance.now() + delay
    const fmt = (n) => {
      const fixed = n.toFixed(decimals)
      return decimals > 0 ? fixed : Math.round(Number(fixed)).toLocaleString('en-US')
    }
    const step = (now) => {
      if (now < start) {
        raf = requestAnimationFrame(step)
        return
      }
      const t = Math.min(1, (now - start) / duration)
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      node.textContent = fmt(target * eased)
      if (t < 1) raf = requestAnimationFrame(step)
      else node.textContent = fmt(target)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, delay, decimals, nodeRef])
}

export const formatCount = (n, decimals = 0) =>
  decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US')