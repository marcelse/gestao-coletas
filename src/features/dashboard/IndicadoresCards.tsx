import type { DashboardIndicadores } from './useDashboardQueries'

export function IndicadoresCards({ indicadores }: { indicadores: DashboardIndicadores }) {
  const cards = [
    { label: 'Amostras a Coletar', value: indicadores.a_coletar },
    { label: 'Coletadas no Período', value: indicadores.coletadas_periodo },
    { label: 'Coletadas Hoje', value: indicadores.coletadas_hoje },
    { label: 'Coletadas no Mês', value: indicadores.coletadas_mes },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-2xl font-semibold text-[var(--color-primary)]">{card.value}</div>
          <div className="text-xs text-slate-500 mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
