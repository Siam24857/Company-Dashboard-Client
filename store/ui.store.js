import { create } from 'zustand'

const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  notifications: [],

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set({ notifications: [notification, ...get().notifications] }),
}))

export default useUIStore
