'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Send, X, Sparkles } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import { resolveQuery, QUICK_SUGGESTIONS } from '@/lib/ai'
import { cn } from '@/lib/utils'

/** AI Copilot side panel — NL queries rendered as visuals or answers. */
export default function AIPanel() {
  const open = useDashboardStore((s) => s.aiOpen)
  const setOpen = useDashboardStore((s) => s.setAiOpen)
  const chat = useDashboardStore((s) => s.aiChat)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, typing, open])

  const ask = (text) => {
    const clean = text || input
    if (!clean.trim()) return
    setInput('')
    useDashboardStore.getState().pushAiMessage({ role: 'user', text: clean })
    setTyping(true)
    const r = resolveQuery(clean)
    setTimeout(() => {
      const store = useDashboardStore.getState()
      if (r.kind === 'visual') store.setVisual(r)
      store.pushAiMessage({
        role: 'ai',
        text: r.kind === 'text' ? r.answer : `Rendered visual: ${r.title || r.label}.`,
        visual: r.kind === 'visual' ? r : null,
      })
      setTyping(false)
    }, 900)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          role="complementary"
          aria-label="AI copilot"
          className="glass-strong fixed inset-y-2 right-2 z-[70] flex w-[min(94vw,380px)] flex-col overflow-hidden rounded-2xl shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-[var(--stroke)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="tone-ai tone-soft relative grid h-8 w-8 place-items-center rounded-xl">
                <Cpu size={16} />
                <span className="live-dot absolute right-0 top-0" style={{ background: 'var(--violet)', width: 7, height: 7 }} aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-pri">Copilot</p>
                <p className="text-[10px] text-tri">reads the whole organization</p>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close copilot"><X size={16} /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {chat.length === 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm leading-relaxed text-sec">
                  Ask anything — charts render instantly onto your canvas.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SUGGESTIONS.slice(0, 5).map((sq) => (
                    <button key={sq} className="btn !py-1.5 text-[11px]" onClick={() => ask(sq)}>
                      <Sparkles size={11} className="tone-ai tone-text" /> {sq}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <AnimatePresence>
              {chat.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex flex-col gap-1.5', m.role === 'user' ? 'items-end' : 'items-start')}
                >
                  {m.role === 'user' ? (
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-[color-mix(in_srgb,var(--cyan)_14%,transparent)] px-3.5 py-2 text-sm leading-relaxed text-pri">
                      {m.text}
                    </p>
                  ) : (
                    <div className="max-w-[92%] rounded-2xl rounded-bl-sm glass-soft px-3.5 py-2.5 text-sm leading-relaxed text-sec">
                      {m.visual && (
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tone-ai tone-text">
                          <Sparkles size={12} /> {m.visual.title || m.visual.label}
                        </p>
                      )}
                      {m.text}
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="flex items-start">
                  <div className="glass-soft flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: 'var(--violet)' }}
                        animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </AnimatePresence>
          </div>

          <form
            className="border-t border-[var(--stroke)] p-3"
            onSubmit={(e) => { e.preventDefault(); ask() }}
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything… ▸ “churn trend”"
                aria-label="Copilot query"
                className="flex-1 rounded-xl border border-[var(--stroke)] bg-transparent px-3.5 py-2.5 text-sm text-pri placeholder:text-tri outline-none focus:border-[var(--violet)]"
              />
              <button type="submit" className="btn btn-primary !p-2.5" aria-label="Send query">
                <Send size={15} />
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1 text-[10px] text-tri">
              <Cpu size={10} /> visuals appear on the analytics canvas; chat is per-session.
            </p>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}