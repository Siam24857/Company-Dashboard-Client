import { create } from 'zustand'

const TEAM_KEY = 'cc_team_pulse'
let persisted = null
if (typeof window !== 'undefined') {
  try {
    persisted = JSON.parse(localStorage.getItem(TEAM_KEY) || 'null')
  } catch {
    persisted = null
  }
}

const seedUsers = persisted?.users || [
  { id: 'u_mv', name: 'Marco', color: 'var(--cyan)', page: 'Data Intelligence', sessionStart: Date.now() - 42 * 60000, online: true },
  { id: 'u_rd', name: 'Ria', color: 'var(--violet)', page: 'Cognitive Overview', sessionStart: Date.now() - 5 * 60000, online: true },
  { id: 'u_jk', name: 'Jonah', color: 'var(--yellow)', page: 'System Health', sessionStart: Date.now() - 3 * 60000, online: true },
  { id: 'u_sk', name: 'Sam', color: 'var(--green)', page: 'Task Workflow', sessionStart: Date.now() - 70 * 60000, online: false },
]

const useTeamStore = create((set, get) => ({
  me: persisted?.me || { id: 'u_ava', name: 'Ava', color: 'linear-gradient(135deg, var(--cyan), var(--violet))' },
  users: seedUsers,
  cursors: {},
  remoteFilters: {}, // user-id -> active filter label
  setUsers: (users) => {
    set({ users })
    localStorage.setItem(TEAM_KEY, JSON.stringify({ ...get(), users }))
  },
  setFilters: (userId, label) =>
    set((s) => ({ remoteFilters: { ...s.remoteFilters, [userId]: label } })),
  moveCursor: (userId, x, y) => {
    set((s) => ({ cursors: { ...s.cursors, [userId]: { x, y, seenAt: Date.now() } } }))
  },
  removeUser: (id) => {
    set((s) => ({ users: s.users.filter((u) => u.id !== id) }))
    localStorage.setItem(TEAM_KEY, JSON.stringify(get()))
  },
}))

export default useTeamStore