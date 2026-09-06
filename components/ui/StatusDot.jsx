import { cn } from '@/lib/utils'

/** Semantic status dot with live ping — color strictly encodes state. */
export default function StatusDot({ tone = 'success', ping = false, size = 8, className, label }) {
  const toneClass = `tone-${tone}`
  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label || `status: ${tone}`}
    >
      <span
        className={cn(toneClass, 'block rounded-full tone-text', ping && 'live-dot tone-dot-glow')}
        style={{ width: size, height: size, background: 'var(--tone)' }}
      />
    </span>
  )
}

export const toneLabels = {
  critical: 'Critical',
  info: 'Informational',
  success: 'Active',
  warn: 'Pending',
  ai: 'AI',
  cyan: 'Info',
  orange: 'Heads-up',
}