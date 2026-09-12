import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { useToast } from '../../components/Toast'
import { useColetasMotoboy, useMarcarColetado } from './api'

export function ColetasMotoboyPage() {
  const { data: coletas, isLoading } = useColetasMotoboy('PENDENTE')
  const marcarColetado = useMarcarColetado()
  const { notify } = useToast()

  async function handleMarcar(id: string) {
    try {
      await marcarColetado.mutateAsync(id)
      notify('Coleta marcada como coletada.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao marcar coleta.', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Minhas Entregas</h1>
        <Link to="/minhas-entregas/historico" className="text-sm text-[var(--color-primary)] hover:underline">
          Ver histórico
        </Link>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Carregando…</p>
      ) : coletas?.length === 0 ? (
        <p className="text-slate-500">Nenhuma coleta pendente no momento.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {coletas?.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-2">
              <span className="font-medium text-slate-800">{c.tipo_amostra?.nome}</span>
              <span className="text-sm text-slate-600">{c.cliente?.nome_clinica}</span>
              <span className="text-sm text-slate-500">{c.endereco_coleta}</span>
              {c.observacoes && <span className="text-xs text-slate-400">Obs: {c.observacoes}</span>}
              <Button className="mt-2 self-start" onClick={() => handleMarcar(c.id)}>
                Marcar como coletado
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
