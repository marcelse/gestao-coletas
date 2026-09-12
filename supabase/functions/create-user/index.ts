// Edge Function: cria contas de Funcionário ou Cliente.
// Só pode ser chamada por um usuário autenticado com perfil ADMINISTRADOR ou COORDENACAO
// (sem self-signup no sistema). Roda com a service_role key, nunca exposta ao browser.
//
// Deploy: supabase functions deploy create-user

import { createClient } from 'jsr:@supabase/supabase-js@2'

interface Payload {
  nome_completo: string
  telefone?: string
  email: string
  senha: string
  perfil: 'ADMINISTRADOR' | 'COORDENACAO' | 'MOTOBOY' | 'CLIENTE'
  nome_clinica?: string
  endereco?: string
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

    // Cliente "como o chamador", só para validar quem está fazendo a requisição.
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
      return jsonResponse({ error: 'Apenas Administrador ou Coordenação podem criar usuários.' }, 403)
    }

    const payload: Payload = await req.json()
    if (!payload.nome_completo || !payload.email || !payload.senha || !payload.perfil) {
      return jsonResponse({ error: 'Campos obrigatórios ausentes.' }, 400)
    }
    if (payload.perfil === 'CLIENTE' && (!payload.nome_clinica || !payload.endereco)) {
      return jsonResponse({ error: 'Cliente exige nome_clinica e endereco.' }, 400)
    }

    // Cliente admin: ignora RLS, único capaz de criar em auth.users com senha definida.
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: payload.email,
      password: payload.senha,
      email_confirm: true,
    })
    if (createError || !created.user) {
      return jsonResponse({ error: createError?.message ?? 'Falha ao criar usuário.' }, 400)
    }

    const userId = created.user.id

    const { error: profileError } = await adminClient.from('profiles').insert({
      id: userId,
      perfil: payload.perfil,
      nome_completo: payload.nome_completo,
      telefone: payload.telefone ?? null,
      ativo: true,
      senha_temporaria: true,
    })
    if (profileError) {
      await adminClient.auth.admin.deleteUser(userId)
      return jsonResponse({ error: profileError.message }, 400)
    }

    if (payload.perfil === 'CLIENTE') {
      const { error } = await adminClient.from('clientes').insert({
        id: userId,
        nome_clinica: payload.nome_clinica,
        endereco: payload.endereco,
        telefone: payload.telefone ?? null,
        email: payload.email,
        criado_por: caller.id,
      })
      if (error) {
        await adminClient.auth.admin.deleteUser(userId)
        return jsonResponse({ error: error.message }, 400)
      }
    } else {
      const { error } = await adminClient.from('funcionarios').insert({
        id: userId,
        email: payload.email,
        perfil: payload.perfil,
        criado_por: caller.id,
      })
      if (error) {
        await adminClient.auth.admin.deleteUser(userId)
        return jsonResponse({ error: error.message }, 400)
      }
    }

    return jsonResponse({ id: userId }, 201)
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
