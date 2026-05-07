-- =====================================================
-- RotaFlow: Supabase Setup SQL
-- Execute this in Supabase SQL Editor
-- =====================================================

-- Enable RLS on all tables (if not already)
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS route_attachments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMPANIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their company" ON companies;
CREATE POLICY "Users can view their company" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert companies" ON companies;
CREATE POLICY "Users can insert companies" ON companies
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can update company" ON companies;
CREATE POLICY "Owners can update company" ON companies
  FOR UPDATE USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'owner')
  );

-- =====================================================
-- USERS
-- =====================================================
DROP POLICY IF EXISTS "Users can view company members" ON users;
CREATE POLICY "Users can view company members" ON users
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert users" ON users;
CREATE POLICY "Users can insert users" ON users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update themselves or admins can update" ON users;
CREATE POLICY "Users can update themselves or admins can update" ON users
  FOR UPDATE USING (
    id = auth.uid()
    OR company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

DROP POLICY IF EXISTS "Owners can delete users" ON users;
CREATE POLICY "Owners can delete users" ON users
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'owner')
  );

-- =====================================================
-- TRANSACTIONS
-- =====================================================
DROP POLICY IF EXISTS "Users can view company transactions" ON transactions;
CREATE POLICY "Users can view company transactions" ON transactions
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;
CREATE POLICY "Users can insert transactions" ON transactions
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete transactions" ON transactions;
CREATE POLICY "Users can delete transactions" ON transactions
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- =====================================================
-- FINANCIAL CATEGORIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view company categories" ON financial_categories;
CREATE POLICY "Users can view company categories" ON financial_categories
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert categories" ON financial_categories;
CREATE POLICY "Users can insert categories" ON financial_categories
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update categories" ON financial_categories;
CREATE POLICY "Users can update categories" ON financial_categories
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete categories" ON financial_categories;
CREATE POLICY "Users can delete categories" ON financial_categories
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- =====================================================
-- ROUTES
-- =====================================================
DROP POLICY IF EXISTS "Users can view company routes" ON routes;
CREATE POLICY "Users can view company routes" ON routes
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR (public_link_active = true AND public_token IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users can insert routes" ON routes;
CREATE POLICY "Users can insert routes" ON routes
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update routes" ON routes;
CREATE POLICY "Users can update routes" ON routes
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete routes" ON routes;
CREATE POLICY "Users can delete routes" ON routes
  FOR DELETE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- =====================================================
-- CUSTOMERS
-- =====================================================
DROP POLICY IF EXISTS "Users can view company customers" ON customers;
CREATE POLICY "Users can view company customers" ON customers
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert customers" ON customers;
CREATE POLICY "Users can insert customers" ON customers
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- =====================================================
-- ROUTE ATTACHMENTS
-- =====================================================
DROP POLICY IF EXISTS "Users can view route attachments" ON route_attachments;
CREATE POLICY "Users can view route attachments" ON route_attachments
  FOR SELECT USING (
    route_id IN (
      SELECT id FROM routes WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert route attachments" ON route_attachments;
CREATE POLICY "Users can insert route attachments" ON route_attachments
  FOR INSERT WITH CHECK (
    route_id IN (
      SELECT id FROM routes WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete route attachments" ON route_attachments;
CREATE POLICY "Users can delete route attachments" ON route_attachments
  FOR DELETE USING (
    route_id IN (
      SELECT id FROM routes WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- Storage policies for route-attachments bucket
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('route-attachments', 'route-attachments', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'route-attachments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;
CREATE POLICY "Anyone can view attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'route-attachments');
