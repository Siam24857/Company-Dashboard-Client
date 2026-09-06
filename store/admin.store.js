import { create } from 'zustand'
import { licenseUsers, scheduledJobsSeed, apiKeysSeed, webhooksSeed, retentionSeed, ipSeed, rateSeed } from '@/lib/mock'

const ADMIN_KEY = 'cc_admin_cfg'

let persisted = null
if (typeof window !== 'undefined') {
  try {
    persisted = JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null')
  } catch {
    persisted = null
  }
}

const useAdminStore = create((set, get) => ({
  /* access */
  permissions: persisted?.permissions || {
    'ava.chen@ideon.co': { 'dashboard.read': true, 'export.read': true, 'admin.full': true },
    'm.vazquez@ideon.co': { 'dashboard.read': true, 'export.read': true, 'admin.read': false },
    'r.diaz@ideon.co': { 'dashboard.read': true, 'export.read': false },
    'j.kim@ideon.co': { 'dashboard.read': true },
    's.keller@ideon.co': { 'dashboard.read': true },
    'n.park@ideon.co': { 'dashboard.read': true, 'deploy.write': true },
    't.reyes@ideon.co': { 'ticket.write': true },
  },
  roles: persisted?.roles || ['Executive', 'Sales Manager', 'Ops Manager', 'Analyst', 'Developer', 'Support'],
  setPermission: (user, perm, value) =>
    set((s) => ({
      permissions: {
        ...s.permissions,
        [user]: { ...(s.permissions[user] || {}), [perm]: value },
      },
    })),
  cloneRole: (from, to) => {
    const donor = get().members?.find((m) => m.role === from)
    const perms = Object.fromEntries(
      Object.entries(get().permissions).filter(([, p]) => p['admin.full'])
    )
    set((s) => ({
      roles: [...new Set([...s.roles, to])],
      permissions: { ...s.permissions, [`role-${to}`]: donor ? perms : {} },
    }))
    get().persist()
  },

  /* feature-flag targeting groups */
  flagGroups: persisted?.flagGroups || {
    universal: { groups: ['everyone'], on: true },
    admin: { groups: ['executive'], on: true },
  },

  /* maintenance + emergency */
  maintenance: persisted?.maintenance ?? false,
  maintenanceEta: persisted?.maintenanceEta || '18:00 UTC',
  setMaintenance: (v) => {
    set({ maintenance: v })
    get().persist()
  },
  setMaintenanceEta: (v) => {
    set({ maintenanceEta: v })
    get().persist()
  },
  emergency: persisted?.emergency ?? false,
  setEmergency: (v) => {
    set({ emergency: v })
    get().persist()
  },
  readonly: persisted?.emergency ?? false,

  /* identity: sso + ip */
  sso: persisted?.sso || {
    provider: 'azure', tenantId: '', clientId: '', entityId: 'ideon-co', certThumbprint: 'T7E9-2B4A',
  },
  setSso: (patch) => {
    set((s) => ({ sso: { ...s.sso, ...patch } }))
    get().persist()
  },
  ipRules: persisted?.ipRules || ipSeed,
  setIp: (rules) => {
    set({ ipRules: rules })
    get().persist()
  },

  /* branding */
  whiteLabel: persisted?.whiteLabel || {
    name: 'IDEON', logo: '', favicon: '', footer: 'Sent from IDEON Command Center',
  },
  setWhiteLabel: (patch) => {
    set((s) => ({ whiteLabel: { ...s.whiteLabel, ...patch } }))
    get().persist()
  },
  globalCss: persisted?.globalCss || '',
  setGlobalCss: (css) => {
    set({ globalCss: css })
    get().persist()
  },

  /* retention + licenses */
  retention: persisted?.retention || retentionSeed,
  setRetention: (id, days) =>
    set((s) => ({
      retention: s.retention.map((r) => (r.id === id ? { ...r, days } : r)),
    })),
  licenses: persisted?.licenses || {
    total: 200, used: licenseUsers.length, users: licenseUsers, lastSync: '2h ago',
  },
  revokeLicense: (email) =>
    set((s) => ({ licenses: { ...s.licenses, users: s.licenses.users.filter((u) => u.email !== email) } })),

  /* engineering */
  apiKeys: persisted?.apiKeys || apiKeysSeed,
  rotateKey: (id) => {
    const prefix = `ideon_${Math.random().toString(36).slice(2, 8)}`
    set((s) => ({ apiKeys: s.apiKeys.map((k) => (k.id === id ? { ...k, prefix, rotatedAt: 'just now' } : k)) }))
    get().persist()
  },
  revokeKey: (id) => {
    set((s) => ({ apiKeys: s.apiKeys.map((k) => (k.id === id ? { ...k, revoked: true } : k)) }))
    get().persist()
  },
  webhooks: persisted?.webhooks || webhooksSeed,
  jobs: scheduledJobsSeed,
  rateLimits: persisted?.rateLimits || rateSeed,
  setLimit: (id, perMin) =>
    set((s) => ({
      rateLimits: s.rateLimits.map((r) => (r.id === id ? { ...r, perMin } : r)),
    })),

  /* feedback + metrics + sessions */
  feedback: persisted?.feedback || [],
  addFeedback: (f) => {
    set((s) => ({ feedback: [{ id: `fb_${Date.now()}`, at: new Date().toISOString(), ...f }, ...s.feedback] }))
    get().persist()
  },

  persist: () => {
    if (typeof window === 'undefined') return
    const {
      permissions, roles, flagGroups, maintenance, maintenanceEta, emergency, sso, ipRules,
      whiteLabel, globalCss, retention, licenses, apiKeys, webhooks, rateLimits, feedback,
    } = get()
    localStorage.setItem(
      ADMIN_KEY,
      JSON.stringify({
        permissions, roles, flagGroups, maintenance, maintenanceEta, emergency, sso, ipRules,
        whiteLabel, globalCss, retention, licenses, apiKeys, webhooks, rateLimits, feedback,
      })
    )
  },
}))

export default useAdminStore