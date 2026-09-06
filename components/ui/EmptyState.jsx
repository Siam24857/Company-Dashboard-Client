'use client'
import { cn } from '@/lib/utils'

const TONE_RING = {
  success: { bg: 'var(--green)', soft: 'var(--green-soft)', text: 'var(--green)' },
  info: { bg: 'var(--blue)', soft: 'var(--blue-soft)', text: 'var(--blue)' },
  warn: { bg: 'var(--yellow)', soft: 'var(--yellow-soft)', text: 'var(--yellow)' },
  critical: { bg: 'var(--red)', soft: 'var(--red-soft)', text: 'var(--red)' },
}

export default function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  icon: Icon,
  tone = 'info',
  className,
}) {
  const ring = TONE_RING[tone] || TONE_RING.info
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--stroke)] px-6 py-14 text-center', className)}>
      {Icon && (
        <span
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: ring.soft, color: ring.text }}
        >
          <Icon size={22} strokeWidth={1.5} />
        </span>
      )}
      <h3 className="text-sm font-semibold text-[var(--text-0)]">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-[var(--text-2)]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}