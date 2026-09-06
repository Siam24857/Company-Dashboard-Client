'use client'
import Skeleton from './Skeleton'
import { cn } from '@/lib/utils'

export function StatCardSkeleton({ className }) {
  return (
    <div className={cn('rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton circle className="h-9 w-9" />
      </div>
      <Skeleton className="mt-5 h-8 w-28" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4, className }) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden>
      <div className="flex gap-4 border-b border-[var(--stroke)] pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}