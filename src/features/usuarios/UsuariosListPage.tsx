import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Table } from '../../components/Table'
import { useToast } from '../../components/Toast'
import { PERFIL_LABEL } from '../../lib/constants'
import { useToggleUsuarioAtivo, useUsuarios, type Usuario } from './api'
import { ResetSenhaModal } from './ResetSenhaModal'

export function UsuariosListPage() {
  const { data: usuarios, isLoading } = useUsuarios()
  const toggleAtivo = useToggleUsuarioAtivo()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [alvo, setAlvo] = useState<Usuario | null>(null)
  const [alvoSenha, setAlvoSenha] = useState<Usuario | null>(null)

  async function confirmarToggle() {
    if (!alvo) return
    try {
      await toggleAtivo.mutateAsync({ id: alvo.id, ativo: !alvo.ativo })
      notify(alvo.ativo ? 'Usuário inativado.' : 'Usuário ativado.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao atualizar usuário.', 'error')
    } finally {
      setAlvo(null)
    }
  }

  function editarRota(usuario: Usuario) {
    return usuario.perfil === 'CLIENTE' ? `/clientes/${usuario.id}/editar` : `/funcionarios/${usuario.id}/editar`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Usuários</h1>
        <Button onClick={() => navigate('/usuarios/novo')}>Novo Usuário</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Carregando…</p>
      ) : (
        <Table
          rows={usuarios ?? []}
          rowKey={(u) => u.id}
          columns={[
            { header: 'Nome', cell: (u) => u.nome },
            { header: 'E-mail', cell: (u) => u.email },
            { header: 'Telefone', cell: (u) => u.telefone ?? '—' },
            { header: 'Perfil', cell: (u) => PERFIL_LABEL[u.perfil] },
            {
              header: 'Status',
              cell: (u) => (
                <span className={u.ativo ? 'text-emerald-700' : 'text-slate-400'}>
                  {u.ativo ? 'Ativo' : 'Inativo'}
                </span>
              ),
            },
            {
              header: 'Ações',
              cell: (u) => (
                <div className="flex gap-2">
                  <button
                    className="text-[var(--color-primary)] hover:underline"
                    onClick={() => navigate(editarRota(u))}
                  >
                    Editar
                  </button>
                  <button className="text-[var(--color-primary)] hover:underline" onClick={() => setAlvoSenha(u)}>
                    Alterar Senha
                  </button>
                  <button
                    className={u.ativo ? 'text-[var(--color-danger)] hover:underline' : 'text-emerald-700 hover:underline'}
                    onClick={() => setAlvo(u)}
                  >
                    {u.ativo ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!alvo}
        title={alvo?.ativo ? 'Inativar usuário' : 'Ativar usuário'}
        message={`Deseja realmente ${alvo?.ativo ? 'inativar' : 'ativar'} ${alvo?.nome}?`}
        confirmLabel={alvo?.ativo ? 'Inativar' : 'Ativar'}
        danger={alvo?.ativo}
        onConfirm={confirmarToggle}
        onCancel={() => setAlvo(null)}
      />

      <ResetSenhaModal usuario={alvoSenha} onClose={() => setAlvoSenha(null)} />
    </div>
  )
}
