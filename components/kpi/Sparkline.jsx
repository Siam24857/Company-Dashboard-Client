'use client'

import { cn } from '@/lib/utils'

/** Inline tiny real-time trend sparkline. Pure SVG, no chart framework needed. */
export default function Sparkline({
  data,
  width = 120,
  height = 36,
  tone = 'cyan',
  strokeWidth = 1.8,
  fillOpacity = 0.16,
  live = false,
  className,
}) {
  if (!data || data.length < 2) return null
  const values = data.length > width / 2 ? data.slice(-Math.round(width / 2)) : data
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 3
  const stepX = (width - pad * 2) / (values.length - 1)
  const pts = values.map((v, i) => [
    pad + i * stepX,
    height - pad - ((v - min) / range) * (height - pad * 2),
  ])
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0].toFixed(2)},${height} L${pts[0][0].toFixed(2)},${height} Z`

  const up = values[values.length - 1] >= values[0]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn('block overflow-visible', className)}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id={`sp-${tone}-${width}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tone)" stopOpacity={fillOpacity * 2} />
          <stop offset="100%" stopColor="var(--tone)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp-${tone}-${width})`} stroke="none" />
      <path
        d={line}
        fill="none"
        stroke="var(--tone)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={live ? undefined : undefined}
      />
      {live && (
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r={2.4}
          fill="var(--tone)"
          className="tone-dot-glow"
        >
          <animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite" />
        </circle>
      )}
      <text x={2} y={height - 2} fontSize="8" fill="var(--text-2)" fontFamily="var(--font-mono)">
        {up ? '↗' : '↘'}
      </text>
    </svg>
  )
}

Sparkline.defaultProps = { tone: 'cyan' }