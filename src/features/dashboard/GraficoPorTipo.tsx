import type { DashboardIndicadores } from './useDashboardQueries'

export function GraficoPorTipo({ dados }: { dados: DashboardIndicadores['por_tipo'] }) {
  const max = Math.max(1, ...dados.map((d) => d.total))

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Coletas por Tipo de Amostra</h2>
      {dados.length === 0 ? (
        <p className="text-sm text-slate-400">Sem coletas no período.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {dados.map((item) => (
            <div key={item.nome} className="flex items-center gap-2 text-sm">
              <span className="w-28 shrink-0 text-slate-600">{item.nome}</span>
              <div className="flex-1 bg-slate-100 rounded h-4 overflow-hidden">
                <div
                  className="bg-[var(--color-primary)] h-full"
                  style={{ width: `${(item.total / max) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-slate-500">{item.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
