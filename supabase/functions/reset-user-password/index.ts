// Edge Function: redefine a senha de qualquer usuário.
// Só pode ser chamada por um usuário autenticado com perfil ADMINISTRADOR ou
// COORDENACAO. Roda com a service_role key, nunca exposta ao browser — é o
// único jeito de alterar a senha de outra pessoa (o SDK do client só permite
// alterar a própria senha).

import { createClient } from 'jsr:@supabase/supabase-js@2'

interface Payload {
  user_id: string
  nova_senha: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Não autenticado.' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user: caller },
    } = await callerClient.auth.getUser()
    if (!caller) {
      return jsonResponse({ error: 'Não autenticado.' }, 401)
    }

    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('perfil, ativo')
      .eq('id', caller.id)
      .single()

    if (!callerProfile?.ativo || !['ADMINISTRADOR', 'COORDENACAO'].includes(callerProfile.perfil)) {
      return jsonResponse({ error: 'Apenas Administrador ou Coordenação podem alterar a senha de outros usuários.' }, 403)
    }

    const payload: Payload = await req.json()
    if (!payload.user_id || !payload.nova_senha) {
      return jsonResponse({ error: 'Campos obrigatórios ausentes.' }, 400)
    }
    if (payload.nova_senha.length < 6) {
      return jsonResponse({ error: 'A senha deve ter ao menos 6 caracteres.' }, 400)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { error: updateError } = await adminClient.auth.admin.updateUserById(payload.user_id, {
      password: payload.nova_senha,
    })
    if (updateError) {
      return jsonResponse({ error: updateError.message }, 400)
    }

    await adminClient.from('profiles').update({ senha_temporaria: true }).eq('id', payload.user_id)

    return jsonResponse({ ok: true }, 200)
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : 'Erro inesperado.' }, 500)
  }
})

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
