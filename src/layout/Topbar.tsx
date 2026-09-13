import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { homeRouteFor } from '../lib/roleRoutes'
import { useTheme } from '../theme/useTheme'
import { UserMenu } from './UserMenu'

export function Topbar() {
  const { config } = useTheme()
  const { profile } = useAuth()

  return (
    <header className="h-16 border-b border-slate-200 bg-[var(--color-surface,white)] flex items-center justify-between px-4 sm:px-6">
      <Link to={profile ? homeRouteFor(profile.perfil) : '/'} className="flex items-center gap-2">
        {config?.logo_url && (
          <img src={config.logo_url} alt="Logomarca" className="h-9 max-w-[160px] object-contain" />
        )}
        <span className="font-semibold text-lg text-[var(--color-primary)]">Gestão de Coletas</span>
      </Link>
      <UserMenu />
    </header>
  )
}
