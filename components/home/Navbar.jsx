'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { label: 'Technology', href: '#technology' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Company', href: '#company' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled ? 'border-b border-[var(--stroke)] bg-[var(--bg-0)]/85 backdrop-blur-xl' : 'bg-transparent'
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8" aria-label="Primary">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--card-hi)]">
              <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[var(--cyan)] transition-transform duration-300 group-hover:rotate-90" />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-[var(--text-0)]">
              IDEON<span className="text-[var(--cyan)]">.</span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-[13px] font-medium text-[var(--text-1)] transition-colors duration-200 hover:text-[var(--text-0)]"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--cyan)] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-5 lg:flex">
            <Link href="/login" className="text-[13px] font-medium text-[var(--text-1)] transition-colors hover:text-[var(--text-0)]">
              Sign in
            </Link>
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg border border-[var(--cyan)]/40 px-4 py-2 text-[13px] font-semibold text-[var(--cyan)] transition-all duration-300 hover:border-[var(--cyan)] hover:shadow-[0_0_24px_-6px_var(--glow)]"
            >
              Launch Console
              <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--stroke)] text-[var(--text-0)] lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-40 flex flex-col bg-[var(--bg-0)] transition-all duration-400 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        style={{ paddingTop: '6rem' }}
      >
        <nav className="flex flex-1 flex-col gap-2 px-6" aria-label="Mobile">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-[var(--stroke)] py-5 font-display text-2xl font-medium text-[var(--text-0)] transition-all duration-300"
              style={{
                transitionDelay: open ? `${i * 60}ms` : '0ms',
                transform: open ? 'none' : 'translateY(12px)',
                opacity: open ? 1 : 0,
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex gap-3 px-6 pb-10">
          <Link href="/login" onClick={() => setOpen(false)} className="btn flex-1 py-3 text-center">
            Sign in
          </Link>
          <Link href="/login" onClick={() => setOpen(false)} className="btn-primary flex-1 py-3 text-center">
            Launch Console
          </Link>
        </div>
      </div>
    </>
  )
}