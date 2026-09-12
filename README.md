# Gestão de Coletas Laboratoriais

Sistema web para centralizar a solicitação, atribuição, execução e acompanhamento de coletas de
amostras laboratoriais, com 4 perfis de acesso (Administrador, Coordenação, Motoboy, Cliente) e
dashboard gerencial com exportação em PDF. Genérico/white-label: logo e cores são configuráveis
pelo Administrador, sem nome de laboratório fixado no código.

Stack: React + Vite + TypeScript, Supabase (Postgres + Auth + Storage), Tailwind CSS.

## 1. Criar o projeto no Supabase

1. Crie um projeto em https://supabase.com.
2. Em **SQL Editor**, rode os arquivos de `supabase/migrations/` **em ordem** (0001 → 0004).
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`.

## 2. Configurar o frontend

```bash
cp .env.example .env.local
# edite .env.local com a URL e a anon key do seu projeto
npm install
npm run dev
```

## 3. Criar o primeiro Administrador

Não há self-signup — o primeiro Admin precisa ser criado com a `service_role key` (Project
Settings → API → escondida por padrão; nunca coloque essa chave em `.env.local`/frontend).

```bash
SUPABASE_URL=https://SEU-PROJETO.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key \
ADMIN_EMAIL=admin@seulaboratorio.com \
ADMIN_PASSWORD=escolha-uma-senha-forte \
ADMIN_NOME="Nome do Administrador" \
node scripts/bootstrap-admin.mjs
```

A partir daí, esse Administrador cria todos os demais usuários (Coordenação, Motoboy, Cliente)
pela própria interface do sistema.

## 4. Deploy da Edge Function `create-user`

Necessária para o Admin/Coordenação criarem novos usuários pelo app.

```bash
npx supabase login
npx supabase link --project-ref SEU-PROJECT-REF
npx supabase functions deploy create-user
```

## 5. Deploy do frontend

Qualquer provedor que builde um projeto Vite funciona (Vercel, Netlify, etc.). Configure lá as
mesmas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` de `.env.local`.

```bash
npm run build   # gera a pasta dist/
```

## Estrutura do projeto

- `supabase/migrations/` — schema, RLS e função do dashboard (SQL versionado).
- `supabase/functions/create-user/` — Edge Function de criação de contas.
- `scripts/bootstrap-admin.mjs` — cria o primeiro Administrador.
- `src/auth/` — autenticação, guarda de rotas, expiração de sessão por inatividade (1h).
- `src/theme/` — logo e cores configuráveis, carregadas do banco.
- `src/layout/` — casca visual comum a todas as telas (topo, menu do usuário, "voltar").
- `src/features/` — telas e regras de cada área (funcionários, clientes, coletas, dashboard,
  configurações visuais).

## Notas de segurança

- Toda a permissão por perfil é aplicada via Row Level Security no Postgres (não apenas na UI) —
  veja `supabase/migrations/0002_rls_policies.sql`.
- Nenhuma exclusão física de cadastro é permitida (sempre soft delete via `ativo`/status
  `CANCELADO`), exceto o Cliente excluir uma coleta própria enquanto `SOLICITADO`.
- A `service_role key` do Supabase só deve ser usada no `bootstrap-admin.mjs` (rodado localmente,
  uma vez) e dentro da Edge Function `create-user` — nunca no frontend.
