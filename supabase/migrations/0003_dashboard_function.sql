-- Função agregadora do dashboard gerencial (Administrador e Coordenação).
-- security invoker: respeita a RLS de quem chama (só staff enxerga todas as coletas,
-- então não há vazamento de dados para os demais perfis via esta função).

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
    )
  );
$$;

grant execute on function dashboard_indicadores(date, date) to authenticated;
