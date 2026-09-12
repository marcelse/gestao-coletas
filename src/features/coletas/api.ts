import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { StatusColeta } from '../../lib/constants'
import type { ColetaDetalhada } from '../../types/domain'

const SELECT_DETALHADA =
  'id, cliente_id, tipo_amostra_id, endereco_coleta, observacoes, status, origem, motoboy_id, ' +
  'criado_por, atribuido_por, atribuido_em, coletado_em, criado_em, atualizado_em, ' +
  'cliente:clientes(id, nome_clinica, profiles(nome_completo)), ' +
  'tipo_amostra:tipos_amostra(id, nome), ' +
  'motoboy:funcionarios(id, profiles(nome_completo))'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): ColetaDetalhada {
  return {
    ...row,
    cliente: row.cliente
      ? { id: row.cliente.id, nome_clinica: row.cliente.nome_clinica, nome_completo: row.cliente.profiles?.nome_completo ?? '' }
      : null,
    tipo_amostra: row.tipo_amostra ?? null,
    motoboy: row.motoboy
      ? { id: row.motoboy.id, nome_completo: row.motoboy.profiles?.nome_completo ?? '' }
      : null,
  }
}

export function useColetasStaff(filtros?: { status?: StatusColeta }) {
  return useQuery({
    queryKey: ['coletas', 'staff', filtros],
    queryFn: async () => {
      let query = supabase.from('coletas').select(SELECT_DETALHADA).order('criado_em', { ascending: false })
      if (filtros?.status) query = query.eq('status', filtros.status)
      const { data, error } = await query
      if (error) throw error
      return data.map(mapRow)
    },
  })
}

export function useMinhasColetas() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['coletas', 'cliente', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coletas')
        .select(SELECT_DETALHADA)
        .eq('cliente_id', profile!.id)
        .order('criado_em', { ascending: false })
      if (error) throw error
      return data.map(mapRow)
    },
  })
}

export function useColetasMotoboy(status: 'PENDENTE' | 'COLETADO') {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['coletas', 'motoboy', profile?.id, status],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coletas')
        .select(SELECT_DETALHADA)
        .eq('motoboy_id', profile!.id)
        .eq('status', status)
        .order('criado_em', { ascending: true })
      if (error) throw error
      return data.map(mapRow)
    },
  })
}

function invalidateColetas(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['coletas'] })
}

export function useCreateColeta() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: async (input: { tipo_amostra_id: string; endereco_coleta: string; observacoes?: string }) => {
      if (!profile) throw new Error('Não autenticado.')
      const { error } = await supabase.from('coletas').insert({
        cliente_id: profile.id,
        tipo_amostra_id: input.tipo_amostra_id,
        endereco_coleta: input.endereco_coleta,
        observacoes: input.observacoes || null,
        criado_por: profile.id,
        status: 'SOLICITADO',
      })
      if (error) throw error
    },
    onSuccess: () => invalidateColetas(queryClient),
  })
}

export function useCreateColetaStaff() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: async (input: {
      cliente_id: string
      tipo_amostra_id: string
      endereco_coleta: string
      observacoes?: string
    }) => {
      if (!profile) throw new Error('Não autenticado.')
      const { error } = await supabase.from('coletas').insert({
        cliente_id: input.cliente_id,
        tipo_amostra_id: input.tipo_amostra_id,
        endereco_coleta: input.endereco_coleta,
        observacoes: input.observacoes || null,
        criado_por: profile.id,
        status: 'SOLICITADO',
      })
      if (error) throw error
    },
    onSuccess: () => invalidateColetas(queryClient),
  })
}

export function useDeleteColeta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coletas').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateColetas(queryClient),
  })
}

export function useAtribuirMotoboy() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: async ({ id, motoboy_id }: { id: string; motoboy_id: string }) => {
      const { error } = await supabase
        .from('coletas')
        .update({
          motoboy_id,
          status: 'PENDENTE',
          atribuido_por: profile?.id,
          atribuido_em: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateColetas(queryClient),
  })
}

export function useMarcarColetado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coletas')
        .update({ status: 'COLETADO', coletado_em: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateColetas(queryClient),
  })
}

export function useCancelarColeta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coletas').update({ status: 'CANCELADO' }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateColetas(queryClient),
  })
}

export function useMotoboysAtivos() {
  return useQuery({
    queryKey: ['funcionarios', 'motoboys-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, profiles!inner(nome_completo, ativo)')
        .eq('perfil', 'MOTOBOY')
        .eq('profiles.ativo', true)
      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[]).map((f) => ({ id: f.id, nome_completo: f.profiles.nome_completo as string }))
    },
  })
}

export function useClientesAtivos() {
  return useQuery({
    queryKey: ['clientes', 'ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_clinica, endereco, profiles!inner(ativo)')
        .eq('profiles.ativo', true)
      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[]).map((c) => ({ id: c.id, nome_clinica: c.nome_clinica, endereco: c.endereco }))
    },
  })
}
