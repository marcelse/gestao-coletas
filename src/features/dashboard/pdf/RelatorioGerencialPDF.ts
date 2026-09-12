import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { ConfiguracoesVisuais } from '../../../types/domain'
import { PERIODO_LABEL, type PeriodoKey } from '../periodos'
import type { ColetaRelatorioRow, DashboardIndicadores } from '../useDashboardQueries'
import { STATUS_LABEL, type StatusColeta } from '../../../lib/constants'

export async function gerarRelatorioGerencialPDF({
  periodo,
  indicadores,
  coletas,
  config,
}: {
  periodo: PeriodoKey
  indicadores: DashboardIndicadores
  coletas: ColetaRelatorioRow[]
  config: ConfiguracoesVisuais | null
}) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let cursorY = 15

  if (config?.logo_url) {
    try {
      const dataUrl = await imageUrlToDataUrl(config.logo_url)
      doc.addImage(dataUrl, 'PNG', 14, cursorY - 8, 24, 24, undefined, 'FAST')
    } catch {
      // segue sem logo se não conseguir carregar (ex.: CORS)
    }
  }

  doc.setFontSize(16)
  doc.text('Relatório Gerencial de Coletas', pageWidth / 2, cursorY, { align: 'center' })
  cursorY += 7
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Período: ${PERIODO_LABEL[periodo]}`, pageWidth / 2, cursorY, { align: 'center' })
  cursorY += 5
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, cursorY, { align: 'center' })
  cursorY += 10
  doc.setTextColor(0)

  autoTable(doc, {
    startY: cursorY,
    head: [['Indicador', 'Valor']],
    body: [
      ['Amostras a coletar', String(indicadores.a_coletar)],
      ['Coletadas no período', String(indicadores.coletadas_periodo)],
      ['Coletadas hoje', String(indicadores.coletadas_hoje)],
      ['Coletadas no mês', String(indicadores.coletadas_mes)],
    ],
    theme: 'grid',
    styles: { fontSize: 9 },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursorY = (doc as any).lastAutoTable.finalY + 8

  autoTable(doc, {
    startY: cursorY,
    head: [['Tipo de Amostra', 'Total Coletado']],
    body: indicadores.por_tipo.map((t) => [t.nome, String(t.total)]),
    theme: 'grid',
    styles: { fontSize: 9 },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursorY = (doc as any).lastAutoTable.finalY + 8

  autoTable(doc, {
    startY: cursorY,
    head: [['Motoboy', 'Mês', 'Total Coletado']],
    body: indicadores.por_motoboy_mes.map((m) => [m.nome_completo, m.mes, String(m.total)]),
    theme: 'grid',
    styles: { fontSize: 9 },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursorY = (doc as any).lastAutoTable.finalY + 8

  autoTable(doc, {
    startY: cursorY,
    head: [['Cliente', 'Amostra', 'Endereço', 'Motoboy', 'Status', 'Criado em', 'Coletado em']],
    body: coletas.map((c) => [
      c.cliente?.nome_clinica ?? '—',
      c.tipo_amostra?.nome ?? '—',
      c.endereco_coleta,
      c.motoboy?.profiles?.nome_completo ?? '—',
      STATUS_LABEL[c.status as StatusColeta] ?? c.status,
      new Date(c.criado_em).toLocaleDateString('pt-BR'),
      c.coletado_em ? new Date(c.coletado_em).toLocaleDateString('pt-BR') : '—',
    ]),
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 118, 110] },
    didDrawPage: (data) => {
      const pageCount = doc.internal.pages.length - 1
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'right' },
      )
    },
  })

  doc.save(`relatorio-gerencial-${periodo}.pdf`)
}

async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
