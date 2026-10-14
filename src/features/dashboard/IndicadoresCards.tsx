import type { DashboardIndicadores } from './useDashboardQueries'

type Tom = 'primary' | 'danger'

export function IndicadoresCards({ indicadores }: { indicadores: DashboardIndicadores }) {
  const taxa = indicadores.taxa_sucesso_periodo
  const cards: { label: string; value: string | number; tom: Tom }[] = [
    { label: 'Amostras a Coletar', value: indicadores.a_coletar, tom: 'primary' },
    { label: 'Coletadas no Período', value: indicadores.coletadas_periodo, tom: 'primary' },
    { label: 'Coletadas Hoje', value: indicadores.coletadas_hoje, tom: 'primary' },
    { label: 'Coletadas no Mês', value: indicadores.coletadas_mes, tom: 'primary' },
    { label: 'Não Coletadas no Período', value: indicadores.nao_coletadas_periodo, tom: 'danger' },
    { label: 'Não Coletadas Hoje', value: indicadores.nao_coletadas_hoje, tom: 'danger' },
    { label: 'Não Coletadas no Mês', value: indicadores.nao_coletadas_mes, tom: 'danger' },
    { label: 'Taxa de Sucesso no Período', value: taxa === null ? '—' : `${taxa}%`, tom: 'primary' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white border rounded-lg p-4 ${card.tom === 'danger' ? 'border-red-200' : 'border-slate-200'}`}
        >
          <div
            className={`text-2xl font-semibold ${
              card.tom === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-primary)]'
            }`}
          >
            {card.value}
          </div>
          <div className="text-xs text-slate-500 mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
