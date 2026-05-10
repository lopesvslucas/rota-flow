-- Fix for route_attachments, customers, and companies not being visible in the public link
-- This drops the existing policies and replaces them with ones that also allow reading if the route is public.

DROP POLICY IF EXISTS "attachments_select" ON route_attachments;
CREATE POLICY "attachments_select" ON route_attachments FOR SELECT USING (
  route_id IN (
    SELECT id FROM routes WHERE company_id = public.get_my_company_id()
    OR (public_link_active = true AND public_token IS NOT NULL)
  )
);

DROP POLICY IF EXISTS "customers_select" ON customers;
CREATE POLICY "customers_select" ON customers FOR SELECT USING (
  company_id = public.get_my_company_id()
  OR id IN (
    SELECT customer_id FROM routes WHERE public_link_active = true AND public_token IS NOT NULL
  )
);

DROP POLICY IF EXISTS "companies_select" ON companies;
CREATE POLICY "companies_select" ON companies FOR SELECT USING (
  id = public.get_my_company_id()
  OR id IN (
    SELECT company_id FROM routes WHERE public_link_active = true AND public_token IS NOT NULL
  )
);


