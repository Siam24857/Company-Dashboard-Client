'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, Activity, Radar, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOT_ROWS = 12
const DOT_COLS = 40

function TechGrid() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % 14), 900)
    return () => clearInterval(t)
  }, [])
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(var(--stroke) 1px, transparent 1px), linear-gradient(90deg, var(--stroke) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black, transparent)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan)]/50 to-transparent" />
      <div
        className="absolute right-[8%] top-[18%] grid gap-1 opacity-40"
        style={{ gridTemplateColumns: `repeat(${DOT_COLS}, 3px)`, gridTemplateRows: `repeat(${DOT_ROWS}, 3px)` }}
      >
        {Array.from({ length: DOT_ROWS * DOT_COLS }).map((_, i) => {
          const isActive = i % 14 === active
          return (
            <span
              key={i}
              className="h-[3px] w-[3px] rounded-full transition-colors duration-500"
              style={{ background: isActive ? 'var(--cyan)' : 'var(--text-2)' }}
            />
          )
        })}
      </div>
      <div className="absolute right-[14%] top-[62%] h-40 w-px animate-pulse-soft bg-gradient-to-b from-transparent via-[var(--cyan)]/50 to-transparent" />
      <div className="absolute left-[10%] top-[58%] h-px w-56 animate-pulse-soft bg-gradient-to-r from-transparent via-[var(--cyan)]/30 to-transparent" />
    </div>
  )
}

function StatusChip({ label, ok = true, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      className={cn(
        'glass-soft flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-[var(--text-1)] transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', ok ? 'bg-[var(--green)]' : 'bg-[var(--yellow)]')} style={{ boxShadow: `0 0 8px ${ok ? 'var(--green)' : 'var(--yellow)'}` }} />
      {label}
    </div>
  )
}

export default function Hero() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const items = [
    { icon: Radar, label: 'Systems nominal', tone: 'var(--green)' },
    { icon: Cpu, label: '3 platforms · 12 services', tone: 'var(--cyan)' },
    { icon: Activity, label: 'Live analytics', tone: 'var(--violet)' },
  ]

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-16">
      <TechGrid />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 pb-20 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div>
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-[var(--glass-soft)] px-3.5 py-1.5 text-xs font-medium text-[var(--cyan)] transition-all duration-700"
            style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(10px)' }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cyan)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
            </span>
            Enterprise Technology & Design Systems
          </div>

          <h1
            className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-[var(--text-0)] transition-all duration-1000 md:text-6xl lg:text-7xl"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? 'none' : 'translateY(28px)',
              transitionDelay: '120ms',
            }}
          >
            Precision
            <br />
            engineered
            <br />
            for <span className="text-gradient">serious teams</span>.
          </h1>

          <p
            className="mt-6 max-w-lg text-base leading-relaxed text-[var(--text-1)] transition-all duration-1000 md:text-lg"
            style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(24px)', transitionDelay: '260ms' }}
          >
            IDEON builds mission-driven software, AI systems and cloud infrastructure for organizations that move fast.
            One operating platform — from command center to deployment.
          </p>

          <div
            className="mt-9 flex flex-wrap items-center gap-4 transition-all duration-1000"
            style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(20px)', transitionDelay: '380ms' }}
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[var(--cyan)] to-[#2b8cff] px-6 py-3 text-sm font-semibold text-[#04070b] transition-all duration-300 hover:shadow-[0_0_36px_-6px_var(--glow)]"
            >
              Enter command center
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#technology"
              className="group inline-flex items-center gap-2 rounded-lg border border-[var(--stroke)] px-6 py-3 text-sm font-semibold text-[var(--text-0)] transition-all duration-300 hover:border-[var(--cyan)]/50 hover:bg-[var(--glass)]"
            >
              <Play size={14} className="text-[var(--cyan)]" fill="currentColor" />
              Explore technology
            </a>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div
            className="glass absolute right-0 top-6 w-80 rounded-2xl p-6 transition-all duration-1000"
            style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(26px) scale(0.98)', transitionDelay: '420ms' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-2)]">System status</p>
              <span className="chip tone-success">All green</span>
            </div>
            <div className="mt-5 space-y-3.5">
              {items.map((it, i) => (
                <div key={it.label} className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: 'color-mix(in srgb, ' + it.tone + ' 14%, transparent)', color: it.tone }}
                  >
                    <it.icon size={15} strokeWidth={1.75} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[var(--text-0)]">{it.label}</p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--glass)]">
                      <div className="h-full rounded-full" style={{ width: `${78 - i * 18}%`, background: it.tone, boxShadow: `0 0 8px ${it.tone}` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute bottom-24 right-6 flex flex-col items-start gap-2.5 transition-all duration-1000"
            style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(18px)', transitionDelay: '560ms' }}
          >
            <StatusChip label="Database · connected" ok delay={600} />
            <StatusChip label="Auth · online" ok delay={760} />
            <StatusChip label="Realtime · syncing" delay={920} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <a href="#company" className="flex flex-col items-center gap-2 text-[var(--text-2)] transition-colors hover:text-[var(--cyan)]" aria-label="Scroll to company overview">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em]">Scroll</span>
          <span className="h-8 w-px animate-pulse-soft bg-gradient-to-b from-[var(--cyan)] to-transparent" />
        </a>
      </div>
    </section>
  )
}