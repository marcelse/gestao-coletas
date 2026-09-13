import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import type { Perfil } from '../../lib/constants'
import { useClientes } from '../clientes/api'
import { useFuncionarios } from '../funcionarios/api'

export interface Usuario {
  id: string
  nome: string
  email: string
  telefone: string | null
  perfil: Perfil
  ativo: boolean
}

export function useUsuarios() {
  const funcionarios = useFuncionarios()
  const clientes = useClientes()

  const usuarios: Usuario[] = [
    ...(funcionarios.data ?? []).map((f) => ({
      id: f.id,
      nome: f.nome_completo,
      email: f.email,
      telefone: f.telefone,
      perfil: f.perfil,
      ativo: f.ativo,
    })),
    ...(clientes.data ?? []).map((c) => ({
      id: c.id,
      nome: c.nome_clinica,
      email: c.email,
      telefone: c.telefone,
      perfil: 'CLIENTE' as const,
      ativo: c.ativo,
    })),
  ].sort((a, b) => a.nome.localeCompare(b.nome))

  return {
    data: usuarios,
    isLoading: funcionarios.isLoading || clientes.isLoading,
    error: funcionarios.error ?? clientes.error,
  }
}

export function useToggleUsuarioAtivo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from('profiles').update({ ativo }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] })
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })
}
