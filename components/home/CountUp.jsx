'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export default function CountUp({ target, duration = 1200, decimals = 0, suffix = '', prefix = '', className }) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(Number(target) || 0)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        const from = 0
        const to = Number(target) || 0
        const startT = performance.now()
        const tick = (t) => {
          const p = Math.min(1, (t - startT) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setValue(from + (to - from) * eased)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.unobserve(entry.target)
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  const text = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()

  return (
    <span ref={ref} className={cn('tabular', className)}>
      {prefix}
      {text}
      {suffix}
    </span>
  )
}