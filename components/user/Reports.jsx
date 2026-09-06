'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Plus, Mail, MailOpen } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 29 + 38 — Weekly report subscriptions with live email preview. */
export default function ReportsPanel() {
  const digest = useDashboardStore((s) => s.digest)
  const add = useDashboardStore((s) => s.addDigest)
  const remove = useDashboardStore((s) => s.removeDigest)
  const on = useFlagsStore((s) => !!s.flags['report-subs']?.on)
  const [email, setEmail] = useState('ava.chen@ideon.co')
  const [freq, setFreq] = useState('weekly')
  const [day, setDay] = useState('monday')
  const [preview, setPreview] = useState(false)
  if (!on) return null

  return (
    <div className="card-3d p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-tri"><Send size={11} /> Report subscriptions</p>
        <button className="btn btn-ghost !py-1 text-[10px]" onClick={() => setPreview(true)}><MailOpen size={11} /> Preview email</button>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <input value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Recipient email" className="w-44 rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-pri outline-none focus:border-[var(--cyan)]" />
        <select value={freq} onChange={(e) => setFreq(e.target.value)} aria-label="Frequency" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-sec outline-none">
          <option value="weekly">every week</option>
          <option value="daily">every day</option>
        </select>
        <select value={day} onChange={(e) => setDay(e.target.value)} disabled={freq === 'daily'} aria-label="Day" className="rounded-lg border border-[var(--stroke)] bg-transparent px-2 py-1.5 text-[10px] text-sec outline-none">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button className="btn btn-primary !py-1.5 text-[10px]" onClick={() => { add({ email, freq, day }); }}>
          <Plus size={11} /> Schedule
        </button>
      </div>
      <div className="space-y-1">
        {digest.map((d) => (
          <div key={d.id} className="glass-soft flex items-center gap-2 rounded-lg px-2.5 py-1.5">
            <Mail size={11} className="text-tri" />
            <span className="min-w-0 flex-1 truncate text-[10px] text-sec">every {d.freq === 'daily' ? 'day' : d.day} → <strong className="text-pri">{d.email}</strong></span>
            <button className="text-tri hover:text-pri" onClick={() => remove(d.id)} aria-label="Remove subscription">×</button>
          </div>
        ))}
        {!digest.length && <p className="text-center text-[10px] italic text-tri">auto-email your exact view — or your manager's — every Monday</p>}
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div className="fixed inset-0 z-[87]" role="dialog" aria-modal="true" aria-label="Email digest preview">
            <div className="scrim absolute inset-0" onClick={() => setPreview(false)} />
            <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 18, opacity: 0 }} className="glass-strong absolute left-1/2 top-[10vh] w-[min(94vw,620px)] -translate-x-1/2 rounded-2xl p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-pri"><MailOpen size={14} className="tone-cyan tone-text" /> Digest preview</h3>
                <button className="icon-btn" onClick={() => setPreview(false)} aria-label="Close"><X size={14} /></button>
              </div>
              <div className="digest-sheet bg-[var(--bg-1)]">
                <div className="bg-[#0a0f16] px-5 py-4">
                  <p className="font-display text-sm font-bold text-white">IDEON · <span className="text-[var(--cyan)]">Command Center Digest</span></p>
                  <p className="text-[10px] text-white/50">Revenue · Users · Churn · Health · Tasks — {new Date().toLocaleDateString()}</p>
                </div>
                <div className="space-y-2 p-4">
                  {[['Revenue', '1,284,000 USD', '+12.4%'], ['Active users', '48,213', '+4.8%'], ['Churn', '3.6%', '▲ warning'], ['P99 latency', '214ms', 'healthy']].map(([k, v, d]) => (
                    <div key={k} className="flex items-center justify-between rounded-xl bg-[var(--bg-2)] px-3 py-2.5">
                      <span className="text-[11px] text-sec">{k}</span>
                      <span className="tabular text-[11px] font-semibold text-pri">{v}</span>
                      <span className="text-[10px]" style={{ color: d.startsWith('▲') ? 'var(--yellow)' : 'var(--green)' }}>{d}</span>
                    </div>
                  ))}
                  <p className="pt-1 text-center text-[9px] text-tri">View live · manage alerts · unsubscribe at any time</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}