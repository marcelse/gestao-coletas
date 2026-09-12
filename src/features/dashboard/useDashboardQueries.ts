import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { periodoParaDatas, type PeriodoKey } from './periodos'

export interface DashboardIndicadores {
  a_coletar: number
  coletadas_periodo: number
  coletadas_hoje: number
  coletadas_mes: number
  por_tipo: { nome: string; total: number }[]
  por_motoboy_mes: { nome_completo: string; mes: string; total: number }[]
}

export function useDashboardIndicadores(periodo: PeriodoKey) {
  const { inicio, fim } = periodoParaDatas(periodo)

  return useQuery({
    queryKey: ['dashboard-indicadores', periodo],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('dashboard_indicadores', {
        data_inicio: inicio,
        data_fim: fim,
      })
      if (error) throw error
      return data as unknown as DashboardIndicadores
    },
  })
}

export interface ColetaRelatorioRow {
  status: string
  criado_em: string
  coletado_em: string | null
  endereco_coleta: string
  cliente: { nome_clinica: string } | null
  tipo_amostra: { nome: string } | null
  motoboy: { profiles: { nome_completo: string } | null } | null
}

export function useColetasDetalhadasPeriodo(periodo: PeriodoKey) {
  const { inicio, fim } = periodoParaDatas(periodo)

  return useQuery({
    queryKey: ['coletas-relatorio', periodo],
    enabled: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coletas')
        .select(
          'status, criado_em, coletado_em, endereco_coleta, ' +
            'cliente:clientes(nome_clinica), tipo_amostra:tipos_amostra(nome), motoboy:funcionarios(profiles!funcionarios_id_fkey(nome_completo))',
        )
        .gte('criado_em', inicio)
        .lte('criado_em', `${fim} 23:59:59`)
        .order('criado_em', { ascending: false })
      if (error) throw error
      return data as unknown as ColetaRelatorioRow[]
    },
  })
}
