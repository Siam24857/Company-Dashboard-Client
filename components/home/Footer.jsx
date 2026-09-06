import Link from 'next/link'

const COLS = [
  { title: 'Platform', links: ['Command Center', 'Announcements', 'Messaging', 'Wallet', 'Reports'] },
  { title: 'Company', links: ['About', 'Technology', 'Services', 'Careers', 'Contact'] },
  { title: 'Resources', links: ['Documentation', 'API Reference', 'Security', 'Status'] },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--stroke)] bg-[var(--bg-1)]/30 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--card-hi)]">
                <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[var(--cyan)]" />
              </span>
              <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-[var(--text-0)]">
                IDEON<span className="text-[var(--cyan)]">.</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-1)]">
              Precision-engineered software, AI and cloud systems for serious teams.
            </p>
            <div className="mono mt-6 flex items-center gap-2 text-xs text-[var(--text-2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" style={{ boxShadow: '0 0 8px var(--green)' }} />
              All systems operational
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-2)]">{c.title}</h4>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <Link href="/login" className="text-sm text-[var(--text-1)] transition-colors hover:text-[var(--text-0)]">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-[var(--stroke)] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-[var(--text-2)]">© {new Date().getFullYear()} IDEON Systems. All rights reserved.</p>
          <div className="mono flex gap-6 text-xs text-[var(--text-2)]">
            <span>v2.0.0</span>
            <span>Status: production</span>
            <span>all systems nominal</span>
          </div>
        </div>
      </div>
    </footer>
  )
}