-- ============================================
-- RotaFlow — Initial Schema
-- ============================================

-- Empresas (multi-tenant básico)
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Usuários do sistema
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'driver', 'viewer')),
  permissions jsonb DEFAULT '{"financeiro": false, "rotas": false, "usuarios": false}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company_id);

-- Categorias financeiras
CREATE TABLE financial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('entrada', 'saida')),
  color text DEFAULT '#6366f1'
);

CREATE INDEX idx_financial_categories_company ON financial_categories(company_id);

-- Transações financeiras
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('entrada', 'saida')),
  amount numeric(12,2) NOT NULL,
  description text,
  category_id uuid REFERENCES financial_categories(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Clientes
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  address text
);

CREATE INDEX idx_customers_company ON customers(company_id);

-- Rotas / Entregas
CREATE TABLE routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'entregue', 'cancelado')),
  delivery_date date,
  address_destination text,
  notes text,
  amount numeric(12,2),
  public_token text UNIQUE DEFAULT gen_random_uuid()::text,
  public_link_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_routes_company ON routes(company_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_public_token ON routes(public_token);
CREATE INDEX idx_routes_driver ON routes(driver_id);

-- Comprovantes de rotas
CREATE TABLE route_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_route_attachments_route ON route_attachments(route_id);
