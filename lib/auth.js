export const getToken = () => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

export const setToken = (token) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('token', token)
}

export const removeToken = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
}

export const getUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export const setUser = (user) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

export const removeUser = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user')
}
