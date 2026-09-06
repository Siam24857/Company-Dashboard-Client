import { cn } from '@/lib/utils'

/** Semantic chip. Tone conveys severity/status; no decorative use. */
export default function ToneChip({ tone = 'info', children, className, dot = false, glow = false }) {
  return (
    <span className={cn('chip', `tone-${tone}`, dot && 'tone-text', glow && 'tone-glow', 'bg-[color-mix(in_srgb,var(--tone)_14%,transparent)]', className)}>
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: 'var(--tone)' }}
        />
      )}
      {children}
    </span>
  )
}