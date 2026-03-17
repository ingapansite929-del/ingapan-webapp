-- Create enum type for roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('cliente_ingapan', 'admin_ingapan');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create clientes table
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cnpj TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'cliente_ingapan',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Clients can read their own data
CREATE POLICY "clientes_select_own" ON public.clientes
  FOR SELECT USING (auth.uid() = id);

-- Clients can update their own data (except role)
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

-- Insert policy for new users (via trigger)
CREATE POLICY "clientes_insert_own" ON public.clientes
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.clientes (id, nome, email, cnpj, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'cnpj', ''),
    'cliente_ingapan'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON public.clientes(cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_role ON public.clientes(role);
