import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function useUpdateConfiguracoesVisuais() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: async (input: { cor_primaria: string; cor_secundaria: string; cor_fundo: string; logo_url?: string }) => {
      const { error } = await supabase
        .from('configuracoes_visuais')
        .update({ ...input, atualizado_por: profile?.id })
        .eq('id', 1)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['configuracoes-visuais'] }),
  })
}

export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `logo-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  return data.publicUrl
}
