import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { Perfil } from '../../lib/constants'
import type { FuncionarioComPerfil } from '../../types/domain'

interface FuncionarioRow {
  id: string
  email: string
  perfil: Exclude<Perfil, 'CLIENTE'>
  criado_em: string
  profiles: { nome_completo: string; telefone: string | null; ativo: boolean } | null
}

function mapRow(row: FuncionarioRow): FuncionarioComPerfil {
  return {
    id: row.id,
    email: row.email,
    perfil: row.perfil,
    criado_por: null,
    criado_em: row.criado_em,
    nome_completo: row.profiles?.nome_completo ?? '',
    telefone: row.profiles?.telefone ?? null,
    ativo: row.profiles?.ativo ?? false,
  }
}

export function useFuncionarios() {
  return useQuery({
    queryKey: ['funcionarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, email, perfil, criado_em, profiles(nome_completo, telefone, ativo)')
        .order('criado_em', { ascending: false })
      if (error) throw error
      return (data as unknown as FuncionarioRow[]).map(mapRow)
    },
  })
}

interface CreateFuncionarioInput {
  nome_completo: string
  telefone?: string
  email: string
  senha: string
  perfil: Exclude<Perfil, 'CLIENTE'>
}

export function useCreateFuncionario() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (input: CreateFuncionarioInput) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: input,
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['funcionarios'] }),
  })
}

export function useUpdateFuncionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      nome_completo,
      telefone,
      perfil,
    }: {
      id: string
      nome_completo: string
      telefone?: string
      perfil: Exclude<Perfil, 'CLIENTE'>
    }) => {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nome_completo, telefone: telefone || null })
        .eq('id', id)
      if (profileError) throw profileError

      const { error: funcionarioError } = await supabase.from('funcionarios').update({ perfil }).eq('id', id)
      if (funcionarioError) throw funcionarioError
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['funcionarios'] }),
  })
}

export function useToggleFuncionarioAtivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from('profiles').update({ ativo }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['funcionarios'] }),
  })
}
