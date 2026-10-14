import type { ReactNode } from 'react'

export const COR_DANGER = '#dc2626'
export const COR_NEUTRA = '#94a3b8'
export const COR_PRIMARIA = 'var(--color-primary)'

export function GraficoCard({
  titulo,
  vazio,
  children,
  className = '',
}: {
  titulo: string
  vazio: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-4 ${className}`}>
      <h2 className="text-sm font-semibold text-slate-700 mb-3">{titulo}</h2>
      {vazio ? <p className="text-sm text-slate-400 py-8 text-center">Sem dados no período.</p> : children}
    </div>
  )
}
