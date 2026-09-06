export const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const roleBase = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'BUSINESS_MANAGEMENT':
      return '/business'
    case 'SALES_MANAGEMENT':
      return '/sales'
    case 'OPERATIONS_DEVELOPER':
      return '/operations'
    default:
      return '/dashboard'
  }
}

export const hubLabel = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'Admin'
    case 'BUSINESS_MANAGEMENT':
      return 'Business Management'
    case 'SALES_MANAGEMENT':
      return 'Sales Management'
    case 'OPERATIONS_DEVELOPER':
      return 'Operations'
    default:
      return 'Dashboard'
  }
}

export const currentBase = () => {
  const user = getStoredUser()
  return roleBase(user?.role)
}