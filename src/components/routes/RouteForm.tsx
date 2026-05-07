import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateRoute, useUploadAttachment } from '@/hooks/useRoutes'
import { X, Loader2, Upload, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getTodayISO, formatCurrencyInput } from '@/lib/formatters'

const schema = z.object({
  title: z.string().min(1, 'Informe o título'),
  delivery_date: z.string().optional(),
  address_destination: z.string().optional(),
  notes: z.string().optional(),
  amount: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props { onClose: () => void }

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

export function RouteFormModal({ onClose }: Props) {
  const createRoute = useCreateRoute()
  const uploadAttachment = useUploadAttachment()
  const [amountDisplay, setAmountDisplay] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { delivery_date: getTodayISO() },
  })

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, '')
    const numValue = parseInt(raw || '0', 10) / 100
    setAmountDisplay(numValue > 0 ? formatCurrencyInput(numValue) : '')
    setValue('amount', numValue > 0 ? numValue.toString() : '')
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (!selected) return
    setFiles(prev => [...prev, ...Array.from(selected)])
    e.target.value = ''
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: FormData) {
    try {
      const route = await createRoute.mutateAsync({
        title: data.title,
        delivery_date: data.delivery_date || undefined,
        address_destination: data.address_destination || undefined,
        notes: data.notes || undefined,
        amount: data.amount ? parseFloat(data.amount) : undefined,
      })

      // Upload files after route creation
      if (files.length > 0 && route?.id) {
        for (const file of files) {
          try {
            await uploadAttachment.mutateAsync({ routeId: route.id, file })
          } catch {
            toast.error(`Erro ao enviar: ${file.name}`)
          }
        }
      }

      toast.success('Rota criada!')
      onClose()
    } catch { toast.error('Erro ao criar rota') }
  }

  const isSubmitting = createRoute.isPending || uploadAttachment.isPending

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div
        className="w-full max-h-[90vh] overflow-y-auto"
        style={{ background: '#1c1c1c', border: '1px solid #303030', borderRadius: 14, padding: 0, maxWidth: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #303030', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f5f5f5' }}>Nova Rota</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: 18, cursor: 'pointer', padding: 4 }}>
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Título */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Título *</label>
              <input {...register('title')} placeholder="Ex: Entrega Centro" style={{ ...inputStyle, borderColor: errors.title ? '#ef4444' : '#303030' }} />
              {errors.title && <p style={{ fontSize: 12, color: '#ef4444' }}>{errors.title.message}</p>}
            </div>

            {/* Data + Valor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Data</label>
                <input {...register('delivery_date')} type="date" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Valor</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 500, color: '#555' }}>R$</span>
                  <input type="text" value={amountDisplay} onChange={handleAmountChange} placeholder="0,00" style={{ ...inputStyle, paddingLeft: 40 }} />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Endereço destino</label>
              <input {...register('address_destination')} placeholder="Rua, número, bairro" style={inputStyle} />
            </div>

            {/* Observações */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Observações</label>
              <textarea {...register('notes')} rows={3} placeholder="Notas adicionais..." style={{ ...inputStyle, resize: 'none' }} />
            </div>

            {/* Comprovante - Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={labelStyle}>Comprovante</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 16px',
                  background: '#141414',
                  border: '2px dashed #303030',
                  borderRadius: 10,
                  color: '#666',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#999'; e.currentTarget.style.background = '#1a1a2e' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#303030'; e.currentTarget.style.color = '#666'; e.currentTarget.style.background = '#141414' }}
              >
                <Upload style={{ width: 16, height: 16 }} />
                Anexar arquivo (imagem ou PDF)
              </button>

              {/* File list */}
              {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {files.map((file, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px',
                      background: '#181818',
                      border: '1px solid #282828',
                      borderRadius: 8,
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#6366f115', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText style={{ width: 14, height: 14, color: '#6366f1' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                        <p style={{ fontSize: 10, color: '#555' }}>{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={() => removeFile(i)}
                        style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: 4, borderRadius: 6 }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px 20px', borderTop: '1px solid #303030', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid #303030', color: '#888', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: isSubmitting ? 0.5 : 1 }}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Rota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
