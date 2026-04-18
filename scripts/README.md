# Scripts SQL - Supabase

## Arquivo atual de referencia

**`004_current_schema_snapshot.sql`** e o snapshot oficial do schema do banco
Supabase (schema `public`). Ele reflete o estado REAL do banco, incluindo
alteracoes feitas diretamente pelo painel do Supabase.

Use este arquivo como referencia ao:
- Recriar o banco em um ambiente novo
- Entender tabelas, colunas, indices, functions, triggers e policies
- Revisar a configuracao de RLS

O script e idempotente (usa `IF NOT EXISTS`, `CREATE OR REPLACE` e
`DROP POLICY IF EXISTS`), podendo ser re-executado com seguranca.

## Arquivos historicos

Os arquivos abaixo foram os scripts originais de migracao e **nao refletem
mais o estado atual do banco**. Estao preservados apenas como historico:

- `001_create_clientes_table.sql`
- `002_products_admin_panel_rls.sql`
- `003_fix_admin_role_rls.sql`

Nao os utilize como fonte de verdade do schema. Sempre consulte
`004_current_schema_snapshot.sql` ou o proprio Supabase.

## Fluxo recomendado para futuras alteracoes

1. Aplicar a mudanca no Supabase (via painel ou SQL editor).
2. Criar um novo arquivo incremental (ex: `005_add_pedidos_table.sql`) com
   apenas o delta da mudanca.
3. Atualizar o snapshot completo gerando um novo arquivo
   (ex: `006_current_schema_snapshot.sql`) que substitua o 004 como
   referencia atual.
