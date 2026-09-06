import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs) => twMerge(clsx(inputs))

export const fmtCurrency = (n, compact = true) => {
  if (compact && Math.abs(n) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export const fmtNum = (n, digits = 1) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: digits }).format(n)

export const pct = (n, digits = 1) => `${n > 0 ? '+' : ''}${n.toFixed(digits)}%`

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

export const timeAgo = (iso) => {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${Math.round(s)}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

export const slug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '')

export const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

export const hashString = (str) => {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

/* ---------------- seeded RNG (stable SSR/client) ---------------- */
export const mulberry32 = (seed) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export const genSeries = (seed, len, base, volatility, trend = 0) => {
  const rnd = mulberry32(seed)
  const out = []
  let v = base
  for (let i = 0; i < len; i++) {
    v = v * (1 + (rnd() - 0.5) * volatility) + trend
    out.push(v)
  }
  return out
}

/* ---------------- AI "smart chart" heuristics ---------------- */
export const detectChartType = (query, shape, keys) => {
  const q = query.toLowerCase()
  if (/(over time|trend|last .* month|series|grow|decline)/.test(q)) return 'line'
  if (/(share|mix|portion|segment|breakdown|pie)/.test(q) && keys.length > 3) return 'pie'
  if (/(density|map|region|geo|heat)/.test(q)) return 'heatmap'
  if (/(compare|vs|versus)/.test(q)) return 'bar'
  if (shape && shape.length > 24) return 'area'
  return 'bar'
}

export const downloadCSV = (filename, rows) => {
  const csv = rows
    .map((r) =>
      r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const exportPDF = () => {
  if (typeof window === 'undefined') return
  window.print()
}

export const reduceMotionPref = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Stale-while-revalidate cache.
 * Reads immediately from a module-level cache; revalidates in the background.
 */
const swrCache = new Map()

export const swr = ({ key, fetcher, ttl = 30_000, onStale }) => {
  const hit = swrCache.get(key)
  const fresh = hit && Date.now() - hit.at < ttl
  if (hit && !fresh && onStale) onStale(hit.data)
  if (!fresh) {
    fetcher().then((data) => {
      swrCache.set(key, { data, at: Date.now() })
      if (onStale) onStale(data)
    })
  }
  return hit ? hit.data : null
}

/* ---------------- relative time window -> trailing chart points ---------------- */
const WINDOW_TABLE = [
  [2, 3], [12, 4], [24, 5], [72, 6], [168, 7], [336, 9], [720, 10], [2160, 11], [8760, 12],
]
export const windowPoints = (hours) => {
  const row = WINDOW_TABLE.find(([h]) => hours <= h)
  return row ? row[1] : 12
}

export const windowLabel = (hours) => {
  if (hours <= 2) return 'last 2h'
  if (hours <= 12) return 'last 12h'
  if (hours <= 48) return 'last 2d'
  if (hours <= 168) return 'last week'
  if (hours <= 336) return 'last 2 weeks'
  if (hours <= 720) return 'last month'
  if (hours <= 2160) return 'last quarter'
  return 'last year'
}

export const lerp = (a, b, t) => Math.round(a + (b - a) * t)

export const hexToRgb = (hex) => {
  const m = hex.replace('#', '')
  return { r: parseInt(m.slice(0, 2), 16), g: parseInt(m.slice(2, 4), 16), b: parseInt(m.slice(4, 6), 16) }
}

export const mixHex = (a, b, t) => {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return `#${[lerp(ca.r, cb.r, t), lerp(ca.g, cb.g, t), lerp(ca.b, cb.b, t)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`
}

export const piiMask = (str) => {
  if (!str) return str
  const s = String(str)
  if (s.includes('@')) {
    const [u, d] = s.split('@')
    return `${u[0]}•••@${d.split('.')[0].slice(0, 2)}•••.${d.split('.').pop()}`
  }
  if (s.length < 6) return '•••'
  return `${s.slice(0, 2)}••••${s.slice(-1)}`
}