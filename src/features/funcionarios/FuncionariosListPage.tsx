import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useToast } from '../../components/Toast'
import { Table } from '../../components/Table'
import { PERFIL_LABEL } from '../../lib/constants'
import type { FuncionarioComPerfil } from '../../types/domain'
import { useFuncionarios, useToggleFuncionarioAtivo } from './api'

export function FuncionariosListPage() {
  const { data: funcionarios, isLoading } = useFuncionarios()
  const toggleAtivo = useToggleFuncionarioAtivo()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [alvo, setAlvo] = useState<FuncionarioComPerfil | null>(null)

  async function confirmarToggle() {
    if (!alvo) return
    try {
      await toggleAtivo.mutateAsync({ id: alvo.id, ativo: !alvo.ativo })
      notify(alvo.ativo ? 'Funcionário inativado.' : 'Funcionário ativado.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao atualizar funcionário.', 'error')
    } finally {
      setAlvo(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Funcionários</h1>
        <Button onClick={() => navigate('/funcionarios/novo')}>Novo Funcionário</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Carregando…</p>
      ) : (
        <Table
          rows={funcionarios ?? []}
          rowKey={(f) => f.id}
          columns={[
            { header: 'Nome', cell: (f) => f.nome_completo },
            { header: 'E-mail', cell: (f) => f.email },
            { header: 'Telefone', cell: (f) => f.telefone ?? '—' },
            { header: 'Perfil', cell: (f) => PERFIL_LABEL[f.perfil] },
            {
              header: 'Status',
              cell: (f) => (
                <span className={f.ativo ? 'text-emerald-700' : 'text-slate-400'}>
                  {f.ativo ? 'Ativo' : 'Inativo'}
                </span>
              ),
            },
            {
              header: 'Ações',
              cell: (f) => (
                <div className="flex gap-2">
                  <button
                    className="text-[var(--color-primary)] hover:underline"
                    onClick={() => navigate(`/funcionarios/${f.id}/editar`)}
                  >
                    Editar
                  </button>
                  <button
                    className={f.ativo ? 'text-[var(--color-danger)] hover:underline' : 'text-emerald-700 hover:underline'}
                    onClick={() => setAlvo(f)}
                  >
                    {f.ativo ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!alvo}
        title={alvo?.ativo ? 'Inativar funcionário' : 'Ativar funcionário'}
        message={`Deseja realmente ${alvo?.ativo ? 'inativar' : 'ativar'} ${alvo?.nome_completo}?`}
        confirmLabel={alvo?.ativo ? 'Inativar' : 'Ativar'}
        danger={alvo?.ativo}
        onConfirm={confirmarToggle}
        onCancel={() => setAlvo(null)}
      />
    </div>
  )
}
