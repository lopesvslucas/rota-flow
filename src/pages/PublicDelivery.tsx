import { useParams } from 'react-router-dom'
import { usePublicRoute } from '@/hooks/useRoutes'
import { formatDate } from '@/lib/formatters'
import { Truck, Download, FileText, Loader2, CheckCircle2, Clock, XCircle, MapPin, Calendar, User, Package } from 'lucide-react'

import type { RouteStatus } from '@/types'

const statusLabel: Record<RouteStatus, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  pendente:     { label: 'Pendente',      color: '#f59e0b', bg: '#f59e0b12', border: '#f59e0b30', icon: Clock },
  em_andamento: { label: 'Em andamento',  color: '#3b82f6', bg: '#3b82f612', border: '#3b82f630', icon: Truck },
  entregue:     { label: 'Entregue',      color: '#22c55e', bg: '#22c55e12', border: '#22c55e30', icon: CheckCircle2 },
  cancelado:    { label: 'Cancelado',     color: '#888888', bg: '#55555512', border: '#55555530', icon: XCircle },
}

export function PublicDeliveryPage() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading } = usePublicRoute(token!)

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f11' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Loader2 style={{ width: 32, height: 32, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, color: '#555', fontWeight: 500 }}>Carregando entrega...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0f0f11' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#ef444418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <XCircle style={{ width: 28, height: 28, color: '#ef4444' }} />
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f5f5f5' }}>Entrega não encontrada</h1>
        <p style={{ fontSize: 14, color: '#555', maxWidth: 300 }}>Este link pode estar desativado ou expirado. Entre em contato com a transportadora.</p>
      </div>
    </div>
  )

  const { route, company, attachments } = data
  const status = statusLabel[route.status]
  const StatusIcon = status.icon

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f11' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ position: 'relative', borderBottom: '1px solid #1e1e1e', padding: '24px 16px 20px', background: '#141414' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
              <Truck style={{ width: 18, height: 18, color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5' }}>{company.name}</p>
              <p style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>Rastreamento de entrega</p>
            </div>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.02em' }}>{route.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px 40px', position: 'relative' }}>
        {/* Status card */}
        <div style={{ background: status.bg, border: `1px solid ${status.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${status.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <StatusIcon style={{ width: 20, height: 20, color: status.color }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status da entrega</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: status.color, marginTop: 2 }}>{status.label}</p>
          </div>
        </div>

        {/* Details card */}
        <div style={{ background: '#1c1c1c', border: '1px solid #282828', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #282828' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detalhes</p>
          </div>
          <div style={{ padding: '4px 0' }}>
            {route.customer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
                <User style={{ width: 16, height: 16, color: '#555', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>Cliente</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f5', marginTop: 1 }}>{route.customer.name}</p>
                </div>
              </div>
            )}
            {route.delivery_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid #222' }}>
                <Calendar style={{ width: 16, height: 16, color: '#555', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>Data prevista</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f5', marginTop: 1 }}>{formatDate(route.delivery_date)}</p>
                </div>
              </div>
            )}
            {route.address_destination && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid #222' }}>
                <MapPin style={{ width: 16, height: 16, color: '#555', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>Endereço</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f5', marginTop: 1 }}>{route.address_destination}</p>
                </div>
              </div>
            )}
            {!route.customer && !route.delivery_date && !route.address_destination && (
              <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                <Package style={{ width: 28, height: 28, color: '#333', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: '#555' }}>Nenhum detalhe disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div style={{ background: '#1c1c1c', border: '1px solid #282828', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #282828', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comprovantes</p>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', background: '#6366f115', padding: '2px 8px', borderRadius: 10 }}>{attachments.length}</span>
            </div>
            <div>
              {attachments.map((att, i) => (
                <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: i > 0 ? '1px solid #222' : 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {att.file_type?.startsWith('image/')
                      ? <img src={att.file_url} alt={att.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <FileText style={{ width: 20, height: 20, color: '#555' }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#f5f5f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.file_name}</p>
                  </div>
                  <a href={att.file_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', textDecoration: 'none', flexShrink: 0, boxShadow: '0 2px 8px rgba(99,102,241,0.2)' }}>
                    <Download style={{ width: 13, height: 13 }} /> Baixar
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck style={{ width: 10, height: 10, color: 'white' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#333', letterSpacing: '-0.01em' }}>RotaFlow</span>
          </div>
          <p style={{ fontSize: 10, color: '#333' }}>Controle inteligente de transportadora</p>
        </div>
      </div>
    </div>
  )
}
