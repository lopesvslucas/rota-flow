import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  DollarSign,
  Truck,
  Users,
  LogOut,
  Sun,
  Moon,
  KeyRound,
  X,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { hasPermission, canManageUsers } from '@/lib/permissions'

interface SidebarProps {
  onNavigate?: () => void
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', permission: null },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro', permission: 'financeiro' as const },
  { to: '/rotas', icon: Truck, label: 'Rotas', permission: 'rotas' as const },
  { to: '/usuarios', icon: Users, label: 'Usuários', permission: 'usuarios' as const },
]

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const filteredItems = navItems.filter(item => {
    if (!item.permission) return true
    if (item.permission === 'usuarios') return canManageUsers(user)
    return hasPermission(user, item.permission)
  })

  return (
    <aside
      className="h-screen flex flex-col"
      style={{ width: 220, background: isDark ? '#111111' : '#ffffff', borderRight: `1px solid ${isDark ? '#1e1e1e' : '#e8e8eb'}` }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${isDark ? '#1e1e1e' : '#e8e8eb'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
            <Truck style={{ width: 16, height: 16, color: 'white' }} />
          </div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#f5f5f5' : '#1a1a1a', letterSpacing: '-0.02em' }}>RotaFlow</span>
            <p style={{ fontSize: 11, color: isDark ? '#555' : '#999', marginTop: 1, fontWeight: 500 }}>Painel de controle</p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '20px 20px 8px' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: isDark ? '#444' : '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Menu</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {filteredItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn('transition-all duration-150', isActive ? '' : '')
            }
            style={({ isActive }) => ({
              padding: '10px 12px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              background: isActive ? (isDark ? '#1c1c1c' : '#f0f0f2') : 'transparent',
              border: isActive ? `1px solid ${isDark ? '#282828' : '#e2e2e5'}` : '1px solid transparent',
              color: isActive ? (isDark ? '#f5f5f5' : '#1a1a1a') : (isDark ? '#777' : '#888'),
            } as React.CSSProperties)}
          >
            <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 12px 16px' }}>
        <div style={{ height: 1, background: isDark ? '#1e1e1e' : '#e8e8eb', margin: '0 4px 12px' }} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
            background: 'transparent', border: '1px solid transparent',
            color: isDark ? '#777' : '#888', cursor: 'pointer',
            marginBottom: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#1a1a1a' : '#f0f0f2'; e.currentTarget.style.color = isDark ? '#ccc' : '#333' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isDark ? '#777' : '#888' }}
        >
          {isDark ? <Sun style={{ width: 15, height: 15, flexShrink: 0 }} /> : <Moon style={{ width: 15, height: 15, flexShrink: 0 }} />}
          <span>{isDark ? 'Modo claro' : 'Modo escuro'}</span>
        </button>

        {/* Change password */}
        <ChangePasswordButton isDark={isDark} />

        {/* User info */}
        {user && (
          <div style={{ padding: '0 4px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#6366f118', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#6366f1', flexShrink: 0 }}>
                {(user.name?.charAt(0) ?? user.email.charAt(0)).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#ccc' : '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name ?? 'Usuário'}</p>
                <p style={{ fontSize: 10, color: isDark ? '#555' : '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={signOut}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', background: 'transparent', border: '1px solid transparent', color: 'var(--color-text-3)', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#1a1a1a' : '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666' }}
        >
          <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}

function ChangePasswordButton({ isDark }: { isDark: boolean }) {
  const [open, setOpen] = useState(false)
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleChange() {
    if (pw.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) { toast.error(error.message) } else { toast.success('Senha alterada!'); setOpen(false); setPw('') }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', background: 'transparent', border: '1px solid transparent', color: isDark ? '#777' : '#888', cursor: 'pointer', marginBottom: 4 }}
        onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#1a1a1a' : '#f0f0f2'; e.currentTarget.style.color = isDark ? '#ccc' : '#333' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isDark ? '#777' : '#888' }}
      >
        <KeyRound style={{ width: 15, height: 15, flexShrink: 0 }} />
        <span>Alterar senha</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setOpen(false)}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 0, width: 360, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Alterar Senha</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-3)', cursor: 'pointer' }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Nova senha</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Mínimo 6 caracteres" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 14, outline: 'none' }} />
            </div>
            <div style={{ padding: '16px 24px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-2)', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleChange} disabled={loading || pw.length < 6} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: (loading || pw.length < 6) ? 0.5 : 1 }}>
                {loading ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
