'use client'

import { useEffect, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import useDashboardStore from '@/store/dashboard.store'
import useFlagsStore from '@/store/flags.store'

/* Feature 12 — Replay Mode. Scrub back through history frame by frame like a video player. */
export default function ReplayBar() {
  const on = useFlagsStore((s) => !!s.flags['replay-mode']?.on)
  const replay = useDashboardStore((s) => s.replay)
  const setReplay = useDashboardStore((s) => s.setReplay)
  const [frames] = useState(12)
  const [playing, setPlaying] = useState(false)

  if (!on) return null

  const start = () => setReplay({ index: 0, max: frames })
  const stop = () => setReplay(null)

  useEffect(() => {
    if (!playing || !replay) return undefined
    const t = setInterval(() => {
      const cur = useDashboardStore.getState().replay
      if (!cur) return
      if (cur.index >= cur.max - 1) { setPlaying(false); return }
      setReplay({ index: cur.index + 1, max: cur.max })
    }, 900)
    return () => clearInterval(t)
  }, [playing, replay?.index, replay?.max, setReplay])

  if (!replay) {
    return (
      <button className="btn btn-ghost text-[11px] text-tri hover:text-sec" onClick={start}>
        <RotateCcw size={11} /> Replay history
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-xl glass-soft px-3 py-1.5">
      <button className="icon-btn h-6 w-6" aria-label="First frame" onClick={() => setReplay({ index: 0, max: replay.max })}><SkipBack size={11} /></button>
      <button className="icon-btn h-6 w-6" aria-label={playing ? 'Pause replay' : 'Play replay'} onClick={() => setPlaying(!playing)}>
        {playing ? <Pause size={11} /> : <Play size={11} />}
      </button>
      <button className="icon-btn h-6 w-6" aria-label="Next frame" onClick={() => setReplay({ index: Math.min(replay.max - 1, replay.index + 1), max: replay.max })}><SkipForward size={11} /></button>
      <span className="tabular text-[10px] text-sec">frame {replay.index + 1}/{replay.max}</span>
      <button className="icon-btn h-6 w-6" aria-label="End replay" onClick={() => { setPlaying(false); stop() }}><RotateCcw size={11} /></button>
    </div>
  )
}