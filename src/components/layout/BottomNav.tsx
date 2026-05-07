import { NavLink } from 'react-router-dom'
import { LayoutDashboard, DollarSign, Truck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { hasPermission, canManageUsers } from '@/lib/permissions'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Início', permission: null },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro', permission: 'financeiro' as const },
  { to: '/rotas', icon: Truck, label: 'Rotas', permission: 'rotas' as const },
  { to: '/usuarios', icon: Users, label: 'Usuários', permission: 'usuarios' as const },
]

export function BottomNav() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const filteredItems = navItems.filter(item => {
    if (!item.permission) return true
    if (item.permission === 'usuarios') return canManageUsers(user)
    return hasPermission(user, item.permission)
  })

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t md:hidden safe-bottom"
      style={{ background: isDark ? '#111111' : '#ffffff', borderColor: isDark ? '#303030' : '#e2e2e5' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {filteredItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors duration-150',
                isActive ? 'text-accent' : 'text-text-3'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
