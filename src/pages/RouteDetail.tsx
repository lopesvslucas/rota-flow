import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { useRoute, useUpdateRoute, useRouteAttachments, useUploadAttachment, useDeleteAttachment, useDeleteRoute } from '@/hooks/useRoutes'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { useTheme } from '@/hooks/useTheme'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, Download, Trash2, Link2, Copy, Check, Loader2, MapPin, User, Calendar, FileText, Truck, DollarSign, StickyNote, ExternalLink, BadgeCheck, CircleDollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { RouteStatus } from '@/types'

const statuses: { value: RouteStatus; label: string; color: string; bg: string; border: string }[] = [
  { value: 'pendente',     label: 'Pendente',      color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b30' },
  { value: 'em_andamento', label: 'Em andamento',  color: '#3b82f6', bg: '#3b82f615', border: '#3b82f630' },
  { value: 'entregue',     label: 'Entregue',      color: '#22c55e', bg: '#22c55e15', border: '#22c55e30' },
  { value: 'cancelado',    label: 'Cancelado',     color: '#888888', bg: '#88888815', border: '#88888830' },
]

export function RouteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: route, isLoading } = useRoute(id!)
  const { data: attachments } = useRouteAttachments(id!)
  const updateRoute = useUpdateRoute()
  const uploadAttachment = useUploadAttachment()
  const deleteAttachment = useDeleteAttachment()
  const deleteRoute = useDeleteRoute()
  const { company, user } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const { theme } = useTheme()
  const d = theme === 'dark'

  const borderColor = 'var(--color-border)'
  const surfaceBg = 'var(--color-surface)'

  if (isLoading) return <AppLayout title="Carregando..."><div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-text-3" /></div></AppLayout>
  if (!route) return <AppLayout title="Rota não encontrada"><p className="text-text-2">Rota não encontrada</p></AppLayout>

  async function handleStatusChange(status: RouteStatus) {
    try { await updateRoute.mutateAsync({ id: id!, status }); toast.success('Status atualizado') }
    catch { toast.error('Erro ao atualizar') }
  }

  async function handleConfirmPayment() {
    if (!company || !user || !route) return
    setConfirmingPayment(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      // 1. Mark route as payment confirmed
      await updateRoute.mutateAsync({
        id: id!,
        payment_confirmed: true,
        payment_confirmed_at: today,
      })

      // 2. Auto-create a financial transaction (entrada) for the confirmed amount
      if (route.amount && Number(route.amount) > 0) {
        await supabase.from('transactions').insert({
          company_id: company.id,
          type: 'entrada',
          amount: Number(route.amount),
          description: `Pagamento: ${route.title}${route.customer ? ` - ${route.customer.name}` : ''}`,
          date: today,
          created_by: user.id,
        })
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
      }

      toast.success('Pagamento confirmado e registrado no financeiro!')
    } catch {
      toast.error('Erro ao confirmar pagamento')
    }
    setConfirmingPayment(false)
  }

  async function handleTogglePublicLink() {
    try { await updateRoute.mutateAsync({ id: id!, public_link_active: !route!.public_link_active }); toast.success(route!.public_link_active ? 'Link desativado' : 'Link ativado') }
    catch { toast.error('Erro') }
  }

  function copyPublicLink() {
    const url = `${window.location.origin}/entrega/${route!.public_token}`
    navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Link copiado!')
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    try { await uploadAttachment.mutateAsync({ routeId: id!, file }); toast.success('Comprovante enviado!') }
    catch { toast.error('Erro no upload') }
    e.target.value = ''
  }

  async function handleDeleteRoute() {
    try { setDeleting(true); await deleteRoute.mutateAsync(id!); toast.success('Rota excluída'); navigate('/rotas') }
    catch { toast.error('Erro ao excluir'); setDeleting(false) }
  }

  const publicUrl = `${window.location.origin}/entrega/${route.public_token}`

  return (
    <AppLayout title="Detalhe da Rota">
      <div className="space-y-4 max-w-2xl">
        <button onClick={() => navigate('/rotas')} className="flex items-center gap-1.5 text-[13px] text-text-2 hover:text-text transition-colors duration-150">
          <ArrowLeft className="h-4 w-4" /> Voltar para Rotas
        </button>

        {/* Header card */}
        <div className="rounded-[12px] border overflow-hidden" style={{ background: surfaceBg, borderColor }}>
          {/* Title bar */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${borderColor}` }}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[22px] font-bold text-text">{route.title}</h3>
                {route.amount && <p className="text-[20px] font-bold mt-1" style={{ color: '#22c55e' }}>{formatCurrency(Number(route.amount))}</p>}
              </div>
              <button onClick={handleDeleteRoute} disabled={deleting}
                style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: 'transparent', color: 'var(--color-text-3)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef444450'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#ef444410' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.color = 'var(--color-text-3)'; e.currentTarget.style.background = 'transparent' }}
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Excluir
              </button>
            </div>
          </div>

          {/* Status pipeline */}
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${borderColor}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statuses.map(s => {
              const active = route.status === s.value
              return (
                <button key={s.value} onClick={() => handleStatusChange(s.value)}
                  style={{
                    padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 500,
                    background: active ? s.bg : 'transparent',
                    border: `1px solid ${active ? s.border : borderColor}`,
                    color: active ? s.color : 'var(--color-text-3)',
                    cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap' as const,
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = s.bg; e.currentTarget.style.color = s.color; e.currentTarget.style.borderColor = s.border } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-3)'; e.currentTarget.style.borderColor = borderColor } }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>

          {/* Payment confirmation banner */}
          {route.status === 'entregue' && route.amount && Number(route.amount) > 0 && (
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${borderColor}` }}>
              {route.payment_confirmed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: '#22c55e10', border: '1px solid #22c55e25', borderRadius: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#22c55e20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BadgeCheck style={{ width: 20, height: 20, color: '#22c55e' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>Pagamento confirmado</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>
                      {route.payment_confirmed_at ? `Confirmado em ${formatDate(route.payment_confirmed_at)}` : 'Registrado no financeiro'}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: '#f59e0b10', border: '1px solid #f59e0b25', borderRadius: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CircleDollarSign style={{ width: 20, height: 20, color: '#f59e0b' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>Aguardando pagamento</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>
                      Confirme o recebimento de {formatCurrency(Number(route.amount))} para registrar no financeiro
                    </p>
                  </div>
                  <button onClick={handleConfirmPayment} disabled={confirmingPayment}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                      borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700,
                      color: 'white', background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      cursor: confirmingPayment ? 'not-allowed' : 'pointer',
                      opacity: confirmingPayment ? 0.5 : 1,
                      boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
                      transition: 'all 150ms', whiteSpace: 'nowrap' as const,
                    }}
                    onMouseEnter={e => { if (!confirmingPayment) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.4)' } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(34,197,94,0.3)' }}
                  >
                    {confirmingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                    Confirmar Pagamento
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info grid */}
          <div style={{ padding: '16px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {route.customer && (
                <div style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#6366f115', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User style={{ width: 14, height: 14, color: '#6366f1' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 500 }}>Cliente</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginTop: 1 }}>{route.customer.name}</p>
                  </div>
                </div>
              )}
              {route.driver && (
                <div style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3b82f615', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck style={{ width: 14, height: 14, color: '#3b82f6' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 500 }}>Motorista</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginTop: 1 }}>{route.driver.name}</p>
                  </div>
                </div>
              )}
              {route.delivery_date && (
                <div style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f59e0b15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar style={{ width: 14, height: 14, color: '#f59e0b' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 500 }}>Data</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginTop: 1 }}>{formatDate(route.delivery_date)}</p>
                  </div>
                </div>
              )}
              {route.amount && (
                <div style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#22c55e15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DollarSign style={{ width: 14, height: 14, color: '#22c55e' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 500 }}>Valor</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#22c55e', marginTop: 1 }}>{formatCurrency(Number(route.amount))}</p>
                  </div>
                </div>
              )}
            </div>
            {route.address_destination && (
              <div style={{ padding: '12px 0', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ef444415', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin style={{ width: 14, height: 14, color: '#ef4444' }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 500 }}>Endereço</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginTop: 1 }}>{route.address_destination}</p>
                </div>
              </div>
            )}
            {route.notes && (
              <div style={{ padding: '12px 0', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#8b5cf615', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <StickyNote style={{ width: 14, height: 14, color: '#8b5cf6' }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--color-text-3)', fontWeight: 500 }}>Observações</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginTop: 1, lineHeight: 1.5 }}>{route.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="rounded-[12px] border overflow-hidden" style={{ background: surfaceBg, borderColor }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor }}>
            <h4 className="text-[14px] font-semibold text-text">Comprovantes</h4>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadAttachment.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', color: 'white', background: '#6366f1', cursor: 'pointer', opacity: uploadAttachment.isPending ? 0.5 : 1, transition: 'all 150ms' }}>
              {uploadAttachment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
          </div>
          {!attachments?.length ? (
            <div className="py-[60px] px-5 text-center flex flex-col items-center gap-3">
              <FileText className="empty-icon" />
              <p className="text-[15px] font-semibold text-text-2">Nenhum comprovante</p>
              <p className="text-[13px] text-text-3">Faça upload de imagens ou PDFs</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {attachments.map(att => (
                <div key={att.id} className="rounded-[10px] border overflow-hidden hover:border-accent/30 transition-colors duration-150" style={{ borderColor, background: 'var(--color-bg)' }}>
                  <div className="flex items-center justify-center h-24 overflow-hidden">
                    {att.file_type?.startsWith('image/') ? <img src={att.file_url} alt={att.file_name} className="h-full w-full object-cover" /> : <FileText className="h-8 w-8 text-text-3" />}
                  </div>
                  <div style={{ padding: '10px 12px', borderTop: `1px solid ${borderColor}` }}>
                    <p className="text-[11px] truncate mb-2 text-text-2">{att.file_name}</p>
                    <div className="flex gap-1.5">
                      <a href={att.file_url} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px 0', fontSize: 11, fontWeight: 500, borderRadius: 6, border: `1px solid ${borderColor}`, color: 'var(--color-text-2)', textDecoration: 'none', transition: 'all 150ms' }}>
                        <Download className="h-3 w-3" /> Baixar
                      </a>
                      <button onClick={() => deleteAttachment.mutate({ id: att.id, routeId: id! })}
                        style={{ padding: '5px 8px', borderRadius: 6, border: `1px solid ${borderColor}`, background: 'transparent', color: 'var(--color-text-3)', cursor: 'pointer', transition: 'all 150ms' }}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Public link */}
        <div className="rounded-[12px] border overflow-hidden" style={{ background: surfaceBg, borderColor }}>
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#6366f115', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Link2 style={{ width: 14, height: 14, color: '#6366f1' }} />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-text">Link Público</h4>
                <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 1 }}>
                  {route.public_link_active ? 'Ativo — qualquer pessoa com o link pode ver' : 'Desativado'}
                </p>
              </div>
            </div>
            <button onClick={handleTogglePublicLink}
              className="relative w-11 h-6 rounded-full transition-colors duration-150"
              style={{ background: route.public_link_active ? '#22c55e' : (d ? '#303030' : '#e2e2e5') }}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-150', route.public_link_active ? 'left-[22px]' : 'left-0.5')} />
            </button>
          </div>
          {route.public_link_active && (
            <div style={{ padding: '0 24px 16px', display: 'flex', gap: 8 }}>
              <input readOnly value={publicUrl} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: 'var(--color-bg)', color: 'var(--color-text-2)', fontSize: 12, outline: 'none' }} />
              <button onClick={copyPublicLink}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: 'transparent', color: 'var(--color-text-2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap' as const }}>
                {copied ? <Check className="h-3.5 w-3.5" style={{ color: '#22c55e' }} /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: 'transparent', color: 'var(--color-text-2)', textDecoration: 'none', cursor: 'pointer', transition: 'all 150ms' }}>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
