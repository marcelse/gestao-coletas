import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { COR_PRIMARIA, GraficoCard } from './GraficoCard'
import type { DashboardIndicadores } from './useDashboardQueries'

export function GraficoPorTipo({ dados }: { dados: DashboardIndicadores['por_tipo'] }) {
  return (
    <GraficoCard titulo="Coletas por Tipo de Amostra" vazio={dados.length === 0}>
      <ResponsiveContainer width="100%" height={Math.max(180, dados.length * 40)}>
        <BarChart data={dados} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="nome" width={90} />
          <Tooltip />
          <Bar dataKey="total" name="Coletadas" fill={COR_PRIMARIA} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GraficoCard>
  )
}
