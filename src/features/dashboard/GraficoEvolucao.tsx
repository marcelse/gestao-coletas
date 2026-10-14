import { format, parseISO } from 'date-fns'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { COR_DANGER, COR_NEUTRA, COR_PRIMARIA, GraficoCard } from './GraficoCard'
import type { DashboardIndicadores } from './useDashboardQueries'

export function GraficoEvolucao({ dados }: { dados: DashboardIndicadores['evolucao_diaria'] }) {
  const vazio = dados.every((d) => d.coletadas + d.nao_coletadas + d.solicitadas === 0)
  return (
    <GraficoCard titulo="Evolução Diária" vazio={vazio}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={dados} margin={{ left: -16, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="dia" tickFormatter={(d: string) => format(parseISO(d), 'dd/MM')} minTickGap={24} />
          <YAxis allowDecimals={false} />
          <Tooltip labelFormatter={(d) => format(parseISO(String(d)), 'dd/MM/yyyy')} />
          <Legend />
          <Line type="monotone" dataKey="solicitadas" name="Solicitadas" stroke={COR_NEUTRA} dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="coletadas" name="Coletadas" stroke={COR_PRIMARIA} dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="nao_coletadas" name="Não coletadas" stroke={COR_DANGER} dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </GraficoCard>
  )
}
