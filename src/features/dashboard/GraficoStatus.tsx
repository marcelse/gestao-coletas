import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { STATUS_LABEL, type StatusColeta } from '../../lib/constants'
import { GraficoCard } from './GraficoCard'
import type { DashboardIndicadores } from './useDashboardQueries'

const CORES: Record<string, string> = {
  SOLICITADO: '#3b82f6',
  PENDENTE: '#f59e0b',
  COLETADO: '#0f766e',
  NAO_COLETADO: '#dc2626',
  CANCELADO: '#94a3b8',
}

export function GraficoStatus({ dados }: { dados: DashboardIndicadores['por_status'] }) {
  const itens = dados.map((d) => ({
    ...d,
    nome: STATUS_LABEL[d.status as StatusColeta] ?? d.status,
  }))
  return (
    <GraficoCard titulo="Coletas Solicitadas no Período, por Status" vazio={itens.length === 0}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={itens} dataKey="total" nameKey="nome" innerRadius={55} outerRadius={90} label={(e) => String(e.value)}>
            {itens.map((i) => (
              <Cell key={i.status} fill={CORES[i.status] ?? '#64748b'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </GraficoCard>
  )
}
