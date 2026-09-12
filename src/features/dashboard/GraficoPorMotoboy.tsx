import { Table } from '../../components/Table'
import type { DashboardIndicadores } from './useDashboardQueries'

export function GraficoPorMotoboy({ dados }: { dados: DashboardIndicadores['por_motoboy_mes'] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Coletas por Motoboy / Mês</h2>
      <Table
        rows={dados}
        rowKey={(d) => `${d.nome_completo}-${d.mes}`}
        emptyMessage="Sem coletas no período."
        columns={[
          { header: 'Motoboy', cell: (d) => d.nome_completo },
          { header: 'Mês', cell: (d) => d.mes },
          { header: 'Total', cell: (d) => d.total },
        ]}
      />
    </div>
  )
}
