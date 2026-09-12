import { useState } from 'react'
import { Button } from '../../components/Button'
import { useToast } from '../../components/Toast'
import { useTheme } from '../../theme/useTheme'
import { FiltrosPeriodo } from './FiltrosPeriodo'
import { GraficoPorMotoboy } from './GraficoPorMotoboy'
import { GraficoPorTipo } from './GraficoPorTipo'
import { IndicadoresCards } from './IndicadoresCards'
import type { PeriodoKey } from './periodos'
import { useColetasDetalhadasPeriodo, useDashboardIndicadores } from './useDashboardQueries'

export function DashboardPage() {
  const [periodo, setPeriodo] = useState<PeriodoKey>('mes_atual')
  const { data: indicadores, isLoading } = useDashboardIndicadores(periodo)
  const { refetch: refetchColetas, isFetching: exportando } = useColetasDetalhadasPeriodo(periodo)
  const { config } = useTheme()
  const { notify } = useToast()

  async function handleExportarPDF() {
    if (!indicadores) return
    try {
      const { data: coletas } = await refetchColetas()
      const { gerarRelatorioGerencialPDF } = await import('./pdf/RelatorioGerencialPDF')
      await gerarRelatorioGerencialPDF({ periodo, indicadores, coletas: coletas ?? [], config })
      notify('Relatório PDF gerado com sucesso.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao gerar relatório PDF.', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard Gerencial</h1>
        <Button onClick={handleExportarPDF} disabled={!indicadores || exportando}>
          {exportando ? 'Gerando…' : 'Exportar Relatório PDF'}
        </Button>
      </div>

      <FiltrosPeriodo value={periodo} onChange={setPeriodo} />

      {isLoading || !indicadores ? (
        <p className="text-slate-500">Carregando indicadores…</p>
      ) : (
        <>
          <IndicadoresCards indicadores={indicadores} />
          <div className="grid gap-4 lg:grid-cols-2">
            <GraficoPorTipo dados={indicadores.por_tipo} />
            <GraficoPorMotoboy dados={indicadores.por_motoboy_mes} />
          </div>
        </>
      )}
    </div>
  )
}
