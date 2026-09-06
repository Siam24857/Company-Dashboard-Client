'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/utils'

const PLACEMENT = {
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
}

/** Accessible tooltip — hover + keyboard focus reveal, aria-describedby. */
export default function Tip({ label, placement = 'right', children, className, wide }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'glass-strong pointer-events-none absolute z-[90] whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-sec transition-all duration-150',
          'shadow-sm',
          open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0',
          PLACEMENT[placement],
          wide && 'whitespace-normal w-56 leading-snug'
        )}
      >
        {label}
      </span>
    </span>
  )
}