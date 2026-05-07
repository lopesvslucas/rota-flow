-- ============================================
-- RotaFlow — Functions & Triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_routes_updated_at
  BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
