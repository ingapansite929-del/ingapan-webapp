-- Impede mais de 10 produtos em destaque no carrossel.
CREATE OR REPLACE FUNCTION public.enforce_products_featured_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  featured_count integer;
BEGIN
  SELECT COUNT(*) INTO featured_count FROM public.products_featured;

  IF featured_count >= 10 THEN
    RAISE EXCEPTION 'Limite de 10 produtos em destaque atingido.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_featured_limit_trigger ON public.products_featured;
CREATE TRIGGER products_featured_limit_trigger
BEFORE INSERT ON public.products_featured
FOR EACH ROW
EXECUTE FUNCTION public.enforce_products_featured_limit();
