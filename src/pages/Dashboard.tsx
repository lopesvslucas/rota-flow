import { AppLayout } from '@/components/layout/AppLayout'
import { useTodayTransactions } from '@/hooks/useTransactions'
import { useRoutes } from '@/hooks/useRoutes'
import { useTheme } from '@/hooks/useTheme'
import { formatCurrency } from '@/lib/formatters'
import { TrendingUp, TrendingDown, Truck, Clock, ArrowRight, Wallet, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { data: todayTx } = useTodayTransactions()
  const { data: routes } = useRoutes()
  const { theme } = useTheme()
  const d = theme === 'dark'

  const todayEntradas = todayTx?.filter(t => t.type === 'entrada').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const todaySaidas = todayTx?.filter(t => t.type === 'saida').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const emAndamento = routes?.filter(r => r.status === 'em_andamento').length ?? 0
  const pendentes = routes?.filter(r => r.status === 'pendente').length ?? 0

  const bg = d ? '#1c1c1c' : '#ffffff'
  const border = d ? '#303030' : '#e2e2e5'
  const textMain = d ? '#f5f5f5' : '#1a1a1a'
  const textSub = d ? '#999' : '#666'

  const stats = [
    { label: 'Entradas hoje', value: formatCurrency(todayEntradas), icon: TrendingUp, iconColor: '#22c55e', iconBg: '#22c55e20', valueColor: '#22c55e' },
    { label: 'Saídas hoje', value: formatCurrency(todaySaidas), icon: TrendingDown, iconColor: '#ef4444', iconBg: '#ef444420', valueColor: '#ef4444' },
    { label: 'Em andamento', value: emAndamento.toString(), icon: Truck, iconColor: '#3b82f6', iconBg: '#3b82f620', valueColor: textMain },
    { label: 'Pendentes', value: pendentes.toString(), icon: Clock, iconColor: '#f59e0b', iconBg: '#f59e0b20', valueColor: textMain },
  ]

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stat cards - responsive grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{ padding: 20, background: bg, border: `1px solid ${border}`, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 9, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <s.icon style={{ color: s.iconColor, width: 18, height: 18 }} />
              </div>
              <p style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, color: s.valueColor }}>
                {s.value}
              </p>
              <p style={{ fontSize: 13, marginTop: 8, color: textSub }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links - responsive */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <Link
            to="/financeiro"
            style={{ padding: 20, background: bg, border: `1px solid ${border}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', transition: 'all 150ms' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 9, background: '#6366f120', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet style={{ width: 20, height: 20, color: '#6366f1' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontWeight: 600, fontSize: 14, color: textMain }}>Controle Financeiro</h4>
              <p style={{ fontSize: 13, color: textSub, marginTop: 2 }}>Lançamentos, gráficos e categorias</p>
            </div>
            <ArrowRight style={{ width: 16, height: 16, color: textSub, flexShrink: 0 }} />
          </Link>

          <Link
            to="/rotas"
            style={{ padding: 20, background: bg, border: `1px solid ${border}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', transition: 'all 150ms' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 9, background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BarChart3 style={{ width: 20, height: 20, color: '#3b82f6' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontWeight: 600, fontSize: 14, color: textMain }}>Controle de Rotas</h4>
              <p style={{ fontSize: 13, color: textSub, marginTop: 2 }}>Entregas, motoristas e comprovantes</p>
            </div>
            <ArrowRight style={{ width: 16, height: 16, color: textSub, flexShrink: 0 }} />
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
