-- =====================================================
-- RotaFlow: FIX RLS Policies
-- Execute no Supabase SQL Editor
-- =====================================================

-- Drop e recria a funcao helper para evitar erros de recursao
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$;

-- =====================================================
-- FIX: Permitir INSERT em companies e users para novos usuarios
-- =====================================================

-- Companies: qualquer autenticado pode criar
DROP POLICY IF EXISTS "Authenticated users can create a company" ON companies;
CREATE POLICY "Authenticated users can create a company" ON companies 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users: qualquer autenticado pode criar perfil
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON users;
CREATE POLICY "Authenticated users can insert their own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users: pode ver pelo email (para invite flow)
DROP POLICY IF EXISTS "Users can view members of their company" ON users;
CREATE POLICY "Users can view members of their company" ON users FOR SELECT
  USING (
    company_id = get_my_company_id() 
    OR id = auth.uid() 
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- =====================================================
-- FIX: Garantir que transactions INSERT funciona
-- =====================================================
DROP POLICY IF EXISTS "tx_insert" ON transactions;
CREATE POLICY "tx_insert" ON transactions 
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

-- =====================================================
-- FIX: Garantir que routes INSERT funciona
-- =====================================================
DROP POLICY IF EXISTS "routes_insert" ON routes;
CREATE POLICY "routes_insert" ON routes 
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

-- =====================================================
-- FIX: Garantir storage bucket existe
-- =====================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('route-attachments', 'route-attachments', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage: upload autenticado
DROP POLICY IF EXISTS "auth_upload" ON storage.objects;
CREATE POLICY "auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'route-attachments' AND auth.role() = 'authenticated');

-- Storage: leitura publica
DROP POLICY IF EXISTS "public_read" ON storage.objects;
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'route-attachments');
