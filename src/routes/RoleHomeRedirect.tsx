import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { homeRouteFor } from '../lib/roleRoutes'

export function RoleHomeRedirect() {
  const { profile } = useAuth()
  if (!profile) return null
  return <Navigate to={homeRouteFor(profile.perfil)} replace />
}
