import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { COR_DANGER, GraficoCard } from './GraficoCard'
import type { DashboardIndicadores } from './useDashboardQueries'

export function GraficoMotivos({ dados }: { dados: DashboardIndicadores['motivos_nao_coleta'] }) {
  return (
    <GraficoCard titulo="Principais Motivos de Não Coleta" vazio={dados.length === 0}>
      <ResponsiveContainer width="100%" height={Math.max(180, dados.length * 44)}>
        <BarChart data={dados} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="motivo"
            width={150}
            tickFormatter={(m: string) => (m.length > 22 ? `${m.slice(0, 21)}…` : m)}
          />
          <Tooltip />
          <Bar dataKey="total" name="Ocorrências" fill={COR_DANGER} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GraficoCard>
  )
}
