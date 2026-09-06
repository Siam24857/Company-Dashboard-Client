import { create } from 'zustand'

const STORAGE_KEY = 'cc_dashboard_prefs'

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.className = theme === 'light' ? '' : 'dark'
}

let persisted = null
if (typeof window !== 'undefined') {
  try {
    persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    persisted = null
  }
}

/* session-scoped undo operators (functions can't persist) */
const undoOps = new Map()
let undoSeq = 0

const useDashboardStore = create((set, get) => ({
  /* ---------------- core ---------------- */
  theme: persisted?.theme || 'dark',
  themeMix: persisted?.themeMix ?? 100,
  sidebarCollapsed: persisted?.sidebarCollapsed ?? false,
  mobileNavOpen: false,
  focusMode: false,
  focusTarget: null,
  commandOpen: false,
  aiOpen: false,
  adminOpen: false,
  env: persisted?.env || 'prod',
  workspace: persisted?.workspace || 'executive',
  density: persisted?.density || 'comfortable',
  kpiSizes: persisted?.kpiSizes || {},
  bookmarks: persisted?.bookmarks || [],
  navCounts: persisted?.navCounts || {},
  huns: [],
  recent: [],
  toastBus: 0,
  visual: null,
  aiChat: [],

  /* ---------------- LAYER 1 · universal ---------------- */
  mood: 'good',
  timeWindow: persisted?.timeWindow ?? 336,
  ghost: persisted?.ghost ?? false,
  ghostDays: persisted?.ghostDays ?? 30,
  pins: persisted?.pins || [],
  annotations: persisted?.annotations || [],
  tags: persisted?.tags || [],
  slices: persisted?.slices || [],
  alertDefs: persisted?.alertDefs || [],
  snoozeUntil: persisted?.snoozeUntil ?? 0,
  dna: '',
  undoLog: persisted?.undoLog || [],
  story: false,
  cheatsheetOpen: false,
  replay: null,
  embedOpen: false,
  thresholdOpen: false,
  slicesOpen: false,
  macrosOpen: false,
  achOpen: false,
  notesOpen: false,

  /* ---------------- LAYER 2 · user ---------------- */
  palette: persisted?.palette || 'default',
  scrub: persisted?.scrub ?? false,
  silent: persisted?.silent ?? false,
  focusTimer: null,
  morningShown: persisted?.morningShown || '',
  achievements: persisted?.achievements || {},
  usage: persisted?.usage || { clicks: {}, heat: {}, order: [] },
  defaultLanding: persisted?.defaultLanding || '/command-center',
  defaultChartType: persisted?.defaultChartType || 'auto',
  customCss: persisted?.customCss || '',
  digest: persisted?.digest || [],
  reminders: persisted?.reminders || [],
  privateNotes: persisted?.privateNotes || [],
  macros: persisted?.macros || [],
  favorites: persisted?.favorites || [],
  voiceOn: persisted?.voiceOn ?? false,
  heatOverlay: false,
  explainTarget: null,

  /* ---------------- persistence ---------------- */
  persist: () => {
    if (typeof window === 'undefined') return
    const {
      theme, themeMix, sidebarCollapsed, env, workspace, density, kpiSizes, bookmarks, navCounts,
      timeWindow, ghost, ghostDays, pins, annotations, tags, slices, alertDefs, snoozeUntil, undoLog,
      palette, scrub, silent, morningShown, achievements, usage, defaultLanding, defaultChartType,
      customCss, digest, reminders, privateNotes, macros, favorites, voiceOn, customKPIs,
    } = get()
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme, themeMix, sidebarCollapsed, env, workspace, density, kpiSizes, bookmarks, navCounts,
        timeWindow, ghost, ghostDays, pins, annotations, tags, slices, alertDefs, snoozeUntil, undoLog,
        palette, scrub, silent, morningShown, achievements, usage, defaultLanding, defaultChartType,
        customCss, digest, reminders, privateNotes, macros, favorites, voiceOn, customKPIs,
      })
    )
  },

  /* ---------------- theme ---------------- */
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme, themeMix: theme === 'dark' ? 100 : 0 })
    get().persist()
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
  setThemeMix: (mix) => {
    set({ themeMix: mix })
    const apply = () => document.documentElement.style.setProperty('--theme-mix', String(mix))
    if (mix >= 100) { applyTheme('dark'); set({ theme: 'dark' }) }
    else if (mix <= 0) { applyTheme('light'); set({ theme: 'light' }) }
    else apply()
    get().persist()
  },

  /* ---------------- layout ---------------- */
  toggleSidebar: () => {
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }))
    get().persist()
  },
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setFocusMode: (open, target = null) =>
    set({ focusMode: open, focusTarget: open ? target : null }),
  setDensity: (density) => {
    set({ density })
    get().persist()
  },

  /* ---------------- overlays ---------------- */
  setCommandOpen: (open) => set({ commandOpen: open }),
  setAiOpen: (open) => set({ aiOpen: open }),
  setAdminOpen: (open) => set({ adminOpen: open }),
  setStory: (open) => set({ story: open }),
  setCheatsheetOpen: (open) => set({ cheatsheetOpen: open }),
  setEmbedOpen: (open) => set({ embedOpen: open }),
  setThresholdOpen: (open) => set({ thresholdOpen: open }),
  setSlicesOpen: (open) => set({ slicesOpen: open }),
  setMacrosOpen: (open) => set({ macrosOpen: open }),
  setAchOpen: (open) => set({ achOpen: open }),
  setNotesOpen: (open) => set({ notesOpen: open }),
  setExplainOpen: (id) => set({ explainTarget: id }),
  customKPIs: persisted?.customKPIs || [],
  addCustomKpi: (kpi) => {
    const k = { id: `kpi_custom_${Date.now()}`, tone: 'info', anomaly: null, benchmark: null, ...kpi }
    set((s) => ({ customKPIs: [...s.customKPIs.slice(-7), k] }))
    get().persist()
    get().logAction(`Custom metric built: ${kpi.label}`)
    return k
  },
  removeCustomKpi: (id) => {
    set((s) => ({ customKPIs: s.customKPIs.filter((k) => k.id !== id) }))
    get().persist()
  },

  /* ---------------- AI visual spec ---------------- */
  setVisual: (visual) => set({ visual }),
  clearVisual: () => set({ visual: null }),
  pushAiMessage: (msg) =>
    set((s) => ({
      aiChat: [
        ...s.aiChat.slice(-19),
        typeof msg === 'string' || !msg ? { role: 'ai', text: msg } : msg,
      ],
    })),

  /* ---------------- environment / workspace ---------------- */
  setEnv: (env) => {
    set({ env })
    get().persist()
    get().logAction(`Switched environment to ${env.toUpperCase()}`)
  },
  setEnvSession: (env) => {
    set({ env })
    get().logAction(`Temporary override → ${env.toUpperCase()} (shift)`)
  },
  setWorkspace: (workspace) => {
    set({ workspace })
    get().persist()
    get().logAction(`Switched workspace to ${workspace}`)
  },

  /* ---------------- KPI sizing ---------------- */
  setKpiSize: (id, size) => {
    set((s) => ({ kpiSizes: { ...s.kpiSizes, [id]: size } }))
    get().persist()
  },
  resetLayout: () => {
    set({ kpiSizes: {} })
    get().persist()
  },

  /* ---------------- bookmarks ---------------- */
  addBookmark: (label, payload) => {
    const bm = { id: `bm_${Date.now()}`, label, payload, at: new Date().toISOString() }
    set((s) => ({ bookmarks: [...s.bookmarks.slice(-23), bm] }))
    get().persist()
    get().award('saved-view')
    return bm
  },
  removeBookmark: (id) => {
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }))
    get().persist()
  },

  /* ---------------- adaptive sidebar ---------------- */
  bumpNav: (key) => {
    set((s) => {
      const count = (s.navCounts[key] || 0) + 1
      return { navCounts: { ...s.navCounts, [key]: count } }
    })
    get().persist()
  },

  /* ---------------- HUN ---------------- */
  pushHun: (hun) => {
    if (get().silent && hun.tone !== 'critical') return
    if (Date.now() < get().snoozeUntil && hun.tone !== 'critical') return
    const item = {
      id: `hun_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      at: new Date().toISOString(),
      ...hun,
    }
    set((s) => ({ huns: [item, ...s.huns].slice(0, 5) }))
  },
  dismissHun: (id) => set((s) => ({ huns: s.huns.filter((h) => h.id !== id) })),
  clearHuns: () => set({ huns: [] }),
  setSnooze: (hours) => {
    set({ snoozeUntil: hours ? Date.now() + hours * 3600000 : 0 })
    if (hours) get().logAction(`Notifications snoozed for ${hours}h`)
  },
  setSilent: (silent) => {
    set({ silent })
    get().persist()
  },

  /* ---------------- recent trail ---------------- */
  logAction: (label, meta = {}) => {
    set((s) => ({
      recent: [{ id: `act_${Date.now()}`, label, at: new Date().toISOString(), ...meta }, ...s.recent].slice(0, 12),
    }))
  },
  clearRecent: () => set({ recent: [] }),

  /* ---------------- mood·time·ghost window ---------------- */
  setMood: (mood) => set({ mood }),
  setTimeWindow: (hours) => {
    set({ timeWindow: hours })
    get().persist()
    get().logAction(`Time window set to ${Math.round(hours / 24)}d`)
  },
  setGhost: (ghost) => {
    set({ ghost })
    get().persist()
    get().logAction(`Comparison ghost ${ghost ? 'on' : 'off'}`)
  },
  setGhostDays: (days) => {
    set({ ghostDays: days })
    get().persist()
  },

  /* ---------------- smart pinboard ---------------- */
  togglePin: (id) => {
    set((s) => ({
      pins: s.pins.includes(id) ? s.pins.filter((p) => p !== id) : [...s.pins, id],
    }))
    get().persist()
  },
  isPinned: (id) => get().pins.includes(id),
  clearPins: () => {
    set({ pins: [] })
    get().persist()
  },

  /* ---------------- annotations ---------------- */
  addAnnotation: (ann) => {
    const a = { id: `ann_${Date.now()}`, at: new Date().toISOString(), author: 'Ava Chen', ...ann }
    set((s) => ({ annotations: [...s.annotations.slice(-23), a] }))
    get().persist()
    get().logAction(`Annotated ${ann.target || 'data point'}`)
    return a
  },
  removeAnnotation: (id) => {
    set((s) => ({ annotations: s.annotations.filter((a) => a.id !== id) }))
    get().persist()
  },

  /* ---------------- global tags ---------------- */
  addTag: (tag) => {
    const t = { id: `tag_${Date.now()}`, ...tag }
    set((s) => ({ tags: [...s.tags, t] }))
    get().persist()
    return t
  },
  removeTag: (id) => {
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }))
    get().persist()
  },

  /* ---------------- saved slices ---------------- */
  saveSlice: (name) => {
    const { visual, timeWindow, ghost, ghostDays, env, workspace } = get()
    const slice = { id: `sl_${Date.now()}`, name, visual, timeWindow, ghost, ghostDays, env, workspace, at: new Date().toISOString() }
    set((s) => ({ slices: [...s.slices.slice(-11), slice] }))
    get().persist()
    get().award('saved-view')
    return slice
  },
  removeSlice: (id) => {
    set((s) => ({ slices: s.slices.filter((x) => x.id !== id) }))
    get().persist()
  },
  loadSlice: (id) => {
    const slice = get().slices.find((x) => x.id === id)
    if (!slice) return
    set({
      visual: slice.visual, timeWindow: slice.timeWindow, ghost: slice.ghost,
      ghostDays: slice.ghostDays, env: slice.env, workspace: slice.workspace,
    })
    get().persist()
    get().logAction(`Loaded slice: ${slice.name}`)
  },

  /* ---------------- threshold alerter ---------------- */
  setAlertDef: (def) => {
    const alive = get().alertDefs.filter((a) => a.id !== def.id)
    const next = { id: `al_${Date.now()}`, armed: true, ...def }
    set({ alertDefs: [...alive, next] })
    get().persist()
    get().logAction(`Whisperer armed: ${def.metric} ${def.op} ${def.value}`)
  },
  disarmAlert: (id) => {
    set((s) => ({ alertDefs: s.alertDefs.map((a) => (a.id === id ? { ...a, armed: false } : a)) }))
    get().persist()
  },

  /* ---------------- DNA share ---------------- */
  buildDna: () => {
    const { visual, timeWindow, ghost, ghostDays, env, workspace } = get()
    const payload = { v: visual, t: timeWindow, g: ghost, gd: ghostDays, e: env, w: workspace }
    const dna = btoa(encodeURIComponent(JSON.stringify(payload)))
    set({ dna })
    return dna
  },
  applyDna: (dna) => {
    try {
      const data = JSON.parse(decodeURIComponent(atob(dna)))
      set({
        visual: data.v || null,
        timeWindow: data.t || 336,
        ghost: data.g ?? false,
        ghostDays: data.gd || 30,
        env: data.e || 'prod',
        workspace: data.w || 'executive',
      })
      get().persist()
      get().logAction('Applied shared view DNA')
      return true
    } catch {
      return false
    }
  },

  /* ---------------- undo centre ---------------- */
  pushUndo: (label, revert) => {
    const id = `u_${++undoSeq}`
    undoOps.set(id, revert)
    set((s) => ({
      undoLog: [{ id, label, at: new Date().toLocaleTimeString() }, ...s.undoLog].slice(0, 50),
    }))
    get().logAction(`⎌ ${label}`)
  },
  revertUndo: (id) => {
    const revert = undoOps.get(id)
    if (!revert) return false
    try { revert() } catch { return false }
    undoOps.delete(id)
    set((s) => ({ undoLog: s.undoLog.filter((e) => e.id !== id) }))
    get().logAction('Undid an action')
    return true
  },

  /* ---------------- macros ---------------- */
  saveMacro: (name, steps) => {
    const m = { id: `mc_${Date.now()}`, name, steps, at: new Date().toISOString() }
    set((s) => ({ macros: [...s.macros.slice(-9), m] }))
    get().persist()
    get().award('macro')
    return m
  },
  removeMacro: (id) => {
    set((s) => ({ macros: s.macros.filter((m) => m.id !== id) }))
    get().persist()
  },

  /* ---------------- favourites / scrubbing / palettes ---------------- */
  toggleFavorite: (key) => {
    set((s) => ({
      favorites: s.favorites.includes(key) ? s.favorites.filter((f) => f !== key) : [...s.favorites.slice(-49), key],
    }))
    get().persist()
  },
  setScrub: (scrub) => {
    set({ scrub })
    get().persist()
    get().logAction(`Anonymisation scrub ${scrub ? 'ON' : 'OFF'}`)
  },
  setPalette: (palette) => {
    set({ palette })
    get().persist()
  },
  setDefaultChartType: (type) => {
    set({ defaultChartType: type })
    get().persist()
  },
  setDefaultLanding: (route) => {
    set({ defaultLanding: route })
    get().persist()
  },
  setCustomCss: (css) => {
    set({ customCss: css })
    get().persist()
  },
  setVoiceOn: (on) => {
    set({ voiceOn: on })
    get().persist()
  },
  setHeatOverlay: (on) => set({ heatOverlay: on }),
  setReplay: (replay) => {
    set({ replay })
    if (replay && !get().replay) get().logAction('Replay mode engaged')
    if (!replay) get().logAction('Left replay mode')
  },

  /* ---------------- focus timer ---------------- */
  startFocus: (task) => {
    set({ focusTimer: { task, endTs: Date.now() + 25 * 60000 } })
    get().logAction(`Focus timer started: ${task}`)
  },
  stopFocus: () => set({ focusTimer: null }),

  /* ---------------- reminders ---------------- */
  addReminder: (text, at) => {
    const r = { id: `rm_${Date.now()}`, text, at, due: false }
    set((s) => ({ reminders: [...s.reminders.slice(-23), r] }))
    get().persist()
    return r
  },
  dismissReminder: (id) => {
    set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }))
    get().persist()
  },
  tickReminders: () => {
    const now = Date.now()
    let fired = false
    set((s) => ({ reminders: s.reminders.map((r) => { if (r.at <= now && !r.due) { fired = true; return { ...r, due: true } } return r }) }))
    if (fired) {
      const due = get().reminders.filter((r) => r.due)
      due.forEach((r) => get().pushHun({ title: 'Smart reminder', body: r.text, tone: 'warn' }))
    }
  },

  /* ---------------- private notes ---------------- */
  setNote: (target, text) => {
    set((s) => {
      const rest = s.privateNotes.filter((n) => n.target !== target)
      const notes = text ? [...rest, { target, text, at: new Date().toISOString() }] : rest
      return { privateNotes: notes }
    })
    get().persist()
  },
  getNote: (target) => get().privateNotes.find((n) => n.target === target)?.text || '',

  /* ---------------- digest subscriptions ---------------- */
  addDigest: (d) => {
    const sub = { id: `dg_${Date.now()}`, ...d }
    set((s) => ({ digest: [...s.digest, sub] }))
    get().persist()
    get().logAction(`Scheduled ${sub.freq} report for ${sub.email}`)
    return sub
  },
  removeDigest: (id) => {
    set((s) => ({ digest: s.digest.filter((x) => x.id !== id) }))
    get().persist()
  },

  /* ---------------- achievements + usage ---------------- */
  award: (id) => {
    set((s) => {
      if (s.achievements[id]) return s
      const ac = { ...s.achievements, [id]: new Date().toISOString() }
      return { achievements: ac }
    })
    get().persist()
  },
  trackInteraction: (widgetId) => {
    const now = Date.now()
    const key = `${String(new Date().getHours())}h`
    set((s) => {
      const day = new Date().toISOString().slice(0, 10)
      const clicks = { ...s.usage.clicks, [widgetId]: (s.usage.clicks[widgetId] || 0) + 1 }
      const heat = { ...s.usage.heat, [day]: { ...(s.usage.heat[day] || {}), [key]: ((s.usage.heat[day] || {})[key] || 0) + 1 } }
      const order = [widgetId, ...s.usage.order.filter((w) => w !== widgetId)].slice(0, 30)
      return { usage: { clicks, heat, order } }
    })
    if (now - (get().usage?._lastTrack || 0) > 60000) {
      const count = Object.values(get().usage.clicks).reduce((a, b) => a + b, 0)
      if (count >= 20) get().award('power-user')
    }
  },

  /* ---------------- morning brief ---------------- */
  markMorningShown: () => {
    const date = new Date().toDateString()
    set({ morningShown: date })
    get().persist()
  },
}))

if (typeof window !== 'undefined') applyTheme(persisted?.theme || 'dark')

export default useDashboardStore