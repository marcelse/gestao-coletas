import { FunctionsHttpError } from '@supabase/supabase-js'

// supabase-js só expõe uma mensagem genérica em error.message para respostas
// não-2xx de Edge Functions; a mensagem real fica no corpo da resposta.
export async function extractFunctionErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json()
      if (typeof body?.error === 'string') return body.error
    } catch {
      // segue para o fallback se o corpo não for JSON
    }
  }
  return error instanceof Error ? error.message : fallback
}
