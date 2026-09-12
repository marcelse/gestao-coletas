import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useToast } from '../../components/Toast'
import { supabase } from '../../lib/supabaseClient'

const schema = z.object({
  nome_completo: z.string().min(1, 'Informe o nome completo.'),
  telefone: z.string().optional(),
  nome_clinica: z.string().optional(),
  endereco: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function EditProfileForm() {
  const { profile, refreshProfile } = useAuth()
  const { notify } = useToast()
  const isCliente = profile?.perfil === 'CLIENTE'

  const { data: cliente } = useQuery({
    queryKey: ['cliente-proprio', profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from('clientes').select('*').eq('id', profile!.id).single()
      return data
    },
    enabled: !!profile && isCliente,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!profile) return
    reset({
      nome_completo: profile.nome_completo,
      telefone: profile.telefone ?? '',
      nome_clinica: cliente?.nome_clinica ?? '',
      endereco: cliente?.endereco ?? '',
    })
  }, [profile, cliente, reset])

  async function onSubmit(values: FormValues) {
    if (!profile) return
    const nomeParaPerfil = isCliente ? values.nome_clinica || '' : values.nome_completo

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ nome_completo: nomeParaPerfil, telefone: values.telefone || null })
      .eq('id', profile.id)

    if (profileError) {
      notify(profileError.message, 'error')
      return
    }

    if (isCliente) {
      const { error: clienteError } = await supabase
        .from('clientes')
        .update({
          nome_clinica: values.nome_clinica,
          endereco: values.endereco,
          telefone: values.telefone || null,
        })
        .eq('id', profile.id)
      if (clienteError) {
        notify(clienteError.message, 'error')
        return
      }
    }

    await refreshProfile()
    notify('Dados atualizados com sucesso.')
  }

  if (!profile) return null

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">Alterar Dados</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {isCliente ? (
          <>
            <Input label="Nome da clínica" error={errors.nome_clinica?.message} {...register('nome_clinica')} />
            <Input label="Endereço" error={errors.endereco?.message} {...register('endereco')} />
          </>
        ) : (
          <Input label="Nome completo" error={errors.nome_completo?.message} {...register('nome_completo')} />
        )}
        <Input label="Telefone" error={errors.telefone?.message} {...register('telefone')} />
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Salvando…' : 'Salvar'}
        </Button>
      </form>
    </div>
  )
}
