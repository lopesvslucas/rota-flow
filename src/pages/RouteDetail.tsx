import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { useRoute, useUpdateRoute, useRouteAttachments, useUploadAttachment, useDeleteAttachment, useDeleteRoute } from '@/hooks/useRoutes'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { ArrowLeft, Upload, Download, Trash2, Link2, Copy, Check, Loader2, MapPin, User, Calendar, FileText, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { RouteStatus } from '@/types'

const statuses: { value: RouteStatus; label: string; badgeClass: string }[] = [
  { value: 'pendente',     label: 'Pendente',      badgeClass: 'badge-pendente' },
  { value: 'em_andamento', label: 'Em andamento',  badgeClass: 'badge-andamento' },
  { value: 'entregue',     label: 'Entregue',      badgeClass: 'badge-entregue' },
  { value: 'cancelado',    label: 'Cancelado',     badgeClass: 'badge-cancelado' },
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (isLoading) return <AppLayout title="Carregando..."><div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-text-3" /></div></AppLayout>
  if (!route) return <AppLayout title="Rota não encontrada"><p className="text-text-2">Rota não encontrada</p></AppLayout>

  async function handleStatusChange(status: RouteStatus) {
    try { await updateRoute.mutateAsync({ id: id!, status }); toast.success('Status atualizado') }
    catch { toast.error('Erro ao atualizar') }
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
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        {/* Header card */}
        <div className="rounded-[10px] border p-5" style={{ background: '#1c1c1c', borderColor: '#303030' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[20px] font-bold text-text">{route.title}</h3>
              {route.amount && <p className="text-[18px] font-bold mt-1" style={{ color: '#22c55e' }}>{formatCurrency(Number(route.amount))}</p>}
            </div>
            <button onClick={handleDeleteRoute} disabled={deleting} className="p-2 rounded-[7px] text-text-3 hover:text-red hover:bg-surface-2 transition-colors duration-150">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Status pipeline */}
          <div className="flex gap-2 flex-wrap mb-5">
            {statuses.map(s => (
              <button key={s.value} onClick={() => handleStatusChange(s.value)}
                className={cn(
                  'badge cursor-pointer transition-colors duration-150',
                  route.status === s.value ? s.badgeClass : 'border text-text-3 hover:bg-surface-2'
                )}
                style={route.status !== s.value ? { borderColor: '#303030' } : undefined}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-[14px]">
            {route.customer && <div className="flex items-center gap-2 text-text-2"><User className="h-4 w-4 text-text-3" />{route.customer.name}</div>}
            {route.driver && <div className="flex items-center gap-2 text-text-2"><Truck className="h-4 w-4 text-text-3" />{route.driver.name}</div>}
            {route.delivery_date && <div className="flex items-center gap-2 text-text-2"><Calendar className="h-4 w-4 text-text-3" />{formatDate(route.delivery_date)}</div>}
            {route.address_destination && <div className="flex items-center gap-2 text-text-2 col-span-2"><MapPin className="h-4 w-4 shrink-0 text-text-3" />{route.address_destination}</div>}
            {route.notes && <div className="flex items-start gap-2 text-text-2 col-span-2"><FileText className="h-4 w-4 shrink-0 mt-0.5 text-text-3" />{route.notes}</div>}
          </div>
        </div>

        {/* Attachments */}
        <div className="rounded-[10px] border overflow-hidden" style={{ background: '#1c1c1c', borderColor: '#303030' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#303030' }}>
            <h4 className="text-[14px] font-semibold text-text">Comprovantes</h4>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadAttachment.isPending}
              className="flex items-center gap-1.5 px-[14px] py-[6px] text-[13px] font-medium rounded-[8px] text-white disabled:opacity-50 transition-colors duration-150 hover:brightness-110" style={{ background: '#6366f1' }}>
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
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
              {attachments.map(att => (
                <div key={att.id} className="rounded-[10px] border p-3 hover:bg-surface-2 transition-colors duration-150" style={{ borderColor: '#303030' }}>
                  <div className="flex items-center justify-center h-20 mb-2 rounded-[8px] overflow-hidden" style={{ background: '#141414' }}>
                    {att.file_type?.startsWith('image/') ? <img src={att.file_url} alt={att.file_name} className="h-full w-full object-cover" /> : <FileText className="h-8 w-8 text-text-3" />}
                  </div>
                  <p className="text-[12px] truncate mb-2 text-text-2">{att.file_name}</p>
                  <div className="flex gap-1">
                    <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] rounded-[6px] border text-text-2 hover:bg-surface-2 transition-colors duration-150" style={{ borderColor: '#303030' }}>
                      <Download className="h-3 w-3" /> Baixar
                    </a>
                    <button onClick={() => deleteAttachment.mutate({ id: att.id, routeId: id! })} className="p-1 rounded-[6px] border text-text-3 hover:text-red hover:bg-surface-2 transition-colors duration-150" style={{ borderColor: '#303030' }}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Public link */}
        <div className="rounded-[10px] border p-5" style={{ background: '#1c1c1c', borderColor: '#303030' }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[14px] font-semibold flex items-center gap-2 text-text"><Link2 className="h-4 w-4" style={{ color: '#6366f1' }} /> Link Público</h4>
            <button onClick={handleTogglePublicLink}
              className={cn('relative w-11 h-6 rounded-full transition-colors duration-150')}
              style={{ background: route.public_link_active ? '#22c55e' : '#303030' }}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-150', route.public_link_active ? 'left-[22px]' : 'left-0.5')} />
            </button>
          </div>
          {route.public_link_active && (
            <div className="flex items-center gap-2">
              <input readOnly value={publicUrl} className="flex-1 rounded-[8px] border px-[14px] py-[10px] text-[12px] text-text-2 focus:outline-none" style={{ background: '#222222', borderColor: '#303030' }} />
              <button onClick={copyPublicLink} className="flex items-center gap-1.5 px-[14px] py-[10px] text-[12px] font-medium rounded-[8px] border text-text-2 hover:bg-surface-2 transition-colors duration-150" style={{ borderColor: '#303030' }}>
                {copied ? <Check className="h-3.5 w-3.5" style={{ color: '#22c55e' }} /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
