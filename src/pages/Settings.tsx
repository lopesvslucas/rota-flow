import { useState, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { supabase } from '@/lib/supabase'
import { Moon, Sun, User, Building2, Palette, Upload, Loader2, Image, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function SettingsPage() {
  const { user, company, refreshUser } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const surfaceBg = 'var(--color-surface)'
  const borderColor = 'var(--color-border)'

  return (
    <AppLayout title="Configurações">
      <div className="space-y-4 max-w-2xl">
        {/* Perfil */}
        <div className="rounded-[10px] border overflow-hidden" style={{ background: surfaceBg, borderColor }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor }}>
            <div className="flex items-center justify-center rounded-[9px]" style={{ width: 34, height: 34, background: '#6366f120' }}>
              <User className="h-4 w-4" style={{ color: '#6366f1' }} />
            </div>
            <h4 className="text-[14px] font-semibold text-text">Perfil</h4>
          </div>
          <div>
            <div className="flex items-center justify-between px-5 py-[14px] border-b" style={{ borderColor }}>
              <span className="text-[14px] text-text-2">Nome</span>
              <span className="text-[14px] font-medium text-text">{user?.name ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-[14px] border-b" style={{ borderColor }}>
              <span className="text-[14px] text-text-2">E-mail</span>
              <span className="text-[14px] font-medium text-text truncate ml-4">{user?.email ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-[14px]">
              <span className="text-[14px] text-text-2">Função</span>
              <span className="text-[14px] font-medium text-text capitalize">{user?.role ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Empresa */}
        {company && <CompanySettings company={company} onSaved={refreshUser} />}

        {/* Aparência */}
        <div className="rounded-[10px] border p-5" style={{ background: surfaceBg, borderColor }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-[9px]" style={{ width: 34, height: 34, background: '#f59e0b20' }}>
                <Palette className="h-4 w-4" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-text">Aparência</h4>
                <p className="text-[13px] text-text-2 mt-0.5">Tema {theme === 'dark' ? 'escuro' : 'claro'} ativo</p>
              </div>
            </div>
            <button onClick={toggleTheme}
              className="relative w-11 h-6 rounded-full transition-colors duration-150"
              style={{ background: theme === 'dark' ? '#6366f1' : '#e2e2e5' }}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white flex items-center justify-center transition-all duration-150', theme === 'dark' ? 'left-[22px]' : 'left-0.5')}>
                {theme === 'dark' ? <Moon className="h-3 w-3" style={{ color: '#6366f1' }} /> : <Sun className="h-3 w-3" style={{ color: '#f59e0b' }} />}
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function CompanySettings({ company, onSaved }: { company: { id: string; name: string; logo_url: string | null }; onSaved: () => void }) {
  const [companyName, setCompanyName] = useState(company.name)
  const [logoUrl, setLogoUrl] = useState(company.logo_url ?? '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const borderColor = 'var(--color-border)'
  const surfaceBg = 'var(--color-surface)'

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Apenas imagens são permitidas'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem deve ter no máximo 2MB'); return }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `logos/${company.id}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('route-attachments')
        .upload(path, file, { upsert: true })

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage
        .from('route-attachments')
        .getPublicUrl(path)

      setLogoUrl(urlData.publicUrl)
      toast.success('Logo enviada!')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao enviar logo')
    }
    setUploading(false)
    e.target.value = ''
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('companies')
        .update({ name: companyName, logo_url: logoUrl || null })
        .eq('id', company.id)

      if (error) throw error
      toast.success('Configurações salvas!')
      onSaved()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar')
    }
    setSaving(false)
  }

  const hasChanges = companyName !== company.name || (logoUrl || '') !== (company.logo_url || '')

  return (
    <div className="rounded-[10px] border overflow-hidden" style={{ background: surfaceBg, borderColor }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor }}>
        <div className="flex items-center justify-center rounded-[9px]" style={{ width: 34, height: 34, background: '#3b82f620' }}>
          <Building2 className="h-4 w-4" style={{ color: '#3b82f6' }} />
        </div>
        <h4 className="text-[14px] font-semibold text-text">Empresa</h4>
      </div>
      <div style={{ padding: '20px' }}>
        {/* Logo */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>Logo da empresa</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 72, height: 72, borderRadius: 14, border: `2px dashed ${borderColor}`,
                background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden', transition: 'all 150ms', flexShrink: 0,
              }}
            >
              {uploading ? (
                <Loader2 style={{ width: 24, height: 24, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
              ) : logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Image style={{ width: 24, height: 24, color: 'var(--color-text-3)' }} />
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                  borderRadius: 8, border: `1px solid ${borderColor}`, background: surfaceBg,
                  color: 'var(--color-text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                <Upload style={{ width: 14, height: 14 }} />
                {logoUrl ? 'Trocar logo' : 'Enviar logo'}
              </button>
              <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 6 }}>PNG, JPG até 2MB. Aparece no link público.</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>

        {/* Company name */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Nome da transportadora</label>
          <input
            type="text" value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Nome da sua empresa"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: `1px solid ${borderColor}`, background: 'var(--color-bg)',
              color: 'var(--color-text)', fontSize: 14, outline: 'none',
            }}
          />
        </div>

        {/* Save button */}
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving || !companyName.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
              color: 'white', background: '#6366f1', cursor: 'pointer',
              opacity: (saving || !companyName.trim()) ? 0.5 : 1,
              transition: 'all 150ms',
            }}
          >
            {saving ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 16, height: 16 }} />}
            Salvar alterações
          </button>
        )}
      </div>
    </div>
  )
}
