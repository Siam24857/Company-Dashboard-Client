'use client'
import CountUp from './CountUp'
import Reveal from './Reveal'

const STATS = [
  { value: 120, suffix: '+', label: 'Projects delivered' },
  { value: 38, suffix: '', label: 'Team specialists' },
  { value: 12, suffix: '', label: 'Client markets' },
  { value: 24, suffix: '/7', label: 'Platform reliability' },
]

export default function Company() {
  return (
    <section id="company" className="relative border-y border-[var(--stroke)] py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <Reveal>
          <p className="mono text-xs font-medium uppercase tracking-[0.28em] text-[var(--cyan)]">Company</p>
          <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-[var(--text-0)] md:text-5xl">
            Built like a technology company.
            <br />
            <span className="text-[var(--text-2)]">Run like one too.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--text-1)]">
            IDEON is a full-stack technology organization with dedicated business, sales and operations teams operating
            as one synchronized unit. Our platform is the single source of truth — from project planning to task
            submission, messaging, announcements and financial oversight.
          </p>
          <div className="mt-8 space-y-4">
            {[
              ['Mission', 'Deliver precision software and AI systems that scale with the organizations that depend on them.'],
              ['Method', 'Small senior teams, clear ownership, measurable outcomes. Every project tracks through a live command center.'],
              ['Capability', 'Web, software, AI, cloud, API, enterprise engineering, UI/UX and DevOps under one roof.'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cyan)]" style={{ boxShadow: '0 0 8px var(--cyan)' }} />
                <p className="text-sm leading-relaxed text-[var(--text-1)]">
                  <span className="font-semibold text-[var(--text-0)]">{k} — </span>
                  {v}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 self-center">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div className="group rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-6 transition-all duration-300 hover:border-[var(--cyan)]/40 hover:shadow-[0_0_30px_-10px_var(--glow)] md:p-8">
                <p className="font-display text-4xl font-bold tracking-tight text-[var(--cyan)] md:text-5xl">
                  <CountUp target={s.value} />
                  <span className="text-[var(--text-0)]">{s.suffix}</span>
                </p>
                <p className="mt-3 text-sm text-[var(--text-2)]">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}