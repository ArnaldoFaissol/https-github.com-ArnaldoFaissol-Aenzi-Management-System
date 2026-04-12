import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user, loading } = useAuth()
  const { hasRole } = usePermissions()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
