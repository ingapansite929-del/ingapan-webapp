-- Estatisticas de visualizacao por produto.
CREATE TABLE IF NOT EXISTS public.product_stats (
  product_id  bigint PRIMARY KEY,
  views_count bigint NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_stats_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES public.products (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

ALTER TABLE public.product_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_stats_public_select ON public.product_stats;
CREATE POLICY product_stats_public_select
  ON public.product_stats
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS product_stats_public_insert ON public.product_stats;
DROP POLICY IF EXISTS product_stats_public_update ON public.product_stats;
DROP POLICY IF EXISTS product_stats_public_delete ON public.product_stats;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.product_stats FROM anon, authenticated;
GRANT SELECT ON TABLE public.product_stats TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_product_view(target_product_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF target_product_id IS NULL OR target_product_id <= 0 THEN
    RAISE EXCEPTION 'target_product_id invalido';
  END IF;

  INSERT INTO public.product_stats (product_id, views_count, updated_at)
  VALUES (target_product_id, 1, now())
  ON CONFLICT (product_id)
  DO UPDATE
  SET
    views_count = public.product_stats.views_count + 1,
    updated_at = now();
END;
$function$;

REVOKE ALL ON FUNCTION public.increment_product_view(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_product_view(bigint) TO anon, authenticated, service_role;

