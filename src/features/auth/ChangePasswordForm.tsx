import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useToast } from '../../components/Toast'
import { supabase } from '../../lib/supabaseClient'

const schema = z
  .object({
    novaSenha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'],
  })

type FormValues = z.infer<typeof schema>

export function ChangePasswordForm() {
  const { notify } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const { error } = await supabase.auth.updateUser({ password: values.novaSenha })
    if (error) {
      notify(error.message, 'error')
      return
    }
    await supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        await supabase.from('profiles').update({ senha_temporaria: false }).eq('id', data.user.id)
      }
    })
    notify('Senha alterada com sucesso.')
    reset()
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">Alterar Senha</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nova senha"
          type="password"
          error={errors.novaSenha?.message}
          {...register('novaSenha')}
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          error={errors.confirmarSenha?.message}
          {...register('confirmarSenha')}
        />
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Salvando…' : 'Salvar'}
        </Button>
      </form>
    </div>
  )
}
