import { create } from 'zustand'

const FLAGS_KEY = 'cc_feature_flags'

let persisted = null
if (typeof window !== 'undefined') {
  try {
    persisted = JSON.parse(localStorage.getItem(FLAGS_KEY) || 'null')
  } catch {
    persisted = null
  }
}

const DEFAULT_FLAGS = {
  'undo-snackbar': { on: true, group: 'universal' },
  'mood-aura': { on: true, group: 'universal' },
  'pinboard': { on: true, group: 'universal' },
  'time-slider': { on: true, group: 'universal' },
  'ghost-mode': { on: true, group: 'universal' },
  'clone-view': { on: true, group: 'universal' },
  'story-mode': { on: true, group: 'universal' },
  'team-pulse': { on: true, group: 'universal' },
  'alias-search': { on: true, group: 'universal' },
  'annotations': { on: true, group: 'universal' },
  'replay-mode': { on: true, group: 'universal' },
  'live-embed': { on: true, group: 'universal' },
  'whisperer': { on: true, group: 'universal' },
  'cheatsheet': { on: true, group: 'universal' },
  'dna-share': { on: true, group: 'universal' },
  'offline-staging': { on: true, group: 'universal' },
  'snooze': { on: true, group: 'universal' },
  'global-tags': { on: true, group: 'universal' },
  'explain': { on: true, group: 'universal' },
  'morning-brief': { on: true, group: 'user' },
  'feed-rank': { on: true, group: 'user' },
  'saved-slices': { on: true, group: 'user' },
  'self-heatmap': { on: true, group: 'user' },
  'private-notes': { on: true, group: 'user' },
  'focus-timer': { on: true, group: 'user' },
  'favourite-rows': { on: true, group: 'user' },
  'report-subs': { on: true, group: 'user' },
  'undo-history': { on: true, group: 'user' },
  'macro-recorder': { on: true, group: 'user' },
  'palettes': { on: true, group: 'user' },
  'reminders': { on: true, group: 'user' },
  'scrub': { on: true, group: 'user' },
  'achievements': { on: true, group: 'user' },
  'custom-css': { on: true, group: 'user' },
  'digest-preview': { on: true, group: 'user' },
  'default-chart': { on: true, group: 'user' },
  'silent': { on: true, group: 'user' },
  'voice-nav': { on: false, group: 'wow' },
  'theme-mix': { on: true, group: 'wow' },
  'holo-tooltip': { on: true, group: 'wow' },
  'collab-cursors': { on: true, group: 'wow' },
  'click-heatmap': { on: true, group: 'wow' },
  'live-spy': { on: true, group: 'admin' },
  'permission-matrix': { on: true, group: 'admin' },
  'fls': { on: true, group: 'admin' },
  'retention': { on: true, group: 'admin' },
  'bulk-invite': { on: true, group: 'admin' },
  'kill-session': { on: true, group: 'admin' },
  'ip-rules': { on: true, group: 'admin' },
  'sso': { on: true, group: 'admin' },
  'env-compare': { on: true, group: 'admin' },
  'webhook-tester': { on: true, group: 'admin' },
  'health-report': { on: true, group: 'admin' },
  'maintenance': { on: true, group: 'admin' },
  'role-clone': { on: true, group: 'admin' },
  'metric-builder': { on: true, group: 'admin' },
  'api-keys': { on: true, group: 'admin' },
  'data-transfer': { on: true, group: 'admin' },
  'error-dashboard': { on: true, group: 'admin' },
  'white-label': { on: true, group: 'admin' },
  'global-css': { on: true, group: 'admin' },
  'jobs-monitor': { on: true, group: 'admin' },
  'feedback': { on: true, group: 'admin' },
  'rate-limits': { on: true, group: 'admin' },
  'sql-console': { on: true, group: 'admin' },
  'licenses': { on: true, group: 'admin' },
  'upgrade-sim': { on: true, group: 'admin' },
  'search-replace': { on: true, group: 'admin' },
  'compliance': { on: true, group: 'admin' },
  'emergency': { on: true, group: 'admin' },
  'audit-replay': { on: true, group: 'admin' },
  'usage-analytics': { on: true, group: 'admin' },
  'white-label-email': { on: true, group: 'admin' },
}

const useFlagsStore = create((set, get) => ({
  flags: { ...DEFAULT_FLAGS, ...(persisted?.flags || {}) },
  setFlag: (id, on) => {
    set((s) => ({ flags: { ...s.flags, [id]: { ...s.flags[id], on } } }))
    get().persist()
  },
  on: (id) => !!get().flags[id]?.on,
  setGroup: (group, on) => {
    set((s) => ({
      flags: Object.fromEntries(
        Object.entries(s.flags).map(([k, v]) => [k, v.group === group ? { ...v, on } : v])
      ),
    }))
    get().persist()
  },
  groups: () => ['universal', 'user', 'admin', 'wow'],
  reset: () => {
    set({ flags: { ...DEFAULT_FLAGS } })
    get().persist()
  },
  persist: () => {
    if (typeof window === 'undefined') return
    localStorage.setItem(FLAGS_KEY, JSON.stringify({ flags: get().flags }))
  },
}))

export default useFlagsStore