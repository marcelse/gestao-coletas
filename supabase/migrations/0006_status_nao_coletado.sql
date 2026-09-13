-- Novo status para quando o Motoboy não consegue realizar a coleta.
-- Precisa estar em migration própria: Postgres não permite usar um valor de
-- enum recém-criado na mesma transação em que ele foi adicionado.

alter type status_coleta add value 'NAO_COLETADO';

-- Motivo obrigatório informado pelo Motoboy ao marcar como não coletada.
-- Campo separado de `observacoes` (que guarda a nota original da solicitação)
-- para não sobrescrever essa informação.
alter table coletas add column motivo_nao_coletado text;
