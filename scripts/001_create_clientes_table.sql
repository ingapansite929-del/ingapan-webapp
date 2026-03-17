-- Create clientes table
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cnpj TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'cliente_ingapan' CHECK (role IN ('cliente_ingapan', 'admin_ingapan')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Clients can read their own data
CREATE POLICY "clientes_select_own" ON public.clientes
  FOR SELECT USING (auth.uid() = id);

-- Clients can update their own data
CREATE POLICY "clientes_update_own" ON public.clientes
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all clients
CREATE POLICY "admins_select_all" ON public.clientes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE id = auth.uid() AND role = 'admin_ingapan'
    )
  );

-- Admins can update all clients
CREATE POLICY "admins_update_all" ON public.clientes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE id = auth.uid() AND role = 'admin_ingapan'
    )
  );

-- Insert policy for new users
CREATE POLICY "clientes_insert_own" ON public.clientes
  FOR INSERT WITH CHECK (auth.uid() = id);
