-- Dados iniciais de exemplo. Ajuste os nomes conforme o laboratório que for usar o sistema.

insert into tipos_amostra (nome) values
  ('Sangue'),
  ('Urina'),
  ('Fezes'),
  ('Swab')
on conflict (nome) do nothing;

-- O primeiro usuário Administrador NÃO é criado aqui (precisa existir em auth.users,
-- o que exige a service_role key). Use o script scripts/bootstrap-admin.mjs após
-- configurar as variáveis de ambiente — veja README.md.
