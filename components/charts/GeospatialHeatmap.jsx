'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Radio } from 'lucide-react'
import { geoPoints } from '@/lib/mock'
import { mulberry32 } from '@/lib/utils'
import useDashboardStore from '@/store/dashboard.store'

/* Equirectangular projection helpers */
const W = 820
const H = 400
const project = (lon, lat) => [((lon + 180) / 360) * W, ((90 - (lat + 90)) / 180) * H * 1.06 + H * 0.02]
const [lonMin, latMax] = [-180, 85]

/* Rough continent blobs [lon, lat, density] for the dotted landmass */
const LANDMASS_CELLS = 1160
const CONTINENTS = [
  { lon: -100, lat: 42, rx: 34, ry: 24, n: 240 },
  { lon: -95, lat: 15, rx: 12, ry: 14, n: 50 },
  { lon: 15, lat: 48, rx: 22, ry: 14, n: 130 },
  { lon: 20, lat: 6, rx: 24, ry: 22, n: 90 },
  { lon: 60, lat: 55, rx: 40, ry: 20, n: 90 },
  { lon: 45, lat: 28, rx: 10, ry: 10, n: 30 },
  { lon: -40, lat: -15, rx: 11, ry: 24, n: 60 },
  { lon: 134, lat: -25, rx: 38, ry: 22, n: 90 },
  { lon: -42, lat: 70, rx: 12, ry: 8, n: 28 },
  { lon: 114, lat: 20, rx: 12, ry: 6, n: 24 },
  { lon: 175, lat: 62, rx: 7, ry: 7, n: 16 },
]

export default function GeospatialHeatmap({ points = geoPoints }) {
  const store = useDashboardStore((s) => ({ logAction: s.logAction, setWorkspace: s.setWorkspace, setVisual: s.setVisual }))
  const [hover, setHover] = useState(null)

  const dots = useMemo(() => {
    const out = []
    let n = 0
    CONTINENTS.forEach((c) => {
      const rnd = mulberry32(9000 + n++)
      for (let i = 0; i < (c.n || 120); i++) {
        const t = rnd() * Math.PI * 2
        const rr = Math.sqrt(rnd()) * (c.rx > c.ry ? c.rx : c.ry)
        const ang = c.ry / (c.rx || 1)
        const dLon = (Math.cos(t) * rr * ang) / 1
        const dLat = Math.sin(t) * rr * 0.8
        const lon = c.lon + dLon
        const lat = c.lat + dLat * 1.2
        if (lon < -180 || lon > 180 || lat < -70 || lat > 84) continue
        const [x, y] = project(lon, lat)
        out.push({ x, y })
      }
    })
    return out
  }, [])

  const maxV = Math.max(...points.map((p) => p.v))

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl" aria-label="Geospatial activity map">
      {/* faint meridians */}
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" role="img" aria-label="World activity heatmap">
        <defs>
          <radialGradient id="geo-glow">
            <stop offset="0%" stopColor="var(--tone)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--tone)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((v) => (
          <line key={v} x1={v * W} x2={v * W} y1={0} y2={H} stroke="var(--stroke)" strokeWidth="0.5" opacity="0.4" />
        ))}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1.15" fill="var(--text-2)" opacity="0.34" />
        ))}
        {points.map((p) => {
          const [x, y] = project(p.lng, p.lat)
          const r = 5 + (p.v / maxV) * 11
          return (
            <g key={p.id} className="tone-info">
              <circle cx={x} cy={y} r={r * 3} fill="url(#geo-glow)" />
              <circle cx={x} cy={y} r={r} fill="var(--tone)" opacity="0.9">
                <animate attributeName="r" values={`${r};${r * 1.15};${r}`} dur="2.6s" repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r={r} fill="transparent" stroke="var(--tone)" strokeWidth="1">
                <animate attributeName="r" values={`${r};${r * 2.2}`} dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="2.6s" repeatCount="indefinite" />
              </circle>
            </g>
          )
        })}
      </svg>

      {/* marker labels */}
      {points.map((p) => {
        const [x, y] = project(p.lng, p.lat)
        const top = (y / H) * 100
        const left = (x / W) * 100
        return (
          <motion.button
            key={p.id}
            initial={false}
            animate={{ top: `${top}%`, left: `${left}%` }}
            onMouseEnter={() => setHover(p)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(p)}
            onBlur={() => setHover(null)}
            onClick={() => {
              store.logAction(`Opened geo drill-down for ${p.name}`)
              store.setVisual({
                kind: 'visual',
                visual: 'chart',
                suggested: true,
                type: 'pie',
                title: `${p.name} · activity mix`,
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{ name: 'Revenue', key: 'revenue', data: [p.v * 6, p.v * 9, p.v * 12, p.v * 16], color: 'var(--green)' }],
              })
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 p-1"
            style={{ width: 0, height: 0 }}
            aria-label={`${p.name}: ${p.v} activity units`}
          >
            <MapPin size={15} className="text-info" style={{ color: 'var(--cyan)' }} />
          </motion.button>
        )
      })}

      {/* hover readout */}
      {hover && (
        <div className="glass-strong pointer-events-none absolute left-3 top-3 z-10 rounded-lg px-3 py-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-pri">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--cyan)' }} />
            {hover.name}
          </div>
          <div className="tabular mt-0.5 text-sec">{hover.v} activity units · {Math.round((hover.v / maxV) * 100)}% of max</div>
        </div>
      )}

      <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-tri">
        <Radio size={11} className="tone-success tone-text" /> live geo pings
      </div>
    </div>
  )
}