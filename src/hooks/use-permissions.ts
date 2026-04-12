import { useAuth } from '@/hooks/use-auth'

export function usePermissions() {
  const { user } = useAuth()

  const hasRole = (roles: string[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  return { hasRole }
}
