export interface Company {
  id: string
  name: string
  logo_url: string | null
  created_at: string
}

export type UserRole = 'owner' | 'admin' | 'driver' | 'viewer'

export interface UserPermissions {
  financeiro: boolean
  rotas: boolean
  usuarios: boolean
}

export interface User {
  id: string
  company_id: string
  email: string
  name: string | null
  tag: string | null
  role: UserRole
  permissions: UserPermissions
  created_at: string
}

export interface FinancialCategory {
  id: string
  company_id: string
  name: string
  type: 'entrada' | 'saida'
  color: string
}

export interface Transaction {
  id: string
  company_id: string
  type: 'entrada' | 'saida'
  amount: number
  description: string | null
  category_id: string | null
  date: string
  created_by: string | null
  created_at: string
  category?: FinancialCategory
}

export interface Customer {
  id: string
  company_id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
}

export type RouteStatus = 'pendente' | 'em_andamento' | 'entregue' | 'cancelado'

export interface Route {
  id: string
  company_id: string
  title: string
  customer_id: string | null
  driver_id: string | null
  status: RouteStatus
  delivery_date: string | null
  address_destination: string | null
  notes: string | null
  amount: number | null
  public_token: string
  public_link_active: boolean
  payment_confirmed: boolean
  payment_confirmed_at: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  driver?: User
}

export interface RouteAttachment {
  id: string
  route_id: string
  file_name: string
  file_url: string
  file_type: string | null
  uploaded_by: string | null
  created_at: string
}

export interface MonthFilter {
  month: number
  year: number
}
