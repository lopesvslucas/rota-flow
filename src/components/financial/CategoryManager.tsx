import { useState } from 'react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useTransactions'
import { X, Plus, Trash2, Loader2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props { onClose: () => void }

const COLORS = ['#6366f1','#22c55e','#ef4444','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#06b6d4','#f97316','#6b7280']

const inputStyle: React.CSSProperties = {
  background: '#141414',
  border: '1px solid #303030',
  borderRadius: 8,
  color: '#f5f5f5',
  fontSize: 14,
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export function CategoryManager({ onClose }: Props) {
  const { data: categories } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [name, setName] = useState('')
  const [type, setType] = useState<'entrada' | 'saida'>('entrada')
  const [color, setColor] = useState(COLORS[0])
  const [editId, setEditId] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) return
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, name, type, color })
        toast.success('Categoria atualizada')
        setEditId(null)
      } else {
        await createMutation.mutateAsync({ name, type, color })
        toast.success('Categoria criada')
      }
      setName(''); setColor(COLORS[0])
    } catch { toast.error('Erro ao salvar') }
  }

  async function handleDelete(id: string) {
    try { await deleteMutation.mutateAsync(id); toast.success('Categoria excluída') }
    catch { toast.error('Erro ao excluir') }
  }

  function startEdit(cat: { id: string; name: string; type: 'entrada' | 'saida'; color: string }) {
    setEditId(cat.id); setName(cat.name); setType(cat.type); setColor(cat.color)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div
        className="w-full max-h-[85vh] flex flex-col"
        style={{ background: '#1c1c1c', border: '1px solid #303030', borderRadius: 14, padding: 0, maxWidth: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #303030', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="shrink-0">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f5f5f5' }}>Categorias</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: 18, cursor: 'pointer', padding: 4 }}>
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Add/Edit form */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #303030', display: 'flex', flexDirection: 'column', gap: 16 }} className="shrink-0">
          <div className="flex gap-3">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <label style={labelStyle}>Nome</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da categoria" style={inputStyle} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#303030'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 120 }}>
              <label style={labelStyle}>Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as 'entrada' | 'saida')} style={inputStyle} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#303030'}>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span style={labelStyle}>Cor:</span>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={cn('h-6 w-6 rounded-full transition-all duration-150', color === c && 'ring-2 ring-offset-2')}
                style={{ backgroundColor: c, ringColor: c, ringOffsetColor: '#1c1c1c' }} />
            ))}
          </div>
          <button onClick={handleSave} disabled={!name.trim() || createMutation.isPending}
            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (!name.trim() || createMutation.isPending) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}
          >
            {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {editId ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {categories?.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-3 hover:bg-surface-2 transition-colors duration-150" style={{ padding: '14px 20px', borderBottom: i < (categories.length - 1) ? '1px solid #303030' : 'none' }}>
              <span className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-[14px] font-medium flex-1 text-text">{cat.name}</span>
              <span className={cn('badge', cat.type === 'entrada' ? 'badge-entregue' : 'badge-cancelado')}>
                {cat.type === 'entrada' ? 'Entrada' : 'Saída'}
              </span>
              <button onClick={() => startEdit(cat)} className="p-2 rounded-[7px] text-text-3 hover:text-text hover:bg-surface-2 transition-colors duration-150"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-[7px] text-text-3 hover:text-red hover:bg-surface-2 transition-colors duration-150"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
