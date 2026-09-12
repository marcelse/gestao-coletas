import { PERIODO_LABEL, type PeriodoKey } from './periodos'

const OPCOES: PeriodoKey[] = ['mes_anterior', 'mes_atual', 'ultimos_3_meses', 'ultimos_6_meses']

export function FiltrosPeriodo({
  value,
  onChange,
}: {
  value: PeriodoKey
  onChange: (periodo: PeriodoKey) => void
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPCOES.map((opcao) => (
        <button
          key={opcao}
          onClick={() => onChange(opcao)}
          className={`px-3 py-1 rounded-full text-sm border ${
            value === opcao
              ? 'bg-[var(--color-primary)] text-white border-transparent'
              : 'border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {PERIODO_LABEL[opcao]}
        </button>
      ))}
    </div>
  )
}
