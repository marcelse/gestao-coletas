import { useState } from 'react'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { StatusBadge } from '../../components/StatusBadge'
import { Table } from '../../components/Table'
import { useToast } from '../../components/Toast'
import type { StatusColeta } from '../../lib/constants'
import type { ColetaDetalhada } from '../../types/domain'
import { useCancelarColeta, useColetasStaff } from './api'
import { AtribuirColetaModal } from './AtribuirColetaModal'
import { NovaColetaStaffModal } from './NovaColetaStaffModal'

const FILTROS: { label: string; value: StatusColeta | undefined }[] = [
  { label: 'Todas', value: undefined },
  { label: 'Solicitado', value: 'SOLICITADO' },
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Coletado', value: 'COLETADO' },
  { label: 'Não Coletado', value: 'NAO_COLETADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
]

export function ColetasListPage() {
  const [status, setStatus] = useState<StatusColeta | undefined>(undefined)
  const { data: coletas, isLoading } = useColetasStaff({ status })
  const cancelar = useCancelarColeta()
  const { notify } = useToast()

  const [coletaParaAtribuir, setColetaParaAtribuir] = useState<ColetaDetalhada | null>(null)
  const [coletaParaCancelar, setColetaParaCancelar] = useState<ColetaDetalhada | null>(null)
  const [modalNovaColeta, setModalNovaColeta] = useState(false)

  async function confirmarCancelamento() {
    if (!coletaParaCancelar) return
    try {
      await cancelar.mutateAsync(coletaParaCancelar.id)
      notify('Coleta cancelada.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao cancelar coleta.', 'error')
    } finally {
      setColetaParaCancelar(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Coletas</h1>
        <Button onClick={() => setModalNovaColeta(true)}>Nova Coleta</Button>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTROS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.value)}
            className={`px-3 py-1 rounded-full text-sm border ${
              status === f.value
                ? 'bg-[var(--color-primary)] text-white border-transparent'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-500">Carregando…</p>
      ) : (
        <Table
          rows={coletas ?? []}
          rowKey={(c) => c.id}
          columns={[
            { header: 'Cliente', cell: (c) => c.cliente?.nome_clinica ?? '—' },
            { header: 'Amostra', cell: (c) => c.tipo_amostra?.nome ?? '—' },
            { header: 'Endereço', cell: (c) => c.endereco_coleta },
            { header: 'Motoboy', cell: (c) => c.motoboy?.nome_completo ?? '—' },
            { header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
            { header: 'Motivo', cell: (c) => c.motivo_nao_coletado ?? '—' },
            {
              header: 'Ações',
              cell: (c) => (
                <div className="flex gap-2">
                  {(c.status === 'SOLICITADO' || c.status === 'NAO_COLETADO') && (
                    <button
                      className="text-[var(--color-primary)] hover:underline"
                      onClick={() => setColetaParaAtribuir(c)}
                    >
                      Atribuir
                    </button>
                  )}
                  {(c.status === 'SOLICITADO' || c.status === 'PENDENTE' || c.status === 'NAO_COLETADO') && (
                    <button
                      className="text-[var(--color-danger)] hover:underline"
                      onClick={() => setColetaParaCancelar(c)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}

      <NovaColetaStaffModal open={modalNovaColeta} onClose={() => setModalNovaColeta(false)} />
      <AtribuirColetaModal coleta={coletaParaAtribuir} onClose={() => setColetaParaAtribuir(null)} />
      <ConfirmDialog
        open={!!coletaParaCancelar}
        title="Cancelar coleta"
        message="Deseja realmente cancelar esta coleta? O histórico será mantido com status Cancelado."
        confirmLabel="Cancelar Coleta"
        danger
        onConfirm={confirmarCancelamento}
        onCancel={() => setColetaParaCancelar(null)}
      />
    </div>
  )
}
