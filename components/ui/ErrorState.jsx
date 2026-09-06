'use client'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this data. Please try again.',
  onRetry,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-[var(--red-soft)] bg-[var(--red-faint)] px-6 py-12 text-center', className)}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>
        <AlertTriangle size={22} strokeWidth={1.5} />
      </span>
      <h3 className="text-sm font-semibold text-[var(--text-0)]">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-[var(--text-2)]">{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn mt-5" style={{ '--tone': 'var(--red)' }}>
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  )
}