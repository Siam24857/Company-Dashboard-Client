import { cn } from '@/lib/utils'

/** Glassmorphism surface: transparency + blur for overlays, modals, sidebars. */
export default function Glass({ variant = 'glass', className, children, toned, ...rest }) {
  const map = {
    glass: 'glass',
    strong: 'glass-strong',
    soft: 'glass-soft',
  }
  return (
    <div className={cn(map[variant], 'rounded-2xl', className)} data-tone={toned || undefined} {...rest}>
      {children}
    </div>
  )
}