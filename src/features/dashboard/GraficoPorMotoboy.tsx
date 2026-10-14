import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { COR_DANGER, COR_PRIMARIA, GraficoCard } from './GraficoCard'
import type { DashboardIndicadores } from './useDashboardQueries'

export function GraficoPorMotoboy({ dados }: { dados: DashboardIndicadores['por_motoboy'] }) {
  return (
    <GraficoCard titulo="Coletadas x Não Coletadas por Motoboy" vazio={dados.length === 0}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={dados} margin={{ left: -16, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="nome_completo" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="coletadas" name="Coletadas" fill={COR_PRIMARIA} radius={[4, 4, 0, 0]} />
          <Bar dataKey="nao_coletadas" name="Não coletadas" fill={COR_DANGER} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GraficoCard>
  )
}
