-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Optional indexes for admin panel filtering and ordering
CREATE INDEX IF NOT EXISTS products_nome_idx ON public.products (nome);
CREATE INDEX IF NOT EXISTS products_categoria_idx ON public.products (categoria);

DROP POLICY IF EXISTS "products_admin_select" ON public.products;
CREATE POLICY "products_admin_select" ON public.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.clientes
      WHERE clientes.id = auth.uid()
        AND clientes.role = 'admin_ingapan'
    )
  );

DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clientes
      WHERE clientes.id = auth.uid()
        AND clientes.role = 'admin_ingapan'
    )
  );

DROP POLICY IF EXISTS "products_admin_update" ON public.products;
CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.clientes
      WHERE clientes.id = auth.uid()
        AND clientes.role = 'admin_ingapan'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.clientes
      WHERE clientes.id = auth.uid()
        AND clientes.role = 'admin_ingapan'
    )
  );

DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.clientes
      WHERE clientes.id = auth.uid()
        AND clientes.role = 'admin_ingapan'
    )
  );
