import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const STAFF_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/coletas', label: 'Coletas' },
  { to: '/usuarios', label: 'Usuários' },
  { to: '/funcionarios', label: 'Funcionários' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/tipos-amostra', label: 'Tipos de Amostra' },
]

const ADMIN_ONLY_LINKS = [{ to: '/configuracoes-visuais', label: 'Configurações Visuais' }]

export function Nav() {
  const { profile } = useAuth()
  if (!profile || (profile.perfil !== 'ADMINISTRADOR' && profile.perfil !== 'COORDENACAO')) return null

  const links = profile.perfil === 'ADMINISTRADOR' ? [...STAFF_LINKS, ...ADMIN_ONLY_LINKS] : STAFF_LINKS

  return (
    <nav className="border-b border-slate-200 bg-white px-4 sm:px-6 overflow-x-auto">
      <div className="flex gap-1 max-w-6xl mx-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap px-3 py-2.5 text-sm border-b-2 ${
                isActive
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-medium'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
