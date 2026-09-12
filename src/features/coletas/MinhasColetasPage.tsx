import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StatusBadge } from '../../components/StatusBadge'
import { Table } from '../../components/Table'
import { useToast } from '../../components/Toast'
import type { ColetaDetalhada } from '../../types/domain'
import { useDeleteColeta, useMinhasColetas } from './api'

export function MinhasColetasPage() {
  const { data: coletas, isLoading } = useMinhasColetas()
  const deleteColeta = useDeleteColeta()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [alvo, setAlvo] = useState<ColetaDetalhada | null>(null)

  async function confirmarExclusao() {
    if (!alvo) return
    try {
      await deleteColeta.mutateAsync(alvo.id)
      notify('Solicitação excluída.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao excluir solicitação.', 'error')
    } finally {
      setAlvo(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Minhas Coletas</h1>
        <Button onClick={() => navigate('/minhas-coletas/nova')}>Nova Solicitação</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Carregando…</p>
      ) : (
        <Table
          rows={coletas ?? []}
          rowKey={(c) => c.id}
          columns={[
            { header: 'Amostra', cell: (c) => c.tipo_amostra?.nome ?? '—' },
            { header: 'Endereço', cell: (c) => c.endereco_coleta },
            { header: 'Motoboy', cell: (c) => c.motoboy?.nome_completo ?? '—' },
            { header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
            {
              header: 'Ações',
              cell: (c) =>
                c.status === 'SOLICITADO' ? (
                  <button className="text-[var(--color-danger)] hover:underline" onClick={() => setAlvo(c)}>
                    Excluir
                  </button>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={!!alvo}
        title="Excluir solicitação"
        message="Deseja realmente excluir esta solicitação de coleta?"
        confirmLabel="Excluir"
        danger
        onConfirm={confirmarExclusao}
        onCancel={() => setAlvo(null)}
      />
    </div>
  )
}
