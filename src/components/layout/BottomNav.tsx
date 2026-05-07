import { NavLink } from 'react-router-dom'
import { LayoutDashboard, DollarSign, Truck, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Início' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/rotas', icon: Truck, label: 'Rotas' },
  { to: '/usuarios', icon: Users, label: 'Usuários' },
  { to: '/configuracoes', icon: Settings, label: 'Config' },
]

export function BottomNav() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t md:hidden safe-bottom"
      style={{ background: isDark ? '#111111' : '#ffffff', borderColor: isDark ? '#303030' : '#e2e2e5' }}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors duration-150',
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
