-- Estatisticas agregadas de pedidos por produto.

-- ============================================================================
-- TABELA: public.product_sales_stats
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_sales_stats (
  product_id    bigint PRIMARY KEY
    REFERENCES public.products (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  orders_count  bigint NOT NULL DEFAULT 0 CHECK (orders_count >= 0),
  units_sold    bigint NOT NULL DEFAULT 0 CHECK (units_sold >= 0),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_sales_stats_units_sold_desc_idx
  ON public.product_sales_stats (units_sold DESC);

CREATE INDEX IF NOT EXISTS product_sales_stats_orders_count_desc_idx
  ON public.product_sales_stats (orders_count DESC);

-- ============================================================================
-- FUNCOES: atualizacao incremental de agregados
-- ============================================================================
CREATE OR REPLACE FUNCTION public.apply_product_sales_stats_delta(
  p_product_id bigint,
  p_orders_delta integer,
  p_units_delta integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_product_id IS NULL OR p_product_id <= 0 THEN
    RETURN;
  END IF;

  IF p_orders_delta = 0 AND p_units_delta = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.product_sales_stats (product_id, orders_count, units_sold, updated_at)
  VALUES (
    p_product_id,
    GREATEST(p_orders_delta, 0)::bigint,
    GREATEST(p_units_delta, 0)::bigint,
    now()
  )
  ON CONFLICT (product_id)
  DO UPDATE
  SET
    orders_count = GREATEST(0, public.product_sales_stats.orders_count + p_orders_delta),
    units_sold = GREATEST(0, public.product_sales_stats.units_sold + p_units_delta),
    updated_at = now();

  DELETE FROM public.product_sales_stats
  WHERE product_id = p_product_id
    AND orders_count = 0
    AND units_sold = 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_product_sales_stats_from_order_items()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.apply_product_sales_stats_delta(NEW.product_id, 1, NEW.quantity);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.product_id IS NOT NULL AND NEW.product_id IS NOT NULL AND OLD.product_id = NEW.product_id THEN
      PERFORM public.apply_product_sales_stats_delta(NEW.product_id, 0, NEW.quantity - OLD.quantity);
      RETURN NEW;
    END IF;

    PERFORM public.apply_product_sales_stats_delta(OLD.product_id, -1, -OLD.quantity);
    PERFORM public.apply_product_sales_stats_delta(NEW.product_id, 1, NEW.quantity);
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    PERFORM public.apply_product_sales_stats_delta(OLD.product_id, -1, -OLD.quantity);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$;

-- ============================================================================
-- TRIGGER
-- ============================================================================
DROP TRIGGER IF EXISTS client_order_items_sales_stats_sync ON public.client_order_items;
CREATE TRIGGER client_order_items_sales_stats_sync
AFTER INSERT OR UPDATE OR DELETE ON public.client_order_items
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_sales_stats_from_order_items();

-- ============================================================================
-- BACKFILL
-- ============================================================================
INSERT INTO public.product_sales_stats (product_id, orders_count, units_sold, updated_at)
SELECT
  coi.product_id,
  COUNT(*)::bigint AS orders_count,
  SUM(coi.quantity)::bigint AS units_sold,
  now()
FROM public.client_order_items coi
WHERE coi.product_id IS NOT NULL
GROUP BY coi.product_id
ON CONFLICT (product_id)
DO UPDATE
SET
  orders_count = EXCLUDED.orders_count,
  units_sold = EXCLUDED.units_sold,
  updated_at = now();

-- ============================================================================
-- RLS E PERMISSOES
-- ============================================================================
ALTER TABLE public.product_sales_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_sales_stats_admin_select ON public.product_sales_stats;
CREATE POLICY product_sales_stats_admin_select
  ON public.product_sales_stats
  FOR SELECT
  TO authenticated
  USING (public.is_admin_ingapan(auth.uid()));

DROP POLICY IF EXISTS product_sales_stats_public_insert ON public.product_sales_stats;
DROP POLICY IF EXISTS product_sales_stats_public_update ON public.product_sales_stats;
DROP POLICY IF EXISTS product_sales_stats_public_delete ON public.product_sales_stats;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.product_sales_stats FROM anon, authenticated;
GRANT SELECT ON TABLE public.product_sales_stats TO authenticated;

REVOKE ALL ON FUNCTION public.apply_product_sales_stats_delta(bigint, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_product_sales_stats_delta(bigint, integer, integer)
  TO service_role;

REVOKE ALL ON FUNCTION public.sync_product_sales_stats_from_order_items() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_product_sales_stats_from_order_items()
  TO service_role;
