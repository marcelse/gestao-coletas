-- Row Level Security: aplica as 4 permissões de perfil descritas na especificação.
-- Regra geral aprovada: nenhuma exclusão física de cadastros (soft delete via `ativo`/status
-- 'CANCELADO'), exceto o Cliente, que pode excluir fisicamente uma coleta própria enquanto
-- ainda está em SOLICITADO.

-- Funções auxiliares (security definer evita recursão de RLS ao consultar profiles).
create or replace function auth_perfil()
returns perfil_usuario
language sql stable security definer set search_path = public as $$
  select perfil from profiles where id = auth.uid();
$$;

create or replace function is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select auth_perfil() in ('ADMINISTRADOR', 'COORDENACAO');
$$;

alter table profiles enable row level security;
alter table funcionarios enable row level security;
alter table clientes enable row level security;
alter table tipos_amostra enable row level security;
alter table coletas enable row level security;
alter table configuracoes_visuais enable row level security;

-- ============ profiles ============
create policy profiles_select on profiles for select
  using (is_staff() or id = auth.uid());

create policy profiles_update on profiles for update
  using (is_staff() or id = auth.uid())
  with check (is_staff() or id = auth.uid());

-- Ninguém insere/deleta profiles pelo client: contas são criadas pela Edge Function
-- `create-user`, que roda com service_role e ignora RLS.

create or replace function protect_profiles_privileged_fields()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() then
    if new.perfil is distinct from old.perfil then
      raise exception 'Apenas Administrador ou Coordenação podem alterar o perfil de acesso.';
    end if;
    if new.ativo is distinct from old.ativo then
      raise exception 'Apenas Administrador ou Coordenação podem ativar/inativar usuários.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_protect_profiles_privileged_fields
  before update on profiles
  for each row execute function protect_profiles_privileged_fields();

-- ============ funcionarios ============
create policy funcionarios_select on funcionarios for select
  using (is_staff() or id = auth.uid());

create policy funcionarios_insert on funcionarios for insert
  with check (is_staff());

create policy funcionarios_update on funcionarios for update
  using (is_staff() or id = auth.uid())
  with check (is_staff() or id = auth.uid());

create or replace function protect_funcionarios_privileged_fields()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() and new.perfil is distinct from old.perfil then
    raise exception 'Apenas Administrador ou Coordenação podem alterar o perfil de acesso.';
  end if;
  return new;
end;
$$;

create trigger trg_protect_funcionarios_privileged_fields
  before update on funcionarios
  for each row execute function protect_funcionarios_privileged_fields();

-- ============ clientes ============
create policy clientes_select on clientes for select
  using (is_staff() or id = auth.uid());

create policy clientes_insert on clientes for insert
  with check (is_staff());

create policy clientes_update on clientes for update
  using (is_staff() or id = auth.uid())
  with check (is_staff() or id = auth.uid());

-- ============ tipos_amostra ============
create policy tipos_amostra_select on tipos_amostra for select
  using (auth.uid() is not null);

create policy tipos_amostra_insert on tipos_amostra for insert
  with check (is_staff());

create policy tipos_amostra_update on tipos_amostra for update
  using (is_staff())
  with check (is_staff());

-- ============ coletas ============
create policy coletas_select on coletas for select
  using (is_staff() or cliente_id = auth.uid() or motoboy_id = auth.uid());

create policy coletas_insert_cliente on coletas for insert
  with check (
    (auth_perfil() = 'CLIENTE' and cliente_id = auth.uid() and status = 'SOLICITADO')
    or is_staff()
  );

create policy coletas_update_staff on coletas for update
  using (is_staff())
  with check (is_staff());

create policy coletas_update_motoboy on coletas for update
  using (auth_perfil() = 'MOTOBOY' and motoboy_id = auth.uid() and status = 'PENDENTE')
  with check (auth_perfil() = 'MOTOBOY' and motoboy_id = auth.uid() and status = 'COLETADO');

create policy coletas_delete_cliente on coletas for delete
  using (auth_perfil() = 'CLIENTE' and cliente_id = auth.uid() and status = 'SOLICITADO');

-- Reforço: quando o Motoboy atualiza, só pode mudar status/coletado_em.
create or replace function protect_coletas_motoboy_update()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth_perfil() = 'MOTOBOY' then
    if new.cliente_id is distinct from old.cliente_id
      or new.tipo_amostra_id is distinct from old.tipo_amostra_id
      or new.endereco_coleta is distinct from old.endereco_coleta
      or new.motoboy_id is distinct from old.motoboy_id
      or new.criado_por is distinct from old.criado_por
      or new.atribuido_por is distinct from old.atribuido_por
      or new.atribuido_em is distinct from old.atribuido_em
    then
      raise exception 'Motoboy só pode marcar a coleta como coletada.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_protect_coletas_motoboy_update
  before update on coletas
  for each row execute function protect_coletas_motoboy_update();

-- ============ configuracoes_visuais ============
create policy configuracoes_visuais_select on configuracoes_visuais for select
  using (true);

create policy configuracoes_visuais_update on configuracoes_visuais for update
  using (auth_perfil() = 'ADMINISTRADOR')
  with check (auth_perfil() = 'ADMINISTRADOR');

-- ============ storage: bucket "logos" ============
create policy logos_select on storage.objects for select
  using (bucket_id = 'logos');

create policy logos_insert on storage.objects for insert
  with check (bucket_id = 'logos' and auth_perfil() = 'ADMINISTRADOR');

create policy logos_update on storage.objects for update
  using (bucket_id = 'logos' and auth_perfil() = 'ADMINISTRADOR');

create policy logos_delete on storage.objects for delete
  using (bucket_id = 'logos' and auth_perfil() = 'ADMINISTRADOR');
