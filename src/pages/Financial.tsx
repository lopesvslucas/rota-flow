import { useState, useMemo, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { TransactionModal } from '@/components/financial/TransactionModal'
import { CategoryManager } from '@/components/financial/CategoryManager'
import { useTransactions, useCategories, useDeleteTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { formatCurrency, formatDate, formatMonthYear, getMonthDateRange } from '@/lib/formatters'
import {
  TrendingUp, TrendingDown, Wallet, Plus, Minus, ChevronLeft, ChevronRight,
  Trash2, Tag, ArrowUpCircle, ArrowDownCircle, Loader2, PackageOpen, Pencil, X, FileText, Upload
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export function FinancialPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'entrada' | 'saida'>('entrada')
  const [fabOpen, setFabOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editTx, setEditTx] = useState<import('@/types').Transaction | null>(null)
  const { theme } = useTheme()
  const d = theme === 'dark'

  const { data: transactions, isLoading } = useTransactions(month, year)
  const { data: categories } = useCategories()
  const deleteMutation = useDeleteTransaction()
  const updateTxMutation = useUpdateTransaction()

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
                        {tx.receipt_url && (
                          <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-accent hover:underline" onClick={e => e.stopPropagation()}>
                            <FileText className="h-3 w-3" /> Comprovante
                          </a>
                        )}
                      </div>
                    </div>
                    <p className={cn('text-[14px] font-bold tabular-nums whitespace-nowrap')} style={{ color: tx.type === 'entrada' ? '#22c55e' : '#ef4444' }}>
                      {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </p>
                    <button onClick={() => setEditTx(tx)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-[6px] text-text-3 hover:text-accent hover:bg-surface-2 transition-all duration-150">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
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

      {/* Edit transaction modal */}
      {editTx && (
        <EditTransactionModal
          transaction={editTx}
          categories={categories?.filter(c => c.type === editTx.type) ?? []}
          onClose={() => setEditTx(null)}
          onSave={async (categoryId, receiptUrl) => {
            try {
              await updateTxMutation.mutateAsync({ id: editTx.id, category_id: categoryId, receipt_url: receiptUrl })
              toast.success('Transação atualizada!')
              setEditTx(null)
            } catch { toast.error('Erro ao atualizar') }
          }}
          borderColor={borderColor}
          surfaceBg={surfaceBg}
        />
      )}
    </AppLayout>
  )
}

function EditTransactionModal({ transaction, categories, onClose, onSave, borderColor, surfaceBg }: {
  transaction: import('@/types').Transaction
  categories: import('@/types').FinancialCategory[]
  onClose: () => void
  onSave: (categoryId: string | null, receiptUrl: string | null) => Promise<void>
  borderColor: string
  surfaceBg: string
}) {
  const { company } = useAuth()
  const [selectedCat, setSelectedCat] = useState<string | null>(transaction.category_id)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(transaction.receipt_url)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadReceipt(file: File): Promise<string> {
    if (!company) throw new Error('No company')
    const ext = file.name.split('.').pop()
    const path = `${company.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('receipts').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('receipts').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    setSaving(true)
    try {
      let finalReceiptUrl = receiptUrl
      if (receiptFile) {
        finalReceiptUrl = await uploadReceipt(receiptFile)
      }
      await onSave(selectedCat, finalReceiptUrl)
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  const hasChanges = selectedCat !== transaction.category_id || receiptFile !== null || receiptUrl !== transaction.receipt_url

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full" style={{ background: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: 14, maxWidth: 440, boxShadow: '0 24px 48px rgba(0,0,0,0.5)', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Editar Transação</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-2)', marginTop: 4 }}>
              {transaction.description || (transaction.type === 'entrada' ? 'Entrada' : 'Saída')} — <span style={{ color: transaction.type === 'entrada' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{formatCurrency(Number(transaction.amount))}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-3)', cursor: 'pointer', padding: 4 }}>
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Category selection */}
        <div style={{ padding: '20px 24px 16px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>Categoria</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={() => setSelectedCat(null)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left',
                border: `1px solid ${!selectedCat ? '#6366f150' : borderColor}`,
                background: !selectedCat ? '#6366f108' : 'var(--color-bg)',
                color: 'var(--color-text)', transition: 'all 150ms',
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#888', flexShrink: 0 }} />
              Sem categoria
              {!selectedCat && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6366f1', fontWeight: 600 }}>✓</span>}
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left',
                  border: `1px solid ${selectedCat === cat.id ? '#6366f150' : borderColor}`,
                  background: selectedCat === cat.id ? '#6366f108' : 'var(--color-bg)',
                  color: 'var(--color-text)', transition: 'all 150ms',
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                {cat.name}
                {selectedCat === cat.id && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6366f1', fontWeight: 600 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Receipt section */}
        <div style={{ padding: '0 24px 20px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>Comprovante</label>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) { setReceiptFile(e.target.files[0]); setReceiptUrl(null) } }} />

          {receiptFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid #6366f130', background: '#6366f108' }}>
              <FileText style={{ width: 16, height: 16, color: '#6366f1', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receiptFile.name}</span>
              <button onClick={() => { setReceiptFile(null); if (fileRef.current) fileRef.current.value = '' }}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-3)', cursor: 'pointer', padding: 2 }}>
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ) : receiptUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid #22c55e30', background: '#22c55e08' }}>
              <FileText style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />
              <a href={receiptUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13, color: '#22c55e', textDecoration: 'none' }}>Ver comprovante atual</a>
              <button onClick={() => fileRef.current?.click()}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-3)', cursor: 'pointer', padding: 2, fontSize: 11 }}>Trocar</button>
              <button onClick={() => setReceiptUrl(null)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}>
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                padding: '12px 14px', borderRadius: 8, border: '1px dashed var(--color-border)',
                background: 'var(--color-bg)', color: 'var(--color-text-3)', fontSize: 13, cursor: 'pointer',
              }}
            >
              <Upload style={{ width: 14, height: 14 }} />
              Anexar comprovante
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 20px', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${borderColor}`, color: 'var(--color-text-2)', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving || !hasChanges}
            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (saving || !hasChanges) ? 0.5 : 1 }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

