-- ============================================
-- RotaFlow — RLS Policies
-- ============================================

CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$;

-- COMPANIES
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own company" ON companies FOR SELECT USING (id = get_my_company_id());
CREATE POLICY "Authenticated users can create a company" ON companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owners can update their company" ON companies FOR UPDATE USING (id = get_my_company_id());

-- USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view members of their company" ON users FOR SELECT
  USING (company_id = get_my_company_id() OR id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Authenticated users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owners and admins can update users in their company" ON users FOR UPDATE
  USING (company_id = get_my_company_id() AND (id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin'))));
CREATE POLICY "Owners can delete users from their company" ON users FOR DELETE
  USING (company_id = get_my_company_id() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner') AND id != auth.uid());

-- FINANCIAL_CATEGORIES
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fc_select" ON financial_categories FOR SELECT USING (company_id = get_my_company_id());
CREATE POLICY "fc_insert" ON financial_categories FOR INSERT WITH CHECK (company_id = get_my_company_id());
CREATE POLICY "fc_update" ON financial_categories FOR UPDATE USING (company_id = get_my_company_id());
CREATE POLICY "fc_delete" ON financial_categories FOR DELETE USING (company_id = get_my_company_id());

-- TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx_select" ON transactions FOR SELECT USING (company_id = get_my_company_id());
CREATE POLICY "tx_insert" ON transactions FOR INSERT WITH CHECK (company_id = get_my_company_id());
CREATE POLICY "tx_update" ON transactions FOR UPDATE USING (company_id = get_my_company_id());
CREATE POLICY "tx_delete" ON transactions FOR DELETE USING (company_id = get_my_company_id());

-- CUSTOMERS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cust_select" ON customers FOR SELECT USING (company_id = get_my_company_id());
CREATE POLICY "cust_insert" ON customers FOR INSERT WITH CHECK (company_id = get_my_company_id());
CREATE POLICY "cust_update" ON customers FOR UPDATE USING (company_id = get_my_company_id());
CREATE POLICY "cust_delete" ON customers FOR DELETE USING (company_id = get_my_company_id());

-- ROUTES
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes_select" ON routes FOR SELECT USING (company_id = get_my_company_id());
CREATE POLICY "routes_public" ON routes FOR SELECT USING (public_link_active = true);
CREATE POLICY "routes_insert" ON routes FOR INSERT WITH CHECK (company_id = get_my_company_id());
CREATE POLICY "routes_update" ON routes FOR UPDATE USING (company_id = get_my_company_id());
CREATE POLICY "routes_delete" ON routes FOR DELETE USING (company_id = get_my_company_id());

-- ROUTE_ATTACHMENTS
ALTER TABLE route_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ra_select" ON route_attachments FOR SELECT
  USING (EXISTS (SELECT 1 FROM routes WHERE routes.id = route_attachments.route_id AND routes.company_id = get_my_company_id()));
CREATE POLICY "ra_public" ON route_attachments FOR SELECT
  USING (EXISTS (SELECT 1 FROM routes WHERE routes.id = route_attachments.route_id AND routes.public_link_active = true));
CREATE POLICY "ra_insert" ON route_attachments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM routes WHERE routes.id = route_attachments.route_id AND routes.company_id = get_my_company_id()));
CREATE POLICY "ra_delete" ON route_attachments FOR DELETE
  USING (EXISTS (SELECT 1 FROM routes WHERE routes.id = route_attachments.route_id AND routes.company_id = get_my_company_id()));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE routes;
