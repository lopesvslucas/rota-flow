import { useState, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { supabase } from '@/lib/supabase'
import { Moon, Sun, Building2, Upload, Loader2, Image, Save, Shield, Mail, KeyRound, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function SettingsPage() {
  const { user, company, refreshUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const d = theme === 'dark'

  const surfaceBg = 'var(--color-surface)'
  const borderColor = 'var(--color-border)'
  const bgColor = 'var(--color-bg)'

  return (
    <AppLayout title="Configurações">
      <div className="max-w-2xl space-y-5">

        {/* Profile card */}
        <div className="rounded-[14px] border overflow-hidden" style={{ background: surfaceBg, borderColor }}>
          {/* Profile header with gradient */}
          <div style={{
            position: 'relative', padding: '32px 24px 20px',
            background: d
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
              : 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 50%, #9fa8da 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: d ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)',
                border: `2px solid ${d ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 800, color: '#6366f1',
              }}>
                {user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: d ? '#f5f5f5' : '#1a1a1a' }}>
                  {user?.name ?? 'Sem nome'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Mail style={{ width: 12, height: 12, color: d ? '#888' : '#777' }} />
                  <span style={{ fontSize: 13, color: d ? '#888' : '#777' }}>{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile details */}
          <div>
            <InfoRow icon={Shield} iconColor="#6366f1" iconBg="#6366f115" label="Função" value={
              <span style={{
                padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: '#6366f115', color: '#6366f1', textTransform: 'capitalize',
              }}>
                {user?.role === 'owner' ? 'Proprietário' : user?.role === 'admin' ? 'Administrador' : user?.role ?? '—'}
              </span>
            } borderColor={borderColor} />
            <InfoRow icon={KeyRound} iconColor="#f59e0b" iconBg="#f59e0b15" label="ID" value={
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-3)' }}>
                {user?.id?.slice(0, 8)}...
              </span>
            } borderColor={borderColor} last />
          </div>
        </div>

        {/* Company card */}
        {company && <CompanySettings company={company} onSaved={refreshUser} d={d} borderColor={borderColor} surfaceBg={surfaceBg} bgColor={bgColor} />}

        {/* Theme card */}
        <div className="rounded-[14px] border overflow-hidden" style={{ background: surfaceBg, borderColor }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: d ? 'linear-gradient(135deg, #312e81, #1e1b4b)' : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: d ? '1px solid #4338ca30' : '1px solid #f59e0b30',
              }}>
                {d ? <Moon style={{ width: 20, height: 20, color: '#818cf8' }} /> : <Sun style={{ width: 20, height: 20, color: '#f59e0b' }} />}
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Aparência</h4>
                <p style={{ fontSize: 13, color: 'var(--color-text-2)', marginTop: 2 }}>
                  Tema {d ? 'escuro' : 'claro'} ativo
                </p>
              </div>
            </div>
            <button onClick={toggleTheme}
              className="relative transition-colors duration-200"
              style={{
                width: 52, height: 28, borderRadius: 14,
                background: d ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#e2e2e5',
                border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <span className={cn(
                'absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white flex items-center justify-center transition-all duration-200 shadow-sm',
                d ? 'left-[27px]' : 'left-[3px]'
              )}>
                {d ? <Moon className="h-3 w-3" style={{ color: '#6366f1' }} /> : <Sun className="h-3 w-3" style={{ color: '#f59e0b' }} />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function InfoRow({ icon: Icon, iconColor, iconBg, label, value, borderColor, last }: {
  icon: any; iconColor: string; iconBg: string; label: string; value: React.ReactNode; borderColor: string; last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 24px',
      borderBottom: last ? 'none' : `1px solid ${borderColor}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 14, height: 14, color: iconColor }} />
        </div>
        <span style={{ fontSize: 14, color: 'var(--color-text-2)' }}>{label}</span>
      </div>
      <div>{value}</div>
    </div>
  )
}

function CompanySettings({ company, onSaved, d, borderColor, surfaceBg, bgColor }: {
  company: { id: string; name: string; logo_url: string | null }
  onSaved: () => void
  d: boolean; borderColor: string; surfaceBg: string; bgColor: string
}) {
  const [companyName, setCompanyName] = useState(company.name)
  const [logoUrl, setLogoUrl] = useState(company.logo_url ?? '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Apenas imagens são permitidas'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem deve ter no máximo 2MB'); return }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `logos/${company.id}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('route-attachments').upload(path, file, { upsert: true })
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from('route-attachments').getPublicUrl(path)
      setLogoUrl(urlData.publicUrl)
      toast.success('Logo enviada!')
    } catch (err: any) { toast.error(err?.message || 'Erro ao enviar logo') }
    setUploading(false)
    e.target.value = ''
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase.from('companies').update({ name: companyName, logo_url: logoUrl || null }).eq('id', company.id)
      if (error) throw error
      toast.success('Configurações salvas!')
      onSaved()
    } catch (err: any) { toast.error(err?.message || 'Erro ao salvar') }
    setSaving(false)
  }

  const hasChanges = companyName !== company.name || (logoUrl || '') !== (company.logo_url || '')

  return (
    <div className="rounded-[14px] border overflow-hidden" style={{ background: surfaceBg, borderColor }}>
      {/* Company header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: d ? 'linear-gradient(135deg, #1e3a5f, #0d2137)' : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: d ? '1px solid #1e40af30' : '1px solid #3b82f630',
        }}>
          <Building2 style={{ width: 20, height: 20, color: '#3b82f6' }} />
        </div>
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Empresa</h4>
          <p style={{ fontSize: 13, color: 'var(--color-text-2)', marginTop: 2 }}>Informações que aparecem no link público</p>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Logo upload */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>
            Logo da empresa
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 80, height: 80, borderRadius: 16,
                border: `2px dashed ${d ? '#333' : '#d0d0d5'}`,
                background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', transition: 'all 200ms',
                flexShrink: 0, position: 'relative',
              }}
            >
              {uploading ? (
                <Loader2 style={{ width: 24, height: 24, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
              ) : logoUrl ? (
                <>
                  <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 200ms',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
                  >
                    <Camera style={{ width: 20, height: 20, color: 'white' }} />
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Image style={{ width: 22, height: 22, color: 'var(--color-text-3)' }} />
                  <span style={{ fontSize: 9, color: 'var(--color-text-3)', fontWeight: 600 }}>LOGO</span>
                </div>
              )}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
                  borderRadius: 10, border: `1px solid ${borderColor}`, background: 'transparent',
                  color: 'var(--color-text)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                <Upload style={{ width: 14, height: 14 }} />
                {logoUrl ? 'Trocar logo' : 'Enviar logo'}
              </button>
              <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 8 }}>PNG ou JPG, máx. 2MB</p>
              <p style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Aparece no link público de entrega</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>

        {/* Company name */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            Nome da transportadora
          </label>
          <input
            type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
            placeholder="Nome da sua empresa"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              border: `1px solid ${borderColor}`, background: bgColor,
              color: 'var(--color-text)', fontSize: 15, fontWeight: 500, outline: 'none',
              transition: 'border-color 150ms',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1' }}
            onBlur={e => { e.currentTarget.style.borderColor = borderColor }}
          />
        </div>

        {/* Save button */}
        {hasChanges && (
          <button onClick={handleSave} disabled={saving || !companyName.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px',
              borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700,
              color: 'white', background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              cursor: 'pointer', opacity: (saving || !companyName.trim()) ? 0.5 : 1,
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)' }}
          >
            {saving ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 16, height: 16 }} />}
            Salvar alterações
          </button>
        )}
      </div>
    </div>
  )
}
