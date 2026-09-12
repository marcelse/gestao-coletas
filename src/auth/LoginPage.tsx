import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { homeRouteFor } from '../lib/roleRoutes'
import { useTheme } from '../theme/useTheme'
import { useAuth } from './useAuth'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { session, profile, signIn } = useAuth()
  const { config } = useTheme()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (session && profile) {
    return <Navigate to={homeRouteFor(profile.perfil)} replace />
  }

  const motivo = searchParams.get('motivo')

  async function onSubmit(values: FormValues) {
    setFormError(null)
    const { error } = await signIn(values.email, values.password)
    if (error) setFormError('E-mail ou senha inválidos.')
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center mb-6">
          {config?.logo_url ? (
            <img src={config.logo_url} alt="Logomarca" className="h-14 object-contain mb-2" />
          ) : (
            <span className="font-semibold text-xl text-[var(--color-primary)] mb-2">
              Gestão de Coletas
            </span>
          )}
          <p className="text-sm text-slate-500">Entre com seu usuário e senha</p>
        </div>

        {motivo === 'inatividade' && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
            Sua sessão expirou por inatividade. Faça login novamente.
          </p>
        )}
        {motivo === 'inativo' && (
          <p className="text-sm text-[var(--color-danger)] bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            Sua conta está inativa. Contate a administração.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            autoComplete="username"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          {formError && <p className="text-sm text-[var(--color-danger)]">{formError}</p>}
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
