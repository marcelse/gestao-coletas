import { STATUS_LABEL, type StatusColeta } from '../lib/constants'

const STATUS_CLASSES: Record<StatusColeta, string> = {
  SOLICITADO: 'bg-amber-100 text-amber-800',
  PENDENTE: 'bg-blue-100 text-blue-800',
  COLETADO: 'bg-emerald-100 text-emerald-800',
  NAO_COLETADO: 'bg-red-100 text-red-800',
  CANCELADO: 'bg-slate-200 text-slate-600',
}

export function StatusBadge({ status }: { status: StatusColeta }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
