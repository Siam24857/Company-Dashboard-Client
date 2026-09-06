'use client'

import { useEffect, useRef, useState } from 'react'
import useLiveStore from '@/store/live.store'
import useDashboardStore from '@/store/dashboard.store'

/**
 * Simulated real-time transport + metric stream.
 * Swap `new SocketTransport(url)` for a real WebSocket:
 *
 *   const transport = new SocketTransport('wss://api.ideon.co/stream')
 *   useLiveStore.getState().connect(transport)
 */
class SocketTransport {
  constructor(url, handlers) {
    this.url = url
    this.handlers = handlers
    this.timer = null
    this.interval = null
  }
  connect() {
    this.interval = setInterval(() => this.tick(), 2200)
    this.timer = setTimeout(() => this.handlers.onOpen?.(), 600)
    return this
  }
  tick() {
    this.handlers.onMessage?.({
      type: 'metric_tick',
      payload: {
        ts: Date.now(),
        latency: 18 + Math.random() * 34,
        revenue: 1280000 + Math.round(Math.random() * 9000),
        users: 48100 + Math.round(Math.random() * 280),
      },
    })
  }
  close() {
    clearInterval(this.interval)
    clearTimeout(this.timer)
  }
}

export default function useLiveData(enabled = true) {
  const connected = useLiveStore((s) => s.connected)
  const lastPacket = useLiveStore((s) => s.lastPacket)
  const latencyMs = useLiveStore((s) => s.latencyMs)
  const [tick, setTick] = useState({ ts: Date.now() })
  const transportRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined
    const store = useLiveStore.getState()
    const transport = new SocketTransport('wss://mock/stream', {
      onOpen: () => {
        store.connect(transport)
        useDashboardStore.getState().logAction('Live stream connected', { tone: 'success' })
      },
      onMessage: (msg) => {
        store.connect(transport)
        setTick(msg.payload)
        useLiveStore.getState().pumpHeartbeat()
      },
    })
    transportRef.current = transport.connect()
    return () => transport.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return { connected, lastPacket, latencyMs, tick }
}

export { SocketTransport }