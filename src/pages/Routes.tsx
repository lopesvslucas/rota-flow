import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RouteFormModal } from '@/components/routes/RouteForm'
import { useRoutes } from '@/hooks/useRoutes'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Plus, Truck, CheckCircle2, Clock, XCircle, Loader2, DollarSign, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RouteStatus } from '@/types'

const statusConfig: Record<RouteStatus, { label: string; badgeClass: string; iconColor: string; iconBg: string; icon: typeof Clock }> = {
  pendente:     { label: 'Pendente',      badgeClass: 'badge-pendente',  iconColor: '#f59e0b', iconBg: '#f59e0b20', icon: Clock },
  em_andamento: { label: 'Em andamento',  badgeClass: 'badge-andamento', iconColor: '#3b82f6', iconBg: '#3b82f620', icon: Truck },
  entregue:     { label: 'Entregue',      badgeClass: 'badge-entregue',  iconColor: '#22c55e', iconBg: '#22c55e20', icon: CheckCircle2 },
  cancelado:    { label: 'Cancelado',     badgeClass: 'badge-cancelado', iconColor: '#888888', iconBg: '#55555520', icon: XCircle },
}

export function RoutesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const { data: routes, isLoading } = useRoutes({ status: statusFilter || undefined })

  const today = new Date().toISOString().split('T')[0]
  const todayRoutes = routes?.filter(r => r.delivery_date === today).length ?? 0
  const emAndamento = routes?.filter(r => r.status === 'em_andamento').length ?? 0
  const entregues = routes?.filter(r => r.status === 'entregue').length ?? 0
  const faturamento = routes?.filter(r => r.status === 'entregue').reduce((s, r) => s + Number(r.amount ?? 0), 0) ?? 0

  return (
    <AppLayout title="Rotas">
      <div className="min-w-0">
        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Hoje', value: todayRoutes, icon: Clock, iconColor: '#f59e0b', iconBg: '#f59e0b20' },
            { label: 'Em andamento', value: emAndamento, icon: Truck, iconColor: '#3b82f6', iconBg: '#3b82f620' },
            { label: 'Concluídas', value: entregues, icon: CheckCircle2, iconColor: '#22c55e', iconBg: '#22c55e20' },
            { label: 'Faturamento', value: formatCurrency(faturamento), icon: DollarSign, iconColor: '#6366f1', iconBg: '#6366f120', isMonetary: true },
          ].map(s => (
            <div key={s.label} style={{ padding: 20, border: '1px solid #303030', borderRadius: 10, background: '#1c1c1c' }}>
              <div className="flex items-center justify-center rounded-[9px] mb-4" style={{ width: 38, height: 38, background: s.iconBg }}>
                <s.icon className="h-[18px] w-[18px]" style={{ color: s.iconColor }} />
              </div>
              <p className="text-[34px] font-extrabold leading-none" style={{ color: 'isMonetary' in s ? s.iconColor : '#f5f5f5' }}>{s.value}</p>
              <p className="text-[13px] mt-2" style={{ color: '#999999' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs + button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ background: '#1c1c1c', border: '1px solid #303030', borderRadius: 10, padding: 4, display: 'inline-flex', gap: 2 }}>
            {[
              { value: '', label: 'Todos' },
              { value: 'pendente', label: 'Pendente' },
              { value: 'em_andamento', label: 'Em andamento' },
              { value: 'entregue', label: 'Entregue' },
              { value: 'cancelado', label: 'Cancelado' },
            ].map(s => (
              <button key={s.value} onClick={() => setStatusFilter(s.value)}
                style={statusFilter === s.value
                  ? { padding: '7px 16px', borderRadius: 7, fontSize: 13, color: '#f5f5f5', background: '#282828', border: '1px solid #383838', fontWeight: 600, cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap' as const }
                  : { padding: '7px 16px', borderRadius: 7, fontSize: 13, color: '#777', background: 'transparent', border: '1px solid transparent', fontWeight: 500, cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap' as const }
                }
                onMouseEnter={e => { if (statusFilter !== s.value) { e.currentTarget.style.color = '#bbb'; e.currentTarget.style.background = '#1f1f1f' } }}
                onMouseLeave={e => { if (statusFilter !== s.value) { e.currentTarget.style.color = '#777'; e.currentTarget.style.background = 'transparent' } }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)', transition: 'all 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)' }}
          >
            <Plus className="h-4 w-4" /> Nova Rota
          </button>
        </div>

        {/* Routes list */}
        <div style={{ border: '1px solid #303030', borderRadius: 10, background: '#1c1c1c', overflow: 'hidden' }}>
          {isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-text-3" /></div>
          ) : !routes?.length ? (
            <div className="py-[60px] px-5 text-center flex flex-col items-center gap-3">
              <Truck className="empty-icon" />
              <p className="text-[15px] font-semibold text-text-2">Nenhuma rota encontrada</p>
              <p className="text-[13px] text-text-3">Crie sua primeira rota clicando em "Nova Rota"</p>
              <button onClick={() => setShowForm(true)}
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)', transition: 'all 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)' }}
              >
                <Plus className="h-4 w-4" /> Criar primeira rota
              </button>
            </div>
          ) : (
            <div>
              {routes.map((route, i) => {
                const cfg = statusConfig[route.status]
                const StatusIcon = cfg.icon
                return (
                  <Link key={route.id} to={`/rotas/${route.id}`}
                    className="flex items-center gap-3 hover:bg-surface-2 transition-colors duration-150 group"
                    style={{ padding: '14px 20px', borderBottom: i < routes.length - 1 ? '1px solid #303030' : 'none' }}
                  >
                    <div className="flex items-center justify-center rounded-[9px] shrink-0" style={{ width: 34, height: 34, background: cfg.iconBg }}>
                      <StatusIcon className="h-4 w-4" style={{ color: cfg.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium truncate text-text">{route.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-text-3 flex-wrap">
                        {route.customer && <span>{route.customer.name}</span>}
                        {route.driver && <span>• {route.driver.name}</span>}
                        {route.delivery_date && <span>• {formatDate(route.delivery_date)}</span>}
                      </div>
                    </div>
                    <span className={cn('badge hidden sm:inline-flex', cfg.badgeClass)}>{cfg.label}</span>
                    {route.amount && <span className="text-[14px] font-bold hidden md:block" style={{ color: '#22c55e' }}>{formatCurrency(Number(route.amount))}</span>}
                    <ChevronRight className="h-4 w-4 text-text-3 opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && <RouteFormModal onClose={() => setShowForm(false)} />}
    </AppLayout>
  )
}
