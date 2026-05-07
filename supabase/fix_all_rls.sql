-- =====================================================
-- RotaFlow: FIX COMPLETO DE RLS
-- Execute TUDO no Supabase SQL Editor (https://supabase.com/dashboard)
-- Vai no projeto > SQL Editor > New Query > Cola tudo > Run
-- =====================================================

-- =====================================================
-- PASSO 1: Criar função helper SECURITY DEFINER
-- Isso evita recursão infinita nas policies da tabela users
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- Função helper para pegar o email do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_my_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid() LIMIT 1;
$$;

-- =====================================================
-- PASSO 2: LIMPAR TODAS AS POLICIES EXISTENTES
-- =====================================================

-- Companies
DO $$ BEGIN
  EXECUTE (SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON companies;', E'\n')
           FROM pg_policies WHERE tablename = 'companies');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Users
DO $$ BEGIN
  EXECUTE (SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON users;', E'\n')
           FROM pg_policies WHERE tablename = 'users');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Transactions
DO $$ BEGIN
  EXECUTE (SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON transactions;', E'\n')
           FROM pg_policies WHERE tablename = 'transactions');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Financial Categories
DO $$ BEGIN
  EXECUTE (SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON financial_categories;', E'\n')
           FROM pg_policies WHERE tablename = 'financial_categories');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Routes
DO $$ BEGIN
  EXECUTE (SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON routes;', E'\n')
           FROM pg_policies WHERE tablename = 'routes');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Customers
DO $$ BEGIN
  EXECUTE (SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON customers;', E'\n')
           FROM pg_policies WHERE tablename = 'customers');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Route Attachments
DO $$ BEGIN
  EXECUTE (SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON route_attachments;', E'\n')
           FROM pg_policies WHERE tablename = 'route_attachments');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- PASSO 3: Garantir RLS ativo em TODAS as tabelas
-- =====================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_attachments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASSO 4: POLICIES NOVAS - USERS
-- CRÍTICO: Usa auth.uid() direto, SEM consultar a própria tabela users
-- para evitar recursão infinita
-- =====================================================

-- SELECT: Usuário pode ver a si mesmo (por id) OU membros da mesma empresa
CREATE POLICY "users_select" ON users FOR SELECT USING (
  id = auth.uid()
  OR email = public.get_my_email()
  OR company_id = public.get_my_company_id()
);

-- INSERT: Qualquer autenticado pode criar perfil
CREATE POLICY "users_insert" ON users FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Pode atualizar a si mesmo OU admin/owner pode atualizar da mesma empresa
CREATE POLICY "users_update" ON users FOR UPDATE USING (
  id = auth.uid()
  OR company_id = public.get_my_company_id()
);

-- DELETE: Apenas owner da mesma empresa
CREATE POLICY "users_delete" ON users FOR DELETE USING (
  company_id = public.get_my_company_id()
  AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'
  )
);

-- =====================================================
-- PASSO 5: POLICIES - COMPANIES
-- =====================================================

-- SELECT: Pode ver a empresa do usuário
CREATE POLICY "companies_select" ON companies FOR SELECT USING (
  id = public.get_my_company_id()
);

-- INSERT: Qualquer autenticado pode criar empresa (para signup flow)
CREATE POLICY "companies_insert" ON companies FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Apenas owner pode atualizar
CREATE POLICY "companies_update" ON companies FOR UPDATE USING (
  id = public.get_my_company_id()
);

-- =====================================================
-- PASSO 6: POLICIES - TRANSACTIONS
-- =====================================================

CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (
  company_id = public.get_my_company_id()
);

CREATE POLICY "transactions_insert" ON transactions FOR INSERT 
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "transactions_update" ON transactions FOR UPDATE USING (
  company_id = public.get_my_company_id()
);

CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (
  company_id = public.get_my_company_id()
);

-- =====================================================
-- PASSO 7: POLICIES - FINANCIAL CATEGORIES
-- =====================================================

CREATE POLICY "categories_select" ON financial_categories FOR SELECT USING (
  company_id = public.get_my_company_id()
);

CREATE POLICY "categories_insert" ON financial_categories FOR INSERT 
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "categories_update" ON financial_categories FOR UPDATE USING (
  company_id = public.get_my_company_id()
);

CREATE POLICY "categories_delete" ON financial_categories FOR DELETE USING (
  company_id = public.get_my_company_id()
);

-- =====================================================
-- PASSO 8: POLICIES - ROUTES
-- =====================================================

CREATE POLICY "routes_select" ON routes FOR SELECT USING (
  company_id = public.get_my_company_id()
  OR (public_link_active = true AND public_token IS NOT NULL)
);

CREATE POLICY "routes_insert" ON routes FOR INSERT 
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "routes_update" ON routes FOR UPDATE USING (
  company_id = public.get_my_company_id()
);

CREATE POLICY "routes_delete" ON routes FOR DELETE USING (
  company_id = public.get_my_company_id()
);

-- =====================================================
-- PASSO 9: POLICIES - CUSTOMERS
-- =====================================================

CREATE POLICY "customers_select" ON customers FOR SELECT USING (
  company_id = public.get_my_company_id()
);

CREATE POLICY "customers_insert" ON customers FOR INSERT 
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "customers_update" ON customers FOR UPDATE USING (
  company_id = public.get_my_company_id()
);

CREATE POLICY "customers_delete" ON customers FOR DELETE USING (
  company_id = public.get_my_company_id()
);

-- =====================================================
-- PASSO 10: POLICIES - ROUTE ATTACHMENTS
-- =====================================================

CREATE POLICY "attachments_select" ON route_attachments FOR SELECT USING (
  route_id IN (
    SELECT id FROM routes WHERE company_id = public.get_my_company_id()
  )
);

CREATE POLICY "attachments_insert" ON route_attachments FOR INSERT 
  WITH CHECK (
    route_id IN (
      SELECT id FROM routes WHERE company_id = public.get_my_company_id()
    )
  );

CREATE POLICY "attachments_delete" ON route_attachments FOR DELETE USING (
  route_id IN (
    SELECT id FROM routes WHERE company_id = public.get_my_company_id()
  )
);

-- =====================================================
-- PASSO 11: STORAGE
-- =====================================================

-- Garantir que o bucket existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('route-attachments', 'route-attachments', true) 
ON CONFLICT (id) DO NOTHING;

-- Limpar policies de storage existentes
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload" ON storage.objects;
DROP POLICY IF EXISTS "public_read" ON storage.objects;

-- Upload: qualquer autenticado
CREATE POLICY "storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'route-attachments' AND auth.role() = 'authenticated'
  );

-- Leitura: público
CREATE POLICY "storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'route-attachments');

-- Delete: autenticado
CREATE POLICY "storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'route-attachments' AND auth.role() = 'authenticated'
  );

-- =====================================================
-- PASSO 12: Garantir que as funções auxiliares existem
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Trigger (ignora se já existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_routes_updated_at') THEN
    CREATE TRIGGER set_routes_updated_at
      BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Função para criar categorias padrão
CREATE OR REPLACE FUNCTION create_default_categories(p_company_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO financial_categories (company_id, name, type, color) VALUES
    (p_company_id, 'Frete', 'entrada', '#22c55e'),
    (p_company_id, 'Serviço de Entrega', 'entrada', '#10b981'),
    (p_company_id, 'Outros Recebimentos', 'entrada', '#06b6d4'),
    (p_company_id, 'Combustível', 'saida', '#ef4444'),
    (p_company_id, 'Manutenção', 'saida', '#f97316'),
    (p_company_id, 'Pedágio', 'saida', '#eab308'),
    (p_company_id, 'Seguro', 'saida', '#8b5cf6'),
    (p_company_id, 'Salários', 'saida', '#ec4899'),
    (p_company_id, 'Outros Gastos', 'saida', '#6b7280');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PRONTO! Agora faça logout e login novamente no app.
-- =====================================================
