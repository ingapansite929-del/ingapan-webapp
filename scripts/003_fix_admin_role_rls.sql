-- Fix RLS role checks to avoid recursive policy evaluation on public.clientes.

-- Helper used by RLS policies for admin checks.
-- SECURITY DEFINER allows reading public.clientes without being blocked by its own RLS policy.
CREATE OR REPLACE FUNCTION public.is_admin_ingapan(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clientes c
    WHERE c.id = target_user_id
      AND lower(trim(c.role)) = 'admin_ingapan'
  );
$$;

-- Ensure app roles can execute the function inside RLS policies.
GRANT EXECUTE ON FUNCTION public.is_admin_ingapan(uuid) TO authenticated, anon;

-- Recreate clientes admin policies without self-referential subqueries.
DROP POLICY IF EXISTS "admins_select_all" ON public.clientes;
CREATE POLICY "admins_select_all" ON public.clientes
  FOR SELECT USING (public.is_admin_ingapan(auth.uid()));

DROP POLICY IF EXISTS "admins_update_all" ON public.clientes;
CREATE POLICY "admins_update_all" ON public.clientes
  FOR UPDATE USING (public.is_admin_ingapan(auth.uid()));

-- Recreate products policies using the same helper for consistency.
DROP POLICY IF EXISTS "products_admin_select" ON public.products;
CREATE POLICY "products_admin_select" ON public.products
  FOR SELECT USING (public.is_admin_ingapan(auth.uid()));

DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT WITH CHECK (public.is_admin_ingapan(auth.uid()));

DROP POLICY IF EXISTS "products_admin_update" ON public.products;
CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE USING (public.is_admin_ingapan(auth.uid()))
  WITH CHECK (public.is_admin_ingapan(auth.uid()));

DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (public.is_admin_ingapan(auth.uid()));
