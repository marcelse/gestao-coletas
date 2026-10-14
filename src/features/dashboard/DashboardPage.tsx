import { useState } from 'react'
import { Button } from '../../components/Button'
import { useToast } from '../../components/Toast'
import { useTheme } from '../../theme/useTheme'
import { FiltrosPeriodo } from './FiltrosPeriodo'
import { GraficoEvolucao } from './GraficoEvolucao'
import { GraficoMotivos } from './GraficoMotivos'
import { GraficoPorMotoboy } from './GraficoPorMotoboy'
import { GraficoPorTipo } from './GraficoPorTipo'
import { GraficoStatus } from './GraficoStatus'
import { IndicadoresCards } from './IndicadoresCards'
import type { PeriodoKey } from './periodos'
import { useColetasDetalhadasPeriodo, useDashboardIndicadores } from './useDashboardQueries'

export function DashboardPage() {
  const [periodo, setPeriodo] = useState<PeriodoKey>('mes_atual')
  const [exportando, setExportando] = useState(false)
  const { data: indicadores, isLoading } = useDashboardIndicadores(periodo)
  const { refetch: refetchColetas } = useColetasDetalhadasPeriodo(periodo)
  const { config } = useTheme()
  const { notify } = useToast()

  async function handleExportarPDF() {
    if (!indicadores) return
    setExportando(true)
    try {
      const { data: coletas } = await refetchColetas()
      const { gerarRelatorioGerencialPDF } = await import('./pdf/RelatorioGerencialPDF')
      await gerarRelatorioGerencialPDF({ periodo, indicadores, coletas: coletas ?? [], config })
      notify('Relatório PDF gerado com sucesso.')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao gerar relatório PDF.', 'error')
    } finally {
      setExportando(false)
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
          <GraficoEvolucao dados={indicadores.evolucao_diaria} />
          <div className="grid gap-4 lg:grid-cols-2">
            <GraficoStatus dados={indicadores.por_status} />
            <GraficoPorMotoboy dados={indicadores.por_motoboy} />
            <GraficoPorTipo dados={indicadores.por_tipo} />
            <GraficoMotivos dados={indicadores.motivos_nao_coleta} />
          </div>
        </>
      )}
    </div>
  )
}
