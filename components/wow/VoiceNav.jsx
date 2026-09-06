'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Volume2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useFlagsStore from '@/store/flags.store'
import useDashboardStore from '@/store/dashboard.store'
import { resolveQuery } from '@/lib/ai'
import { resolveAlias } from '@/lib/ai'
import { cn } from '@/lib/utils'

/* Feature 74 · Voice navigation — "show me Europe revenue" → that chart, hands-free. */

function execAlias(action) {
  const s = useDashboardStore.getState()
  if (action === 'theme') s.toggleTheme()
  else if (action === 'story') s.setStory(true)
  else if (action === 'scrub') s.setScrub(!s.scrub)
  else if (action === 'focus') s.setFocusMode(true, null)
  else if (action === 'explain') s.setExplainOpen(true)
  else if (action === 'admin') s.setAdminOpen(true)
  else if (action === 'nav') { window.location.hash = 'tasks'; s.logAction('Navigated to tasks (voice)') }
  s.logAction(`Voice alias: ${action}`)
}
export default function VoiceNav() {
  const enabled = useFlagsStore((s) => !!s.flags['voice-nav']?.on)
  const voiceOn = useDashboardStore((s) => s.voiceOn)
  const setVoiceOn = useDashboardStore((s) => s.setVoiceOn)
  const [open, setOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const recRef = useRef(null)

  useEffect(() => {
    if (!enabled || !open) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setErr('Speech recognition not supported in this browser — try an LLM command instead.')
      return
    }
    const rec = new SR()
    recRef.current = rec
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript
      setText(t)
      setListening(false)
      const query = t.trim()
      const s = useDashboardStore.getState()
      const alias = resolveAlias(query)
      if (alias && alias.mods.action) {
        execAlias(alias.mods.action)
        useDashboardStore.getState().award('voice')
        setOpen(false)
        return
      }
      const r = resolveQuery(query)
      if (r.kind === 'visual') {
        s.pushAiMessage({ role: 'user', text: query })
        s.logAction(`AI render: ${r.title}`)
        s.setVisual(r)
        if (alias) {
          if (alias.mods.timeWindow) s.setTimeWindow(alias.mods.timeWindow)
          if (alias.mods.ghost) { s.setGhostOn(true); s.setGhostDays(alias.mods.ghostDays) }
        }
        useDashboardStore.getState().award('voice')
        setOpen(false)
      } else if (r.kind === 'action') {
        execAlias(r.action === 'nav' ? 'nav' : r.action)
        useDashboardStore.getState().award('voice')
        setOpen(false)
      } else {
        s.pushAiMessage({ role: 'user', text: query })
        s.pushAiMessage({ role: 'ai', text: r.answer })
      }
    }
    rec.onerror = (ev) => {
      setErr(ev.error === 'not-allowed' ? 'Microphone permission declined.' : `Transcript error: ${ev.error}`)
      setListening(false)
    }
    rec.onend = () => setListening(false)
    return () => {
      try { rec.stop() } catch { /* noop */ }
      recRef.current = null
    }
  }, [enabled, open])

  useEffect(() => {
    if (!enabled || !voiceOn) return
    const onKey = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => {
          const rec = recRef.current
          if (rec) { setListening(true); try { rec.start() } catch { /* already running */ } }
        }, 250)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, voiceOn])

  if (!enabled) return null

  return (
    <>
      <span className="relative">
        <button
          className={cn('btn data-[on=true]:tone-cyan', '')}
          data-on={voiceOn}
          onClick={() => {
            setVoiceOn(!voiceOn)
            if (!voiceOn) useDashboardStore.getState().pushAiMessage('Voice nav on — press **Alt+V** to speak a command.')
          }}
          aria-label="Toggle voice nav"
          aria-pressed={voiceOn}
        >
          {voiceOn ? <Mic size={13} /> : <MicOff size={13} />}
        </button>
      </span>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-x-0 top-6 z-[120] flex justify-center" role="dialog" aria-modal="true" aria-label="Voice command">
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              className="glass-strong flex w-[min(92vw,480px)] items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl"
            >
              <span className={cn('grid h-9 w-9 place-items-center rounded-full', listening ? 'animate-pulse bg-[var(--red)]/20 text-[var(--red)]' : 'tone-cyan tone-soft tone-text')}>
                <Volume2 size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-tri">{listening ? 'listening…' : 'voice command'}</p>
                <p className="truncate text-xs text-pri">{text || (listening ? 'say it — e.g. “show Europe revenue”' : err || 'press the mic to start')}</p>
              </div>
              {listening ? (
                <span className="flex gap-1" aria-hidden="true">
                  {[0, 1, 2].map((i) => <span key={i} className="h-3 w-1 animate-pulse rounded bg-[var(--cyan)]" style={{ animationDelay: `${i * 120}ms` }} />)}
                </span>
              ) : (
                <button className="btn btn-primary !py-2" disabled={!!err} onClick={() => {
                  const rec = recRef.current
                  if (rec) { setErr(''); setListening(true); try { rec.start() } catch { /* noop */ } }
                }}>Mic</button>
              )}
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close voice"><X size={14} /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}