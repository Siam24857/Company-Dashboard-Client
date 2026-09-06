'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export default function Reveal({ children, className, delay = 0, y = 24, as: Tag = 'div', once = true }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) io.unobserve(entry.target)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  return (
    <Tag
      ref={ref}
      className={cn('will-change-[transform,opacity] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]', className)}
      style={{ transitionDelay: `${delay}ms`, transform: visible ? 'none' : `translateY(${y}px)`, opacity: visible ? 1 : 0 }}
    >
      {children}
    </Tag>
  )
}

export function RevealGroup({ children, className, stagger = 90 }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function StaggerItem({ children, className, index = 0, y = 20 }) {
  return (
    <Reveal className={className} delay={index * 90} y={y}>
      {children}
    </Reveal>
  )
}