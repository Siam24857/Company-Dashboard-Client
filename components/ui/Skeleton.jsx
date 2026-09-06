import { cn } from '@/lib/utils'

/** Shimmer skeleton with morphing box-shadow while loading. */
export default function Skeleton({ className, circle = false, style }) {
  return (
    <span
      aria-hidden="true"
      className={cn('skeleton', circle && 'rounded-full', className)}
      style={style}
    />
  )
}

export function SkeletonBlock({ className }) {
  return <Skeleton className={cn('block h-full w-full', className)} />
}