'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { reduceMotionPref } from '@/lib/utils'

function useCountUp(target, { duration = 800, decimals = 0 } = {}) {
  const [value, setValue] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    if (reduceMotionPref() || target == null) {
      setValue(Number(target) || 0)
      return
    }
    const from = 0
    const to = Number(target) || 0
    let raf
    const tick = (ts) => {
      if (startRef.current == null) startRef.current = ts
      const p = Math.min(1, (ts - startRef.current) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'cyan',
  suffix,
  prefix,
  decimals = 0,
  hint,
  className,
  onClick,
}) {
  const display = useCountUp(value != null && !isNaN(Number(value)) ? value : 0, { decimals })

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--stroke)] p-5 text-left transition-all duration-300',
        'bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)]',
        onClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-[var(--tone)] hover:shadow-[0_0_30px_-8px_var(--tone-glow)]'
          : 'cursor-default',
        `tone-${tone}`,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-[var(--text-2)]">{label}</p>
        {Icon && (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--tone-soft)', color: 'var(--tone)' }}
          >
            <Icon size={18} strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="tabular text-3xl font-semibold tracking-tight text-[var(--text-0)]">
          {prefix}
          {display}
          {suffix}
        </p>
        {hint && <p className="mt-1.5 text-xs text-[var(--text-2)]">{hint}</p>}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(600px 180px at 20% 0%, var(--tone-faint), transparent)' }}
      />
    </button>
  )
}
