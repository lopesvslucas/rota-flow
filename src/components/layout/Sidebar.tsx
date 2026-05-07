import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  DollarSign,
  Truck,
  Users,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
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
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', background: 'transparent', border: '1px solid transparent', color: '#666', cursor: 'pointer' }}
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
