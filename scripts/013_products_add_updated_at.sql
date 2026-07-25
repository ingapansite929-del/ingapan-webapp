-- ============================================================================
-- Migration: adiciona a coluna public.products.updated_at
--
-- "updated_at" registra a ultima modificacao de cada produto. E usado pelo
-- sitemap (src/app/sitemap.ts) como <lastmod> de cada /produtos/[id], um sinal
-- de frescor para o Google. Sem esta coluna a query do sitemap falhava e caia
-- no fallback, deixando todas as paginas de produto de fora do sitemap.xml.
--
-- Produtos ja existentes recebem o horario atual (DEFAULT now()) no momento em
-- que esta migration roda. Edicoes futuras atualizam a coluna via trigger.
--
-- Este script e idempotente e pode ser re-executado com seguranca.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Coluna: public.products.updated_at
-- NOT NULL com DEFAULT now() preenche automaticamente as linhas ja existentes.
-- ----------------------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ----------------------------------------------------------------------------
-- Funcao de trigger generica: mantem updated_at sincronizado em cada UPDATE.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- Trigger BEFORE UPDATE em public.products.
-- DROP antes do CREATE para tornar a migration re-executavel.
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
