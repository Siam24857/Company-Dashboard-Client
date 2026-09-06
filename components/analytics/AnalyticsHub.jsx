'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart as LineIcon, Map } from 'lucide-react'
import { cn } from '@/lib/utils'
import MainChart from '@/components/charts/MainChart'
import GeospatialHeatmap from '@/components/charts/GeospatialHeatmap'
import LazyMount from '@/hooks/useInView'
import Skeleton from '@/components/ui/Skeleton'

const TABS = [
  { id: 'chart', label: 'Snapshot', icon: LineIcon },
  { id: 'geo', label: 'Geography', icon: Map },
]

/** Module 3 hub: analytics canvas + geospatial heatmap, viewport-lazy. */
export default function AnalyticsHub() {
  const [tab, setTab] = useState('chart')

  return (
    <LazyMount fallback={<ChartSkeleton />}>
      <section className="card-3d flex h-full flex-col overflow-hidden p-5" aria-label="Analytics hub">
        <div className="mb-3 flex items-center gap-2" role="tablist" aria-label="Analytics views">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  tab === t.id ? 'tone-soft tone-cyan tone-text' : 'text-tri hover:text-sec'
                )}
              >
                <Icon size={13} /> {t.label}
              </button>
            )
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="min-h-[360px] flex-1 lg:min-h-[380px]"
          >
            {tab === 'chart' ? <MainChart /> : <GeospatialHeatmap />}
          </motion.div>
        </AnimatePresence>
      </section>
    </LazyMount>
  )
}

export function ChartSkeleton() {
  return (
    <section className="card-3d flex min-h-[380px] flex-col gap-3 p-5" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-20" />
      </div>
      <Skeleton className="flex-1" style={{ minHeight: 240 }} />
    </section>
  )
}