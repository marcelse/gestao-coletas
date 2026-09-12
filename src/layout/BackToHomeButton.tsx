import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { homeRouteFor } from '../lib/roleRoutes'

export function BackToHomeButton() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!profile) return null
  const home = homeRouteFor(profile.perfil)
  if (location.pathname === home) return null

  return (
    <button
      onClick={() => navigate(home)}
      className="text-sm text-slate-500 hover:text-[var(--color-primary)] flex items-center gap-1 mb-4"
    >
      ← Voltar para Tela Principal
    </button>
  )
}
