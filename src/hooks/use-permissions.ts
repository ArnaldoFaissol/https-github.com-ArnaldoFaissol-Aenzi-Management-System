import { useAuth } from '@/hooks/use-auth'

export function usePermissions() {
  const { user } = useAuth()

  const hasRole = (role: string | string[]) => {
    if (!user || !user.role) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  const isSuperuser = hasRole('superuser')
  const isAdmin = hasRole(['admin', 'superuser'])
  const isUser = hasRole(['user', 'admin', 'superuser'])

  return { hasRole, isSuperuser, isAdmin, isUser }
}
