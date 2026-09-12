import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { useToast } from '../../components/Toast'
import { supabase } from '../../lib/supabaseClient'
import { useTiposAmostra } from '../tiposAmostra/api'
import { useCreateColeta } from './api'
import { useQuery } from '@tanstack/react-query'

const schema = z.object({
  tipo_amostra_id: z.string().min(1, 'Selecione o tipo de amostra.'),
  endereco_coleta: z.string().min(1, 'Informe o endereço.'),
  observacoes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function NovaColetaFormPage() {
  const { profile } = useAuth()
  const { data: tipos } = useTiposAmostra(true)
  const create = useCreateColeta()
  const { notify } = useToast()
  const navigate = useNavigate()

  const { data: cliente } = useQuery({
    queryKey: ['cliente-proprio', profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from('clientes').select('endereco').eq('id', profile!.id).single()
      return data
    },
    enabled: !!profile,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (cliente) reset({ endereco_coleta: cliente.endereco })
  }, [cliente, reset])

  async function onSubmit(values: FormValues) {
    try {
      await create.mutateAsync(values)
      notify('Solicitação de coleta criada com sucesso.')
      navigate('/minhas-coletas')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao criar solicitação.', 'error')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">Nova Solicitação de Coleta</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select label="Tipo de amostra" error={errors.tipo_amostra_id?.message} defaultValue="" {...register('tipo_amostra_id')}>
          <option value="" disabled>
            Selecione…
          </option>
          {tipos?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
        <Input
          label="Endereço da coleta"
          error={errors.endereco_coleta?.message}
          {...register('endereco_coleta')}
        />
        <Input label="Observações" error={errors.observacoes?.message} {...register('observacoes')} />
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Enviando…' : 'Solicitar Coleta'}
        </Button>
      </form>
    </div>
  )
}
