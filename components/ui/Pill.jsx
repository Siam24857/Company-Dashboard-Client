'use client'
import { cn } from '@/lib/utils'

export const PRIORITY_TONE = {
  NORMAL: 'info',
  IMPORTANT: 'warn',
  URGENT: 'critical',
}

export const STATUS_TONE = {
  ACTIVE: 'success',
  PENDING: 'warn',
  SUSPENDED: 'critical',
  IN_PROGRESS: 'info',
  PLANNING: 'info',
  ON_HOLD: 'warn',
  COMPLETED: 'success',
  CANCELLED: 'critical',
  APPROVED: 'success',
  REJECTED: 'critical',
}

export default function Pill({ tone = 'info', children, className, dot = false }) {
  const toneClass = `tone-${tone}`
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase', toneClass, className)}
      style={{
        background: `var(--tone-soft)`,
        color: 'var(--tone)',
        border: '1px solid color-mix(in srgb, var(--tone) 25%, transparent)',
      }}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--tone)', boxShadow: '0 0 6px var(--tone-glow)' }} />}
      {children}
    </span>
  )
}