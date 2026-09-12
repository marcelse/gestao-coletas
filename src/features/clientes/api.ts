import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { ClienteComPerfil } from '../../types/domain'

interface ClienteRow {
  id: string
  nome_clinica: string
  endereco: string
  telefone: string | null
  email: string
  criado_em: string
  profiles: { nome_completo: string; ativo: boolean } | null
}

function mapRow(row: ClienteRow): ClienteComPerfil {
  return {
    id: row.id,
    nome_clinica: row.nome_clinica,
    endereco: row.endereco,
    telefone: row.telefone,
    email: row.email,
    criado_por: null,
    criado_em: row.criado_em,
    nome_completo: row.profiles?.nome_completo ?? '',
    ativo: row.profiles?.ativo ?? false,
  }
}

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_clinica, endereco, telefone, email, criado_em, profiles!clientes_id_fkey(nome_completo, ativo)')
        .order('criado_em', { ascending: false })
      if (error) throw error
      return (data as unknown as ClienteRow[]).map(mapRow)
    },
  })
}

interface CreateClienteInput {
  nome_clinica: string
  endereco: string
  telefone?: string
  email: string
  senha: string
}

export function useCreateCliente() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: async (input: CreateClienteInput) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { ...input, nome_completo: input.nome_clinica, perfil: 'CLIENTE' },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  })
}

export function useUpdateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      nome_clinica,
      endereco,
      telefone,
    }: {
      id: string
      nome_clinica: string
      endereco: string
      telefone?: string
    }) => {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nome_completo: nome_clinica })
        .eq('id', id)
      if (profileError) throw profileError

      const { error: clienteError } = await supabase
        .from('clientes')
        .update({ nome_clinica, endereco, telefone: telefone || null })
        .eq('id', id)
      if (clienteError) throw clienteError
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  })
}

export function useToggleClienteAtivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from('profiles').update({ ativo }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  })
}
