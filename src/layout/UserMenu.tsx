import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { PERFIL_LABEL } from '../lib/constants'

export function UserMenu() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  if (!profile) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm text-right hover:opacity-80"
      >
        <span>
          <span className="block font-medium text-slate-800">{profile.nome_completo}</span>
          <span className="block text-xs text-slate-500">{PERFIL_LABEL[profile.perfil]}</span>
        </span>
        <span className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-semibold">
          {profile.nome_completo.charAt(0).toUpperCase()}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-20 text-sm">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-slate-50"
              onClick={() => {
                setOpen(false)
                navigate('/meus-dados')
              }}
            >
              Alterar Dados
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-slate-50"
              onClick={() => {
                setOpen(false)
                navigate('/alterar-senha')
              }}
            >
              Alterar Senha
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-slate-50 text-[var(--color-danger)]"
              onClick={() => signOut()}
            >
              Sair do Sistema
            </button>
          </div>
        </>
      )}
    </div>
  )
}
