import { useState, useRef } from 'react'
import { useCreateTransaction } from '@/hooks/useTransactions'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { X, Loader2, Upload, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { FinancialCategory } from '@/types'

interface TransactionModalProps {
  type: 'entrada' | 'saida'
  categories: FinancialCategory[]
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  color: 'var(--color-text)',
  fontSize: 14,
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--color-text-2)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export function TransactionModal({ type, categories, onClose }: TransactionModalProps) {
  const createTransaction = useCreateTransaction()
  const { company } = useAuth()
  const [form, setForm] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category_id: '' })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadReceipt(file: File): Promise<string | undefined> {
    if (!company) return undefined
    const ext = file.name.split('.').pop()
    const path = `${company.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('receipts').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('receipts').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Informe um valor válido')
    setUploading(true)
    try {
      let receipt_url: string | undefined
      if (receiptFile) {
        receipt_url = await uploadReceipt(receiptFile)
      }
      await createTransaction.mutateAsync({
        type,
        description: form.description || undefined,
        amount: Number(form.amount),
        date: form.date,
        category_id: form.category_id || undefined,
        receipt_url,
      })
      toast.success(`${type === 'entrada' ? 'Entrada' : 'Saída'} registrada!`)
      onClose()
    } catch (err: any) {
      console.error('[Transaction] Error:', err)
      toast.error(err?.message || 'Erro ao criar transação')
    }
    setUploading(false)
  }

  const isPending = createTransaction.isPending || uploading

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div
        className="w-full"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 0, maxWidth: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Nova {type === 'entrada' ? 'Entrada' : 'Saída'}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-3)', fontSize: 18, cursor: 'pointer', padding: 4 }}>
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Descrição */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Descrição</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Frete SP" style={inputStyle} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#303030'} />
            </div>

            {/* Valor + Data */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Valor (R$)</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0,00" required style={inputStyle} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#303030'} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Data</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#303030'} />
              </div>
            </div>

            {/* Categoria */}
            {categories.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Categoria</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#303030'}>
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* Comprovante */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Comprovante (opcional)</label>
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) setReceiptFile(e.target.files[0]) }} />
              {receiptFile ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderRadius: 8, border: '1px solid #6366f130', background: '#6366f108',
                }}>
                  <FileText style={{ width: 16, height: 16, color: '#6366f1', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receiptFile.name}</span>
                  <button type="button" onClick={() => { setReceiptFile(null); if (fileRef.current) fileRef.current.value = '' }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-text-3)', cursor: 'pointer', padding: 2 }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 14px', borderRadius: 8, border: '1px dashed var(--color-border)',
                    background: 'var(--color-bg)', color: 'var(--color-text-3)', fontSize: 13,
                    cursor: 'pointer', transition: 'all 150ms',
                  }}
                >
                  <Upload style={{ width: 14, height: 14 }} />
                  Anexar comprovante
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-2)', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isPending} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
