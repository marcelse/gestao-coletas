import { StatusBadge } from '../../components/StatusBadge'
import { Table } from '../../components/Table'
import { useColetasMotoboy } from './api'

export function ColetasMotoboyHistoricoPage() {
  const { data: coletas, isLoading } = useColetasMotoboy('COLETADO')

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-4">Histórico de Entregas</h1>
      {isLoading ? (
        <p className="text-slate-500">Carregando…</p>
      ) : (
        <Table
          rows={coletas ?? []}
          rowKey={(c) => c.id}
          columns={[
            { header: 'Amostra', cell: (c) => c.tipo_amostra?.nome ?? '—' },
            { header: 'Cliente', cell: (c) => c.cliente?.nome_clinica ?? '—' },
            { header: 'Endereço', cell: (c) => c.endereco_coleta },
            {
              header: 'Coletado em',
              cell: (c) => (c.coletado_em ? new Date(c.coletado_em).toLocaleString('pt-BR') : '—'),
            },
            { header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
          ]}
        />
      )}
    </div>
  )
}
