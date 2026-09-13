import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { useToast } from '../../components/Toast'
import { PERFIL_LABEL, PERFIS } from '../../lib/constants'
import { useCreateCliente } from '../clientes/api'
import { useCreateFuncionario } from '../funcionarios/api'

const schema = z
  .object({
    perfil: z.enum(PERFIS),
    nome: z.string().min(1, 'Informe o nome.'),
    endereco: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email('Informe um e-mail válido.'),
    senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
  })
  .refine((data) => data.perfil !== 'CLIENTE' || !!data.endereco?.trim(), {
    message: 'Informe o endereço.',
    path: ['endereco'],
  })

type FormValues = z.infer<typeof schema>

export function UsuarioFormPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const createFuncionario = useCreateFuncionario()
  const createCliente = useCreateCliente()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { perfil: undefined } })

  const perfilSelecionado = watch('perfil')
  const isCliente = perfilSelecionado === 'CLIENTE'

  async function onSubmit(values: FormValues) {
    try {
      if (values.perfil === 'CLIENTE') {
        await createCliente.mutateAsync({
          nome_clinica: values.nome,
          endereco: values.endereco!,
          telefone: values.telefone,
          email: values.email,
          senha: values.senha,
        })
      } else {
        await createFuncionario.mutateAsync({
          nome_completo: values.nome,
          telefone: values.telefone,
          email: values.email,
          senha: values.senha,
          perfil: values.perfil,
        })
      }
      notify('Usuário criado com sucesso.')
      navigate('/usuarios')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao criar usuário.', 'error')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">Novo Usuário</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select label="Perfil de acesso" error={errors.perfil?.message} defaultValue="" {...register('perfil')}>
          <option value="" disabled>
            Selecione…
          </option>
          {PERFIS.map((perfil) => (
            <option key={perfil} value={perfil}>
              {PERFIL_LABEL[perfil]}
            </option>
          ))}
        </Select>

        <Input
          label={isCliente ? 'Nome da clínica' : 'Nome completo'}
          error={errors.nome?.message}
          {...register('nome')}
        />

        {isCliente && (
          <Input label="Endereço" error={errors.endereco?.message} {...register('endereco')} />
        )}

        <Input label="Telefone" error={errors.telefone?.message} {...register('telefone')} />
        <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Senha inicial" type="text" error={errors.senha?.message} {...register('senha')} />

        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Salvando…' : 'Salvar'}
        </Button>
      </form>
    </div>
  )
}
