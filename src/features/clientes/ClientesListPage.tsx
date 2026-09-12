import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Table } from '../../components/Table'
import { useToast } from '../../components/Toast'
import type { ClienteComPerfil } from '../../types/domain'
import { useClientes, useToggleClienteAtivo } from './api'

export function ClientesListPage() {
  const { data: clientes, isLoading } = useClientes()
  const toggleAtivo = useToggleClienteAtivo()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [alvo, setAlvo] = useState<ClienteComPerfil | null>(null)

  async function confirmarToggle() {
    if (!alvo) return
    try {
      await toggleAtivo.mutateAsync({ id: alvo.id, ativo: !alvo.ativo })
      notify(alvo.ativo ? 'Cliente inativado.' : 'Cliente ativado.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao atualizar cliente.', 'error')
    } finally {
      setAlvo(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Clientes</h1>
        <Button onClick={() => navigate('/clientes/novo')}>Novo Cliente</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Carregando…</p>
      ) : (
        <Table
          rows={clientes ?? []}
          rowKey={(c) => c.id}
          columns={[
            { header: 'Clínica', cell: (c) => c.nome_clinica },
            { header: 'Endereço', cell: (c) => c.endereco },
            { header: 'E-mail', cell: (c) => c.email },
            { header: 'Telefone', cell: (c) => c.telefone ?? '—' },
            {
              header: 'Status',
              cell: (c) => (
                <span className={c.ativo ? 'text-emerald-700' : 'text-slate-400'}>
                  {c.ativo ? 'Ativo' : 'Inativo'}
                </span>
              ),
            },
            {
              header: 'Ações',
              cell: (c) => (
                <div className="flex gap-2">
                  <button
                    className="text-[var(--color-primary)] hover:underline"
                    onClick={() => navigate(`/clientes/${c.id}/editar`)}
                  >
                    Editar
                  </button>
                  <button
                    className={c.ativo ? 'text-[var(--color-danger)] hover:underline' : 'text-emerald-700 hover:underline'}
                    onClick={() => setAlvo(c)}
                  >
                    {c.ativo ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!alvo}
        title={alvo?.ativo ? 'Inativar cliente' : 'Ativar cliente'}
        message={`Deseja realmente ${alvo?.ativo ? 'inativar' : 'ativar'} ${alvo?.nome_clinica}?`}
        confirmLabel={alvo?.ativo ? 'Inativar' : 'Ativar'}
        danger={alvo?.ativo}
        onConfirm={confirmarToggle}
        onCancel={() => setAlvo(null)}
      />
    </div>
  )
}
