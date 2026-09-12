import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { useToast } from '../../components/Toast'
import { useCreateFuncionario, useFuncionarios, useUpdateFuncionario } from './api'

const baseSchema = {
  nome_completo: z.string().min(1, 'Informe o nome completo.'),
  telefone: z.string().optional(),
  perfil: z.enum(['ADMINISTRADOR', 'COORDENACAO', 'MOTOBOY']),
}

const createSchema = z.object({
  ...baseSchema,
  email: z.string().email('Informe um e-mail válido.'),
  senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
})

const editSchema = z.object(baseSchema)

type FormValues = z.infer<typeof createSchema>

export function FuncionarioFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { notify } = useToast()
  const { data: funcionarios } = useFuncionarios()
  const create = useCreateFuncionario()
  const update = useUpdateFuncionario()

  const funcionario = funcionarios?.find((f) => f.id === id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as unknown as Resolver<FormValues>,
  })

  useEffect(() => {
    if (isEdit && funcionario) {
      reset({
        nome_completo: funcionario.nome_completo,
        telefone: funcionario.telefone ?? '',
        perfil: funcionario.perfil,
      })
    }
  }, [isEdit, funcionario, reset])

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && id) {
        await update.mutateAsync({
          id,
          nome_completo: values.nome_completo,
          telefone: values.telefone,
          perfil: values.perfil as 'ADMINISTRADOR' | 'COORDENACAO' | 'MOTOBOY',
        })
        notify('Funcionário atualizado com sucesso.')
      } else {
        await create.mutateAsync({
          nome_completo: values.nome_completo,
          telefone: values.telefone,
          email: values.email,
          senha: values.senha,
          perfil: values.perfil as 'ADMINISTRADOR' | 'COORDENACAO' | 'MOTOBOY',
        })
        notify('Funcionário criado com sucesso.')
      }
      navigate('/funcionarios')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao salvar funcionário.', 'error')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">
        {isEdit ? 'Editar Funcionário' : 'Novo Funcionário'}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Nome completo" error={errors.nome_completo?.message} {...register('nome_completo')} />
        <Input label="Telefone" error={errors.telefone?.message} {...register('telefone')} />
        <Select label="Perfil de acesso" error={errors.perfil?.message} defaultValue="" {...register('perfil')}>
          <option value="" disabled>
            Selecione…
          </option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="COORDENACAO">Coordenação</option>
          <option value="MOTOBOY">Motoboy</option>
        </Select>
        {!isEdit && (
          <>
            <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
            <Input
              label="Senha inicial"
              type="text"
              error={errors.senha?.message}
              {...register('senha')}
            />
          </>
        )}
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Salvando…' : 'Salvar'}
        </Button>
      </form>
    </div>
  )
}
