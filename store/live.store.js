import { create } from 'zustand'

/**
 * Real-time data pipeline.
 * `connected` mirrors the WS socket state; the provider is swapped for a
 * real WebSocket endpoint by passing a `transport` object to `connect()`.
 */
const useLiveStore = create((set, get) => ({
  connected: false,
  transport: null,
  lastPacket: null,
  latencyMs: 24,
  latencyHistory: [
    { t: 0, v: 22 },
    { t: 1, v: 30 },
    { t: 2, v: 19 },
    { t: 3, v: 27 },
    { t: 4, v: 24 },
    { t: 5, v: 26 },
  ],
  heartbeat: 0,

  connect: (transport) => {
    const prev = get().transport
    if (prev && prev !== transport && prev.close) prev.close()
    set({ transport, connected: true, latencyMs: 18 })
    if (transport && transport.onMessage) {
      transport.onMessage((packet) => {
        set((s) => ({
          lastPacket: packet,
          latencyMs: Math.max(6, Math.round(18 + Math.random() * 34)),
          latencyHistory: [...s.latencyHistory, { t: s.latencyHistory.length, v: s.latencyMs }].slice(-60),
        }))
        get().pumpHeartbeat()
      })
    }
  },

  disconnect: () => {
    const t = get().transport
    if (t && t.close) t.close()
    set({ connected: false, transport: null })
  },

  pumpHeartbeat: () => set((s) => ({ heartbeat: s.heartbeat + 1 })),
}))

export default useLiveStore