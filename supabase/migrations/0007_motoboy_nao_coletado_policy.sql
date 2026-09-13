-- Permite ao Motoboy marcar a coleta como NAO_COLETADO, exigindo que
-- motivo_nao_coletado seja preenchido nesse caso.

drop policy if exists coletas_update_motoboy on coletas;

create policy coletas_update_motoboy on coletas for update
  using (auth_perfil() = 'MOTOBOY' and motoboy_id = auth.uid() and status = 'PENDENTE')
  with check (
    auth_perfil() = 'MOTOBOY' and motoboy_id = auth.uid()
    and status in ('COLETADO', 'NAO_COLETADO')
    and (status <> 'NAO_COLETADO' or (motivo_nao_coletado is not null and length(trim(motivo_nao_coletado)) > 0))
  );
