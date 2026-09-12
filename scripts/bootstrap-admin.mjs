// Cria o primeiro usuário Administrador do sistema.
// Uso:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//   ADMIN_EMAIL=admin@exemplo.com ADMIN_PASSWORD=troque-esta-senha ADMIN_NOME="Nome Completo" \
//   node scripts/bootstrap-admin.mjs
//
// A service_role key nunca deve ir para o frontend/.env.local do Vite — use-a só aqui,
// uma única vez, para o bootstrap do primeiro Administrador.

import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOME } = process.env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NOME) {
  console.error(
    'Defina SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NOME como variáveis de ambiente.',
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
})

if (createError || !created.user) {
  console.error('Falha ao criar usuário:', createError?.message)
  process.exit(1)
}

const { error: profileError } = await supabase.from('profiles').insert({
  id: created.user.id,
  perfil: 'ADMINISTRADOR',
  nome_completo: ADMIN_NOME,
  ativo: true,
  senha_temporaria: true,
})

if (profileError) {
  console.error('Usuário criado no Auth, mas falhou ao criar o profile:', profileError.message)
  process.exit(1)
}

const { error: funcionarioError } = await supabase.from('funcionarios').insert({
  id: created.user.id,
  email: ADMIN_EMAIL,
  perfil: 'ADMINISTRADOR',
})

if (funcionarioError) {
  console.error('Profile criado, mas falhou ao criar o registro de funcionário:', funcionarioError.message)
  process.exit(1)
}

console.log(`Administrador criado com sucesso: ${ADMIN_EMAIL} (id ${created.user.id})`)
