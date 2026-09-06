'use client'
import { ArrowUpRight, Cloud, Cpu, Layers, Server, Sparkles, Workflow } from 'lucide-react'
import Reveal from './Reveal'

const SERVICES = [
  { icon: Layers, n: '01', title: 'Web Development', desc: 'High-performance marketing sites, portals and client dashboards engineered for speed and scale.', tech: ['React', 'Next.js', 'Tailwind'] },
  { icon: Cpu, n: '02', title: 'Software Development', desc: 'Custom internal platforms and SaaS products with typed backends and clean data models.', tech: ['Node.js', 'PostgreSQL', 'Prisma'] },
  { icon: Sparkles, n: '03', title: 'AI Solutions', desc: 'Assistants, search and document intelligence that turn raw data into working products.', tech: ['LLMs', 'RAG', 'Embeddings'] },
  { icon: Cloud, n: '04', title: 'Cloud Solutions', desc: 'Serverless and container deployment with infrastructure as code and zero-drama releases.', tech: ['Vercel', 'Docker', 'CI/CD'] },
  { icon: Server, n: '05', title: 'API Development', desc: 'Typed, documented REST APIs with validation, rate limits and audit trails.', tech: ['Express', 'Zod', 'OpenAPI'] },
  { icon: Workflow, n: '06', title: 'UI/UX Engineering', desc: 'Design systems, motion and accessibility engineering that ship as code, not mockups.', tech: ['Figma', 'Framer Motion', 'WCAG'] },
]

export default function Services() {
  return (
    <section id="services" className="relative border-y border-[var(--stroke)] bg-[var(--bg-1)]/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mono text-xs font-medium uppercase tracking-[0.28em] text-[var(--cyan)]">Services</p>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-[var(--text-0)] md:text-5xl">
              Everything it takes to ship.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--text-1)]">
            Full-stack teams. Fixed scope. Clear handoffs. Every engagement runs through the same command center your team already uses.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.n} delay={i * 70}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-[var(--stroke)] bg-gradient-to-b from-[var(--card-hi)] to-[var(--card-lo)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--cyan)]/40">
                <span className="mono pointer-events-none absolute right-5 top-5 text-xs font-semibold text-[var(--text-2)]">{s.n}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-105" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
                  <s.icon size={19} strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-[var(--text-0)]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-1)]">{s.desc}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {s.tech.map((t) => (
                    <span key={t} className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-2)]">{t}</span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[var(--stroke)] pt-4">
                  <span className="text-xs font-semibold text-[var(--cyan)] transition-all duration-300 group-hover:gap-2 inline-flex items-center gap-1.5">
                    Start a project
                    <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}