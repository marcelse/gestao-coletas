-- Dashboard: indicador de coletas não realizadas + séries para gráficos.
-- Mantém todas as chaves anteriores (compatível com o front antigo) e acrescenta:
--   nao_coletadas_periodo / _hoje / _mes, taxa_sucesso_periodo, por_status,
--   evolucao_diaria, motivos_nao_coleta, por_motoboy (coletadas x não coletadas).
-- A data de uma "não coleta" é atualizado_em (momento em que o motoboy registrou o motivo).

create or replace function dashboard_indicadores(data_inicio date, data_fim date)
returns json
language sql stable security invoker set search_path = public as $$
  select json_build_object(
    'a_coletar', (
      select count(*) from coletas where status in ('SOLICITADO', 'PENDENTE')
    ),
    'coletadas_periodo', (
      select count(*) from coletas
      where status = 'COLETADO' and coletado_em::date between data_inicio and data_fim
    ),
    'coletadas_hoje', (
      select count(*) from coletas
      where status = 'COLETADO' and coletado_em::date = current_date
    ),
    'coletadas_mes', (
      select count(*) from coletas
      where status = 'COLETADO' and coletado_em >= date_trunc('month', now())
    ),
    'nao_coletadas_periodo', (
      select count(*) from coletas
      where status = 'NAO_COLETADO' and atualizado_em::date between data_inicio and data_fim
    ),
    'nao_coletadas_hoje', (
      select count(*) from coletas
      where status = 'NAO_COLETADO' and atualizado_em::date = current_date
    ),
    'nao_coletadas_mes', (
      select count(*) from coletas
      where status = 'NAO_COLETADO' and atualizado_em >= date_trunc('month', now())
    ),
    'taxa_sucesso_periodo', (
      select case when count(*) = 0 then null
        else round(100.0 * count(*) filter (where status = 'COLETADO') / count(*), 1) end
      from coletas
      where (status = 'COLETADO' and coletado_em::date between data_inicio and data_fim)
         or (status = 'NAO_COLETADO' and atualizado_em::date between data_inicio and data_fim)
    ),
    'por_status', (
      select coalesce(json_agg(t), '[]'::json) from (
        select status::text as status, count(*) as total
        from coletas
        where criado_em::date between data_inicio and data_fim
        group by status
        order by status
      ) t
    ),
    'por_tipo', (
      select coalesce(json_agg(t), '[]'::json) from (
        select ta.nome, count(*) as total
        from coletas c
        join tipos_amostra ta on ta.id = c.tipo_amostra_id
        where c.status = 'COLETADO' and c.coletado_em::date between data_inicio and data_fim
        group by ta.nome
        order by ta.nome
      ) t
    ),
    'por_motoboy_mes', (
      select coalesce(json_agg(t), '[]'::json) from (
        select f.id, p.nome_completo, to_char(date_trunc('month', c.coletado_em), 'YYYY-MM') as mes,
          count(*) as total
        from coletas c
        join funcionarios f on f.id = c.motoboy_id
        join profiles p on p.id = f.id
        where c.status = 'COLETADO' and c.coletado_em::date between data_inicio and data_fim
        group by f.id, p.nome_completo, mes
        order by mes, p.nome_completo
      ) t
    ),
    'por_motoboy', (
      select coalesce(json_agg(t), '[]'::json) from (
        select p.nome_completo,
          count(*) filter (where c.status = 'COLETADO') as coletadas,
          count(*) filter (where c.status = 'NAO_COLETADO') as nao_coletadas
        from coletas c
        join funcionarios f on f.id = c.motoboy_id
        join profiles p on p.id = f.id
        where (c.status = 'COLETADO' and c.coletado_em::date between data_inicio and data_fim)
           or (c.status = 'NAO_COLETADO' and c.atualizado_em::date between data_inicio and data_fim)
        group by p.nome_completo
        order by p.nome_completo
      ) t
    ),
    'motivos_nao_coleta', (
      select coalesce(json_agg(t), '[]'::json) from (
        select lower(trim(motivo_nao_coletado)) as motivo, count(*) as total
        from coletas
        where status = 'NAO_COLETADO' and atualizado_em::date between data_inicio and data_fim
          and motivo_nao_coletado is not null
        group by 1
        order by total desc, 1
        limit 8
      ) t
    ),
    'evolucao_diaria', (
      select coalesce(json_agg(t order by t.dia), '[]'::json) from (
        select d.dia::date::text as dia,
          (select count(*) from coletas where status = 'COLETADO' and coletado_em::date = d.dia::date) as coletadas,
          (select count(*) from coletas where status = 'NAO_COLETADO' and atualizado_em::date = d.dia::date) as nao_coletadas,
          (select count(*) from coletas where criado_em::date = d.dia::date) as solicitadas
        from generate_series(data_inicio::timestamp, data_fim::timestamp, interval '1 day') as d(dia)
      ) t
    )
  );
$$;

grant execute on function dashboard_indicadores(date, date) to authenticated;
