import { useState, useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { TransactionModal } from '@/components/financial/TransactionModal'
import { CategoryManager } from '@/components/financial/CategoryManager'
import { useTransactions, useCategories, useDeleteTransaction } from '@/hooks/useTransactions'
import { formatCurrency, formatDate, formatMonthYear, getMonthDateRange } from '@/lib/formatters'
import {
  TrendingUp, TrendingDown, Wallet, Plus, Minus, ChevronLeft, ChevronRight,
  Trash2, Tag, ArrowUpCircle, ArrowDownCircle, Loader2, PackageOpen
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTheme } from '@/hooks/useTheme'

export function FinancialPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'entrada' | 'saida'>('entrada')
  const [fabOpen, setFabOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const { theme } = useTheme()
  const d = theme === 'dark'

  const { data: transactions, isLoading } = useTransactions(month, year)
  const { data: categories } = useCategories()
  const deleteMutation = useDeleteTransaction()

  // Monthly totals
  const monthEntradas = transactions?.filter(t => t.type === 'entrada').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const monthSaidas = transactions?.filter(t => t.type === 'saida').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const saldo = monthEntradas - monthSaidas

  const dailyData = useMemo(() => {
    if (!transactions?.length) return []
    const { startDate, endDate } = getMonthDateRange(month, year)
    const days: Record<string, { day: string; entradas: number; saidas: number }> = {}
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')
    for (let dd = new Date(start); dd <= end; dd.setDate(dd.getDate() + 1)) {
      const key = dd.getDate().toString().padStart(2, '0')
      days[key] = { day: key, entradas: 0, saidas: 0 }
    }
    transactions.forEach(t => {
      const day = new Date(t.date + 'T00:00:00').getDate().toString().padStart(2, '0')
      if (days[day]) {
        if (t.type === 'entrada') days[day].entradas += Number(t.amount)
        else days[day].saidas += Number(t.amount)
      }
    })
    return Object.values(days)
  }, [transactions, month, year])

  const categoryData = useMemo(() => {
    if (!transactions?.length) return []
    const map: Record<string, { name: string; value: number; color: string }> = {}
    transactions.forEach(t => {
      const catName = t.category?.name ?? 'Sem categoria'
      const catColor = t.category?.color ?? '#555555'
      if (!map[catName]) map[catName] = { name: catName, value: 0, color: catColor }
      map[catName].value += Number(t.amount)
    })
    return Object.values(map).sort((a, b) => b.value - a.value)
  }, [transactions])

  function prevMonth() { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
  function openModal(type: 'entrada' | 'saida') { setModalType(type); setModalOpen(true); setFabOpen(false) }

  async function handleDelete(id: string) {
    try { await deleteMutation.mutateAsync(id); toast.success('Transação excluída'); setDeleteConfirm(null) }
    catch { toast.error('Erro ao excluir') }
  }

  // Theme-aware
  const gridColor = d ? '#303030' : '#e2e2e5'
  const tickColor = d ? '#555555' : '#999999'
  const borderColor = 'var(--color-border)'
  const surfaceBg = 'var(--color-surface)'
  const navBtnBg = d ? '#222' : '#f0f0f2'
  const navBtnText = d ? '#f5f5f5' : '#1a1a1a'

  const hasData = !!transactions?.length

  return (
    <AppLayout title="Financeiro">
      <div>
        {/* Month nav + actions */}
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 24 }}>
          <div className="flex items-center gap-0" style={{ background: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: 10, padding: 4 }}>
            <button onClick={prevMonth} style={{ padding: '8px 10px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-2)', display: 'flex', alignItems: 'center' }} onMouseEnter={e => { e.currentTarget.style.background = navBtnBg; e.currentTarget.style.color = navBtnText }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-2)' }}><ChevronLeft className="h-4 w-4" /></button>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 130, textAlign: 'center', textTransform: 'capitalize', color: 'var(--color-text)', padding: '0 8px' }}>{formatMonthYear(month, year)}</span>
            <button onClick={nextMonth} style={{ padding: '8px 10px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-2)', display: 'flex', alignItems: 'center' }} onMouseEnter={e => { e.currentTarget.style.background = navBtnBg; e.currentTarget.style.color = navBtnText }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-2)' }}><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCategories(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: `1px solid ${borderColor}`, background: surfaceBg, color: 'var(--color-text-2)', cursor: 'pointer', transition: 'all 150ms' }} onMouseEnter={e => { e.currentTarget.style.background = navBtnBg; e.currentTarget.style.color = navBtnText }} onMouseLeave={e => { e.currentTarget.style.background = surfaceBg; e.currentTarget.style.color = 'var(--color-text-2)' }}>
              <Tag className="h-3.5 w-3.5" /> Categorias
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="h-5 w-5 animate-spin text-text-3" /></div>
        ) : !hasData ? (
          /* Empty state */
          <div className="rounded-[10px] border overflow-hidden" style={{ background: surfaceBg, borderColor }}>
            <div className="py-[80px] px-5 text-center flex flex-col items-center gap-4">
              <PackageOpen className="empty-icon" />
              <div>
                <p className="text-[17px] font-bold text-text">Nenhuma transação em {formatMonthYear(month, year)}</p>
                <p className="text-[13px] text-text-3 mt-1">Use o botão + para registrar entradas e saídas</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => openModal('entrada')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: 'white', background: '#22c55e', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 3px 10px rgba(34,197,94,0.25)' }}>
                  <Plus className="h-4 w-4" /> Entrada
                </button>
                <button onClick={() => openModal('saida')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: 'white', background: '#ef4444', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 3px 10px rgba(239,68,68,0.25)' }}>
                  <Minus className="h-4 w-4" /> Saída
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: `Entradas de ${formatMonthYear(month, year)}`, value: formatCurrency(monthEntradas), icon: TrendingUp, iconColor: '#22c55e', iconBg: '#22c55e20', valueColor: '#22c55e' },
                { label: `Saídas de ${formatMonthYear(month, year)}`, value: formatCurrency(monthSaidas), icon: TrendingDown, iconColor: '#ef4444', iconBg: '#ef444420', valueColor: '#ef4444' },
                { label: 'Saldo do mês', value: formatCurrency(saldo), icon: Wallet, iconColor: '#6366f1', iconBg: '#6366f120', valueColor: saldo >= 0 ? '#22c55e' : '#ef4444' },
              ].map(s => (
                <div key={s.label} style={{ padding: 20, border: `1px solid ${borderColor}`, borderRadius: 10, background: surfaceBg }}>
                  <div className="flex items-center justify-center rounded-[9px] mb-4" style={{ width: 38, height: 38, background: s.iconBg }}>
                    <s.icon className="h-[18px] w-[18px]" style={{ color: s.iconColor }} />
                  </div>
                  <p className="text-[22px] md:text-[34px] font-extrabold leading-none" style={{ color: s.valueColor }}>{s.value}</p>
                  <p className="text-[13px] mt-2" style={{ color: 'var(--color-text-2)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ border: `1px solid ${borderColor}`, borderRadius: 10, padding: 20, background: surfaceBg }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 16 }}>Entradas vs Saídas — {formatMonthYear(month, year)}</h4>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
                      <YAxis tick={{ fontSize: 10, fill: tickColor }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
                      <Tooltip
                        contentStyle={{ background: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: 8, fontSize: 12, color: 'var(--color-text)' }}
                        formatter={(v) => formatCurrency(Number(v))}
                        labelStyle={{ color: 'var(--color-text-2)' }}
                        cursor={{ fill: d ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)' }}
                      />
                      <Bar dataKey="entradas" fill="#22c55e" radius={[3, 3, 0, 0]} name="Entradas" />
                      <Bar dataKey="saidas" fill="#ef4444" radius={[3, 3, 0, 0]} name="Saídas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ border: `1px solid ${borderColor}`, borderRadius: 10, padding: 20, background: surfaceBg }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 16 }}>Por categoria</h4>
                <div style={{ height: 220 }}>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" nameKey="name" paddingAngle={3} strokeWidth={0}>
                          {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: 8, fontSize: 12, color: 'var(--color-text)' }} formatter={(v) => formatCurrency(Number(v))} />
                        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v: string) => <span style={{ color: 'var(--color-text-2)' }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3">
                      <Tag className="empty-icon" />
                      <span className="text-[13px] text-text-3">Sem categorias</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Transactions list */}
            <div style={{ border: `1px solid ${borderColor}`, borderRadius: 10, background: surfaceBg, overflow: 'hidden' }}>
              <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: `1px solid ${borderColor}`, fontSize: 13, fontWeight: 600 }}>
                <h4 className="text-text">Transações de {formatMonthYear(month, year)}</h4>
                <span className="text-text-3 font-medium rounded-[10px] border px-2.5 py-0.5" style={{ borderColor, fontSize: 12 }}>{transactions?.length ?? 0}</span>
              </div>
              <div>
                {transactions!.slice(0, 30).map((tx, i) => (
                  <div key={tx.id} className={cn('flex items-center gap-3 hover:bg-surface-2 transition-colors duration-150 group')} style={{ padding: '14px 20px', borderBottom: i < Math.min(transactions!.length, 30) - 1 ? `1px solid ${borderColor}` : 'none' }}>
                    <div className="flex items-center justify-center rounded-[9px] shrink-0" style={{ width: 34, height: 34, background: tx.type === 'entrada' ? '#22c55e20' : '#ef444420' }}>
                      {tx.type === 'entrada' ? <ArrowUpCircle className="h-4 w-4" style={{ color: '#22c55e' }} /> : <ArrowDownCircle className="h-4 w-4" style={{ color: '#ef4444' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium truncate text-text">{tx.description || (tx.type === 'entrada' ? 'Entrada' : 'Saída')}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tx.category && (
                          <span className="flex items-center gap-1 text-[11px] text-text-2">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: tx.category.color }} />
                            {tx.category.name}
                          </span>
                        )}
                        <span className="text-[11px] text-text-3">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                    <p className={cn('text-[14px] font-bold tabular-nums whitespace-nowrap')} style={{ color: tx.type === 'entrada' ? '#22c55e' : '#ef4444' }}>
                      {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </p>
                    <button onClick={() => setDeleteConfirm(tx.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[6px] text-text-3 hover:text-red hover:bg-surface-2 transition-all duration-150">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-24 md:bottom-7 right-7 z-50 flex flex-col items-end gap-2.5">
        {fabOpen && (
          <>
            <button onClick={() => openModal('entrada')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px 10px 14px', fontSize: 13, fontWeight: 600, color: 'white', background: '#22c55e', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.3)', transition: 'all 150ms' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.4)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(34,197,94,0.3)' }}>
              <Plus className="h-4 w-4" /> Entrada
            </button>
            <button onClick={() => openModal('saida')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px 10px 14px', fontSize: 13, fontWeight: 600, color: 'white', background: '#ef4444', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 4px 14px rgba(239,68,68,0.3)', transition: 'all 150ms' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.3)' }}>
              <Minus className="h-4 w-4" /> Saída
            </button>
          </>
        )}
        <button
          onClick={() => setFabOpen(f => !f)}
          className={cn('flex items-center justify-center text-white transition-all duration-200 hover:scale-110', fabOpen && 'rotate-45')}
          style={{ width: 54, height: 54, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 16, cursor: 'pointer', boxShadow: '0 6px 20px rgba(99,102,241,0.4)', fontSize: 24 }}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {modalOpen && <TransactionModal type={modalType} categories={categories?.filter(c => c.type === modalType) ?? []} onClose={() => setModalOpen(false)} />}
      {showCategories && <CategoryManager onClose={() => setShowCategories(false)} />}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: 14, padding: 0, maxWidth: 480, width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Excluir transação?</h3>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p className="text-[13px] text-text-2">Essa ação não pode ser desfeita.</p>
            </div>
            <div style={{ padding: '16px 24px 20px', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: 'transparent', border: `1px solid ${borderColor}`, color: 'var(--color-text-2)', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
