'use client'
import Reveal from './Reveal'
import CountUp from './CountUp'

const PROJECTS = [
  {
    industry: 'Enterprise Platform',
    name: 'IDEON Command Center',
    desc: 'A full company operating system — dashboards, messaging, announcements, tasks, attendance and financial control in one role-based platform.',
    stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Realtime'],
    result: '12 departments synchronized on one source of truth',
    status: 'LIVE',
    spans: 'col-span-2 lg:row-span-2',
  },
  {
    industry: 'AI Systems',
    name: 'Intelligence Layer',
    desc: 'Applied LLM tooling with retrieval pipelines and evaluation grading.',
    stack: ['LLM orchestration', 'RAG', 'Embeddings'],
    result: '81% faster internal search',
    status: 'ACTIVE',
  },
  {
    industry: 'Cloud Infrastructure',
    name: 'Zero-Downtime Platform',
    desc: 'Serverless architecture with CI/CD and observability from day one.',
    stack: ['Vercel', 'Docker', 'CI/CD'],
    result: '99.98% uptime',
    status: 'PRODUCTION',
  },
  {
    industry: 'Fintech Tooling',
    name: 'Wallet & Payments',
    desc: 'Financial dashboard with balance, income, expense and transaction analytics.',
    stack: ['REST', 'Prisma', 'Recharts'],
    result: 'Real-time financial control',
    status: 'BETA',
  },
]

const getTone = (status) => {
  const map = {
    LIVE: 'var(--green)',
    ACTIVE: 'var(--cyan)',
    PRODUCTION: 'var(--blue)',
    BETA: 'var(--yellow)',
  }
  return map[status] || 'var(--cyan)'
}

export default function Projects() {
  return (
    <section id="projects" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="mono text-xs font-medium uppercase tracking-[0.28em] text-[var(--cyan)]">Projects</p>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-[var(--text-0)] md:text-5xl">
            Selected work.
            <br />
            Real outcomes.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 80} className={p.spans || 'lg:col-span-2'}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--cyan)]/40 hover:shadow-[0_0_38px_-12px_var(--glow)] md:p-8">
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan)]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <span className="mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-2)]">{p.industry}</span>
                  <span className="chip" style={{ background: `color-mix(in srgb, ${getTone(p.status)} 14%, transparent)`, color: getTone(p.status) }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: getTone(p.status), boxShadow: `0 0 6px ${getTone(p.status)}` }} />
                    {p.status}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-[var(--text-0)]">{p.name}</h3>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[var(--text-1)]">{p.desc}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.stack.map((t) => (
                    <span key={t} className="rounded-md border border-[var(--stroke)] bg-[var(--glass-soft)] px-2 py-1 text-[10px] font-medium text-[var(--text-2)]">{t}</span>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--stroke)] pt-4">
                  <span className="text-xs font-medium text-[var(--text-1)]">
                    <span className="text-[var(--cyan)]">▲ </span>
                    {p.result}
                  </span>
                  <span className="text-lg text-[var(--text-2)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--cyan)]">→</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <div className="flex flex-col gap-6 rounded-2xl border border-[var(--stroke)] bg-gradient-to-br from-[var(--cyan)]/8 via-transparent to-[var(--violet)]/8 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <h3 className="font-display text-xl font-bold text-[var(--text-0)] md:text-2xl">See your team working live.</h3>
              <p className="mt-2 text-sm text-[var(--text-1)]">Authenticate to open the IDEON command center — real data, real projects, real-time.</p>
            </div>
            <a href="/login" className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 px-6 py-3 text-sm font-semibold">
              Launch console
              <span>→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}