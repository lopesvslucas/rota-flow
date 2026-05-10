import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/permissions'
import { UserPlus, Trash2, Loader2, Shield, X, Users as UsersIcon, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { User } from '@/types'

export function UsersPage() {
  const { company, user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['company-users', company?.id],
    queryFn: async () => {
      if (!company) return []
      const { data, error } = await supabase.from('users').select('*').eq('company_id', company.id).order('created_at')
      if (error) throw error
      return data as User[]
    },
    enabled: !!company,
  })

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('users').delete().eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['company-users'] }); toast.success('Usuário removido') },
    onError: () => toast.error('Erro ao remover'),
  })

  return (
    <AppLayout title="Usuários">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[20px] font-bold text-text">Equipe</h3>
            <p className="text-[13px] text-text-2 mt-0.5">{users?.length ?? 0} membros</p>
          </div>
          <button onClick={() => setShowInvite(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)', transition: 'all 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.3)' }}
          >
            <UserPlus className="h-4 w-4" /> Convidar
          </button>
        </div>

        <div className="rounded-[10px] border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {isLoading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-text-3" /></div>
          ) : !users?.length ? (
            <div className="py-[60px] px-5 text-center flex flex-col items-center gap-3">
              <UsersIcon className="empty-icon" />
              <p className="text-[15px] font-semibold text-text-2">Nenhum membro encontrado</p>
              <p className="text-[13px] text-text-3">Convide membros da sua equipe</p>
            </div>
          ) : (
            <div>
              {users.map((u, i) => (
                <div key={u.id} className={cn('flex items-center gap-3 px-5 py-[14px] hover:bg-surface-2 transition-colors duration-150', i < users.length - 1 && 'border-b')} style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-center rounded-[9px] shrink-0 text-[13px] font-bold" style={{ width: 34, height: 34, background: '#6366f120', color: '#6366f1' }}>
                    {u.name?.charAt(0)?.toUpperCase() ?? u.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-medium truncate text-text">{u.name ?? u.email}</p>
                      {u.tag && (
                        <span style={{
                          padding: '1px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600,
                          background: '#8b5cf615', color: '#8b5cf6', whiteSpace: 'nowrap',
                        }}>
                          {u.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-3 mt-0.5 truncate">{u.email}</p>
                  </div>
                  <span className={cn('badge hidden sm:inline-flex', getRoleBadgeColor(u.role))}>{getRoleLabel(u.role)}</span>
                  {currentUser?.role === 'owner' && u.id !== currentUser.id && (
                    <div className="flex gap-1">
                      <button onClick={() => setEditUser(u)} className="p-2 rounded-[7px] text-text-3 hover:bg-surface-2 hover:text-text transition-colors duration-150"><Shield className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteMutation.mutate(u.id)} className="p-2 rounded-[7px] text-text-3 hover:text-red hover:bg-surface-2 transition-colors duration-150"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showInvite && company && <InviteModal companyId={company.id} onClose={() => setShowInvite(false)} />}
      {editUser && <EditPermissionsModal user={editUser} onClose={() => setEditUser(null)} />}
    </AppLayout>
  )
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

function InviteModal({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleInvite() {
    if (!email || !password || !name.trim()) return
    if (password.length < 6) { toast.error('Senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true)
    try {
      // Create a secondary client to sign up the new user without logging out the current admin
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      const adminAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      })

      // Sign up the new user
      const { data: authData, error: authError } = await adminAuthClient.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Não foi possível criar o usuário de autenticação')

      // Insert into public.users with the real auth user ID
      const { error } = await supabase.from('users').insert({
        id: authData.user.id,
        company_id: companyId,
        email,
        name: name.trim(),
        tag: tag.trim() || null,
        role: 'admin',
        permissions: { financeiro: true, rotas: true, usuarios: true },
      })
      
      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['company-users'] })
      toast.success(`Usuário criado com sucesso! Ele já pode acessar com o email: ${email}`)
      onClose()
    } catch (err: any) { toast.error(err?.message || 'Erro ao convidar') }
    setLoading(false)
  }

  const canSubmit = email && name.trim() && password && password.length >= 6

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 0, maxWidth: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Convidar Usuário</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-3)', fontSize: 18, cursor: 'pointer', padding: 4 }}>
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Nome completo *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do usuário" style={inputStyle} />
          </div>
          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>E-mail *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" style={inputStyle} />
          </div>
          {/* Tag */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>
              Tag <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--color-text-3)' }}>(opcional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Tag style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#8b5cf6' }} />
              <input type="text" value={tag} onChange={e => setTag(e.target.value)} placeholder="Ex: CEO, Gerente, Financeiro..."
                style={{ ...inputStyle, paddingLeft: 34 }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: -2 }}>Identificação visual na lista de usuários</p>
          </div>
          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Senha de acesso *</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle} />
            <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: -2 }}>O usuário usará essa senha para fazer o primeiro login</p>
          </div>
          {/* Role badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#6366f110', borderRadius: 8, border: '1px solid #6366f130' }}>
            <Shield className="h-4 w-4" style={{ color: '#6366f1', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>Administrador</p>
              <p style={{ fontSize: 11, color: 'var(--color-text-2)' }}>Acesso total: financeiro, rotas e usuários</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-2)', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleInvite} disabled={loading || !canSubmit}
            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (loading || !canSubmit) ? 0.5 : 1 }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar Convite'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditPermissionsModal({ user, onClose }: { user: User; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [perms, setPerms] = useState(user.permissions)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      const { error } = await supabase.from('users').update({ role: 'admin', permissions: perms }).eq('id', user.id)
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['company-users'] })
      toast.success('Permissões atualizadas')
      onClose()
    } catch { toast.error('Erro ao atualizar') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 0, maxWidth: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Editar Permissões</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-3)', fontSize: 18, cursor: 'pointer', padding: 4 }}>
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-2)' }}>{user.name ?? user.email}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>Permissões</label>
            {(['financeiro', 'rotas', 'usuarios'] as const).map(p => (
              <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text)', cursor: 'pointer', padding: '2px 0' }}>
                <input type="checkbox" checked={perms[p]} onChange={e => setPerms(prev => ({ ...prev, [p]: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#6366f1', borderRadius: 4 }} />
                {p === 'financeiro' ? 'Financeiro' : p === 'rotas' ? 'Rotas' : 'Gerenciar Usuários'}
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-2)', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading}
            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
