import { create } from 'zustand'
import { getUser, setUser, removeUser } from '../lib/auth'

const useAuthStore = create((set, get) => ({
  user: getUser(),
  isAuthenticated: !!getUser(),
  isLoading: false,

  setUser: (userData) => {
    setUser(userData)
    set({ user: userData, isAuthenticated: true })
  },

  logout: () => {
    removeUser()
    set({ user: null, isAuthenticated: false })
  },

  updateUser: (userData) => {
    const updatedUser = { ...get().user, ...userData }
    setUser(updatedUser)
    set({ user: updatedUser })
  },
}))

export default useAuthStore
