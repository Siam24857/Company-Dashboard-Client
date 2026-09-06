'use client'
import { useState } from 'react'
import { Brain, Cloud, Code2, Database, GitBranch, Workflow, X } from 'lucide-react'
import Reveal from './Reveal'

const TECH = [
  {
    icon: Code2,
    name: 'Web & Software Engineering',
    desc: 'Production web platforms and internal systems built on a modern React/Next.js stack with a typed, tested backend.',
    category: 'Core',
    status: 'PRODUCTION',
    meta: ['React 18', 'Next.js 14', 'Node.js', 'PostgreSQL'],
    gradient: 'var(--cyan)',
  },
  {
    icon: Brain,
    name: 'AI Solutions',
    desc: 'Applied machine intelligence: assistants, retrieval pipelines, document understanding and decision tooling.',
    category: 'Intelligence',
    status: 'ACTIVE',
    meta: ['LLM orchestration', 'RAG pipelines', 'Embeddings', 'Grading'],
    gradient: 'var(--violet)',
  },
  {
    icon: Cloud,
    name: 'Cloud & DevOps',
    desc: 'Serverless and containerized delivery with infrastructure as code, CI/CD and production monitoring baked in.',
    category: 'Platform',
    status: 'PRODUCTION',
    meta: ['Vercel', 'Docker', 'CI/CD', 'Observability'],
    gradient: 'var(--blue)',
  },
  {
    icon: Database,
    name: 'Data & APIs',
    desc: 'Typed REST APIs, relational data models and analytics surfaces — designed first, shipped continuously.',
    category: 'Backbone',
    status: 'PRODUCTION',
    meta: ['Prisma', 'REST', 'Zod', 'Realtime'],
    gradient: 'var(--green)',
  },
  {
    icon: Workflow,
    name: 'Enterprise Systems',
    desc: 'Role-based operating systems with messaging, announcements, task flows and financial control for whole teams.',
    category: 'Platform',
    status: 'ACTIVE',
    meta: ['RBAC', 'Workflows', 'Notifications', 'Audit'],
    gradient: 'var(--orange)',
  },
  {
    icon: GitBranch,
    name: 'Design Engineering',
    desc: 'Tightly integrated UI/UX engineering — accessible, responsive interfaces with engineered design systems.',
    category: 'Experience',
    status: 'PRODUCTION',
    meta: ['Design systems', 'Motion', 'A11y', 'WCAG 2.2'],
    gradient: 'var(--yellow)',
  },
]

export default function Technology() {
  const [active, setActive] = useState(0)

  return (
    <section id="technology" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="mono text-xs font-medium uppercase tracking-[0.28em] text-[var(--cyan)]">Technology</p>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-[var(--text-0)] md:text-5xl">
            Six disciplines.
            <br />
            One operating platform.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {TECH.map((t, i) => (
            <Reveal key={t.name} delay={i * 70}>
              <div
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: active === i ? t.gradient : undefined, boxShadow: active === i ? `0 0 34px -10px ${t.gradient}` : undefined }}
                onClick={() => setActive(active === i ? null : i)}
                onKeyDown={(e) => e.key === 'Enter' && setActive(active === i ? null : i)}
                role="button"
                tabIndex={0}
                aria-expanded={active === i}
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5" style={{ background: `color-mix(in srgb, ${t.gradient} 14%, transparent)`, color: t.gradient }}>
                    <t.icon size={19} strokeWidth={1.75} />
                  </span>
                  <span className="mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-2)]">{t.category}</span>
                </div>

                <h3 className="mt-5 font-display text-lg font-semibold text-[var(--text-0)]">{t.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-1)]">{t.desc}</p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {t.meta.map((m) => (
                    <span key={m} className="rounded-md border border-[var(--stroke)] bg-[var(--glass-soft)] px-2 py-1 text-[10px] font-medium text-[var(--text-2)]">{m}</span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--stroke)] pt-4">
                  <span className="chip" style={{ background: `color-mix(in srgb, ${t.gradient} 14%, transparent)`, color: t.gradient }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.gradient, boxShadow: `0 0 6px ${t.gradient}` }} />
                    {t.status}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-2)] transition-colors group-hover:text-[var(--text-0)]">
                    {active === i ? 'Collapse' : 'Expand  →'}
                  </span>
                </div>

                {active === i && (
                  <div className="mt-4 rounded-xl p-4 text-sm leading-relaxed text-[var(--text-1)]" style={{ background: `color-mix(in srgb, ${t.gradient} 7%, transparent)`, border: `1px solid color-mix(in srgb, ${t.gradient} 25%, transparent)` }}>
                    Select this module to load its live pipeline. Real project data is streamed from the IDEON command center for analytics, task progress and engineering velocity tracking.
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}