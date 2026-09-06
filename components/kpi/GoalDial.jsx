'use client'

import { cn, clamp } from '@/lib/utils'

/** Radial Goal-vs-Actual dial. Arc sweeps to % achieved; tone reflects headroom. */
export default function GoalDial({
  value,
  goal,
  size = 58,
  stroke = 6,
  label,
  inverse = false,
  className,
}) {
  const ratio = inverse ? 1 - clamp(value / goal, 0, 1) : clamp(value / goal, 0, 1)
  const pctDone = Math.round(ratio * 100)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const tone =
    pctDone >= 100 ? 'success' : pctDone >= 66 ? 'cyan' : pctDone >= 40 ? 'warn' : 'critical'

  return (
    <div
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
      aria-label={`${pctDone}% of ${inverse ? 'worst-case' : 'goal'} ${label || ''}`}
      role="img"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, var(--text-2) 18%, transparent)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`var(--${tone === 'cyan' ? 'cyan' : tone})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
        >
          <animate attributeName="stroke-dashoffset" values={`${c};${c * (1 - ratio)}`} dur="1s" keyTimes="0;1" fill="freeze" />
        </circle>
      </svg>
      <span
        className={`absolute font-display font-semibold tabular text-tri`}
        style={{ fontSize: size * 0.23 }}
      >
        {pctDone}
        <span className="text-[0.62em]">%</span>
      </span>
    </div>
  )
}