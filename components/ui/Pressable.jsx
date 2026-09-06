'use client'

import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Haptic-pressure primitive. Scales down on press, springs back on release,
 * with reduced-motion + keyboard-safe behavior.
 */
const Pressable = forwardRef(function Pressable(
  { as = 'button', children, className, whileTap, whileHover, onClick, disabled, ...rest },
  ref
) {
  const Comp = motion[as === 'button' ? 'button' : 'div']
  return (
    <Comp
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      whileHover={disabled ? undefined : whileHover || { y: -1 }}
      whileTap={disabled ? undefined : whileTap || { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 460, damping: 22 }}
      className={cn('select-none', disabled && 'opacity-45 pointer-events-none', className)}
      {...rest}
    >
      {children}
    </Comp>
  )
})

export default Pressable