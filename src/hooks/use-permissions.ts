import { useAuth } from '@/hooks/use-auth'

export function usePermissions() {
  const { user } = useAuth()

  const hasRole = (roles: string[]) => {
    if (!user || !user.role) return false
    return roles.includes(user.role)
  }

  const isSuperuser = hasRole(['superuser'])
  const isAdmin = hasRole(['superuser', 'admin'])
  const isUser = hasRole(['superuser', 'admin', 'user'])

  const canEditAsset = isAdmin
  const canDeleteAsset = isSuperuser

  return { hasRole, isSuperuser, isAdmin, isUser, canEditAsset, canDeleteAsset }
}
