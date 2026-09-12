import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useToast } from '../../components/Toast'
import { useClientes, useCreateCliente, useUpdateCliente } from './api'

const baseSchema = {
  nome_clinica: z.string().min(1, 'Informe o nome da clínica.'),
  endereco: z.string().min(1, 'Informe o endereço.'),
  telefone: z.string().optional(),
}

const createSchema = z.object({
  ...baseSchema,
  email: z.string().email('Informe um e-mail válido.'),
  senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
})

const editSchema = z.object(baseSchema)

type FormValues = z.infer<typeof createSchema>

export function ClienteFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { notify } = useToast()
  const { data: clientes } = useClientes()
  const create = useCreateCliente()
  const update = useUpdateCliente()

  const cliente = clientes?.find((c) => c.id === id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as unknown as Resolver<FormValues>,
  })

  useEffect(() => {
    if (isEdit && cliente) {
      reset({
        nome_clinica: cliente.nome_clinica,
        endereco: cliente.endereco,
        telefone: cliente.telefone ?? '',
      })
    }
  }, [isEdit, cliente, reset])

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({
          id,
          nome_clinica: values.nome_clinica,
          endereco: values.endereco,
          telefone: values.telefone,
        })
        notify('Cliente atualizado com sucesso.')
      } else {
        await create.mutateAsync({
          nome_clinica: values.nome_clinica,
          endereco: values.endereco,
          telefone: values.telefone,
          email: values.email,
          senha: values.senha,
        })
        notify('Cliente criado com sucesso.')
      }
      navigate('/clientes')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao salvar cliente.', 'error')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Nome da clínica" error={errors.nome_clinica?.message} {...register('nome_clinica')} />
        <Input label="Endereço" error={errors.endereco?.message} {...register('endereco')} />
        <Input label="Telefone" error={errors.telefone?.message} {...register('telefone')} />
        {!isEdit && (
          <>
            <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Senha inicial" type="text" error={errors.senha?.message} {...register('senha')} />
          </>
        )}
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Salvando…' : 'Salvar'}
        </Button>
      </form>
    </div>
  )
}
