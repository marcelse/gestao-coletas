-- Permite que o Motoboy veja os dados do cliente (nome da clínica) apenas para
-- coletas que estão de fato atribuídas a ele. O endereço da coleta já é visível
-- via coletas.endereco_coleta (snapshot), independente desta policy.

create policy clientes_select_motoboy on clientes for select
  using (
    exists (
      select 1 from coletas
      where coletas.cliente_id = clientes.id
        and coletas.motoboy_id = auth.uid()
    )
  );
