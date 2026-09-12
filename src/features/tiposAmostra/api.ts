import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import type { TipoAmostra } from '../../types/domain'

export function useTiposAmostra(somenteAtivos = false) {
  return useQuery({
    queryKey: ['tipos-amostra', somenteAtivos],
    queryFn: async () => {
      let query = supabase.from('tipos_amostra').select('*').order('nome')
      if (somenteAtivos) query = query.eq('ativo', true)
      const { data, error } = await query
      if (error) throw error
      return data as TipoAmostra[]
    },
  })
}

export function useCreateTipoAmostra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.from('tipos_amostra').insert({ nome })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tipos-amostra'] }),
  })
}

export function useToggleTipoAmostraAtivo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from('tipos_amostra').update({ ativo }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tipos-amostra'] }),
  })
}
