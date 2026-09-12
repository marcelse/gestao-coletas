import { Navigate, Outlet } from 'react-router-dom'
import type { Perfil } from '../lib/constants'
import { useAuth } from './useAuth'

export function RequireAuth({ roles }: { roles?: Perfil[] }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando…</div>
  if (!session) return <Navigate to="/login" replace />
  if (!profile?.ativo) return <Navigate to="/login?motivo=inativo" replace />
  if (roles && !roles.includes(profile.perfil)) return <Navigate to="/" replace />

  return <Outlet />
}
