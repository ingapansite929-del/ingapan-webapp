-- ============================================================================
-- Migration: adiciona a coluna public.products.codigo
--
-- "codigo" e o codigo de negocio do produto (vindo do ERP/planilha), distinto
-- do "id" (chave tecnica auto-incremental do Postgres). E usado como chave de
-- deduplicacao na importacao em massa (ON CONFLICT (codigo) DO NOTHING), o que
-- torna o script de import idempotente e re-executavel com seguranca.
--
-- Este script e idempotente (IF NOT EXISTS) e pode ser re-executado.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Coluna: public.products.codigo (codigo de negocio, opcional, unico)
-- ----------------------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS codigo varchar;

-- Unicidade: garante que cada codigo de negocio exista uma unica vez e habilita
-- o ON CONFLICT (codigo) usado pelo import em massa.
-- (NULL permanece permitido e nao conflita: multiplos produtos sem codigo sao ok.)
CREATE UNIQUE INDEX IF NOT EXISTS products_codigo_key
  ON public.products (codigo);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
