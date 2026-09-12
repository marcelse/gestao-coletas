-- Schema inicial: enums, tabelas e índices.
-- Sistema de Gestão de Coletas Laboratoriais (genérico, white-label).

create extension if not exists "pgcrypto";

create type perfil_usuario as enum ('ADMINISTRADOR', 'COORDENACAO', 'MOTOBOY', 'CLIENTE');
create type status_coleta as enum ('SOLICITADO', 'PENDENTE', 'COLETADO', 'CANCELADO');

-- 1:1 com auth.users. Fonte única de verdade para perfil e para ativo/inativo.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  perfil perfil_usuario not null,
  nome_completo text not null,
  telefone text,
  ativo boolean not null default true,
  senha_temporaria boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Dados operacionais de Administrador, Coordenação e Motoboy.
create table funcionarios (
  id uuid primary key references profiles (id) on delete cascade,
  email text not null unique,
  perfil perfil_usuario not null check (perfil in ('ADMINISTRADOR', 'COORDENACAO', 'MOTOBOY')),
  criado_por uuid references profiles (id),
  criado_em timestamptz not null default now()
);

-- Dados operacionais de Cliente (a clínica/laboratório solicitante).
create table clientes (
  id uuid primary key references profiles (id) on delete cascade,
  nome_clinica text not null,
  endereco text not null,
  telefone text,
  email text not null unique,
  criado_por uuid references profiles (id),
  criado_em timestamptz not null default now()
);

-- Catálogo de tipos de amostra, gerenciável pelo Administrador.
create table tipos_amostra (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ativo boolean not null default true
);

-- Núcleo do domínio: cada solicitação/coleta de amostra.
create table coletas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id),
  tipo_amostra_id uuid not null references tipos_amostra (id),
  endereco_coleta text not null,
  observacoes text,
  status status_coleta not null default 'SOLICITADO',
  origem text not null default 'MANUAL', -- 'MANUAL' | futuramente 'WHATSAPP' (Fase 2)
  motoboy_id uuid references funcionarios (id),
  criado_por uuid not null references profiles (id),
  atribuido_por uuid references profiles (id),
  atribuido_em timestamptz,
  coletado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index idx_coletas_status on coletas (status);
create index idx_coletas_motoboy on coletas (motoboy_id);
create index idx_coletas_cliente on coletas (cliente_id);
create index idx_coletas_coletado_em on coletas (coletado_em);
create index idx_coletas_criado_em on coletas (criado_em);

-- Identidade visual (logo + cores), linha única, editável só pelo Administrador.
create table configuracoes_visuais (
  id int primary key default 1 check (id = 1),
  logo_url text,
  cor_primaria text not null default '#0F766E',
  cor_secundaria text not null default '#334155',
  cor_fundo text not null default '#F8FAFC',
  atualizado_por uuid references profiles (id),
  atualizado_em timestamptz not null default now()
);

insert into configuracoes_visuais (id) values (1);

-- Trigger genérico para manter atualizado_em em dia.
create or replace function set_atualizado_em()
returns trigger
language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_profiles_atualizado_em
  before update on profiles
  for each row execute function set_atualizado_em();

create trigger trg_coletas_atualizado_em
  before update on coletas
  for each row execute function set_atualizado_em();

create trigger trg_configuracoes_visuais_atualizado_em
  before update on configuracoes_visuais
  for each row execute function set_atualizado_em();

-- Bucket de storage para upload de logomarca.
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;
