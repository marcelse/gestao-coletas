import {
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from 'date-fns'

export type PeriodoKey = 'mes_anterior' | 'mes_atual' | 'ultimos_3_meses' | 'ultimos_6_meses'

export const PERIODO_LABEL: Record<PeriodoKey, string> = {
  mes_anterior: 'Mês Anterior',
  mes_atual: 'Mês Atual',
  ultimos_3_meses: 'Últimos 3 Meses',
  ultimos_6_meses: 'Últimos 6 Meses',
}

export function periodoParaDatas(periodo: PeriodoKey): { inicio: string; fim: string } {
  const hoje = new Date()
  switch (periodo) {
    case 'mes_anterior': {
      const mesAnterior = subMonths(hoje, 1)
      return { inicio: fmt(startOfMonth(mesAnterior)), fim: fmt(endOfMonth(mesAnterior)) }
    }
    case 'mes_atual':
      return { inicio: fmt(startOfMonth(hoje)), fim: fmt(endOfMonth(hoje)) }
    case 'ultimos_3_meses':
      return { inicio: fmt(startOfMonth(subMonths(hoje, 2))), fim: fmt(endOfMonth(hoje)) }
    case 'ultimos_6_meses':
      return { inicio: fmt(startOfMonth(subMonths(hoje, 5))), fim: fmt(endOfMonth(hoje)) }
  }
}

function fmt(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
