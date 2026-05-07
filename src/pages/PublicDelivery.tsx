import { useParams } from 'react-router-dom'
import { usePublicRoute } from '@/hooks/useRoutes'
import { formatDate } from '@/lib/formatters'
import { Truck, Download, FileText, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RouteStatus } from '@/types'

const statusLabel: Record<RouteStatus, { label: string; badgeClass: string; icon: typeof Clock }> = {
  pendente:     { label: 'Pendente',      badgeClass: 'badge-pendente',  icon: Clock },
  em_andamento: { label: 'Em andamento',  badgeClass: 'badge-andamento', icon: Truck },
  entregue:     { label: 'Entregue',      badgeClass: 'badge-entregue',  icon: CheckCircle2 },
  cancelado:    { label: 'Cancelado',     badgeClass: 'badge-cancelado', icon: XCircle },
}

export function PublicDeliveryPage() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading } = usePublicRoute(token!)

  if (isLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#141414' }}><Loader2 className="h-6 w-6 animate-spin" style={{ color: '#6366f1' }} /></div>
  if (!data) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#141414' }}>
      <div className="text-center flex flex-col items-center gap-3">
        <Truck className="empty-icon" />
        <h1 className="text-[18px] font-bold text-text">Entrega não encontrada</h1>
        <p className="text-[13px] text-text-2">Este link pode estar desativado ou expirado.</p>
      </div>
    </div>
  )

  const { route, company, attachments } = data
  const status = statusLabel[route.status]
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen" style={{ background: '#141414' }}>
      <div className="border-b px-4 py-5" style={{ background: '#1c1c1c', borderColor: '#303030' }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-4 w-4" style={{ color: '#6366f1' }} />
            <span className="text-[13px] text-text-2">{company.name}</span>
          </div>
          <h1 className="text-[20px] font-bold mt-2 text-text">{route.title}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-3">
        <div className="rounded-[10px] border p-4" style={{ background: '#1c1c1c', borderColor: '#303030' }}>
          <div className="flex items-center gap-3">
            <div className={cn('badge', status.badgeClass)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border p-4 space-y-3" style={{ background: '#1c1c1c', borderColor: '#303030' }}>
          {route.customer && <div><p className="text-[12px] text-text-3">Cliente</p><p className="text-[14px] font-medium text-text">{route.customer.name}</p></div>}
          {route.delivery_date && <div><p className="text-[12px] text-text-3">Data</p><p className="text-[14px] font-medium text-text">{formatDate(route.delivery_date)}</p></div>}
          {route.address_destination && <div><p className="text-[12px] text-text-3">Endereço</p><p className="text-[14px] font-medium text-text">{route.address_destination}</p></div>}
        </div>

        {attachments.length > 0 && (
          <div className="rounded-[10px] border overflow-hidden" style={{ background: '#1c1c1c', borderColor: '#303030' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#303030' }}>
              <h3 className="text-[14px] font-semibold text-text">Comprovantes</h3>
            </div>
            <div>
              {attachments.map((att, i) => (
                <div key={att.id} className={cn('flex items-center gap-3 px-5 py-[14px]', i < attachments.length - 1 && 'border-b')} style={{ borderColor: '#303030' }}>
                  <div className="flex items-center justify-center rounded-[8px] shrink-0 overflow-hidden" style={{ width: 40, height: 40, background: '#141414' }}>
                    {att.file_type?.startsWith('image/') ? <img src={att.file_url} alt={att.file_name} className="h-full w-full object-cover" /> : <FileText className="h-5 w-5 text-text-3" />}
                  </div>
                  <span className="text-[14px] flex-1 truncate text-text">{att.file_name}</span>
                  <a href={att.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium rounded-[8px] text-white transition-colors duration-150 hover:brightness-110" style={{ background: '#6366f1' }}>
                    <Download className="h-3.5 w-3.5" /> Baixar
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-text-3 pt-4">Powered by RotaFlow</p>
      </div>
    </div>
  )
}
