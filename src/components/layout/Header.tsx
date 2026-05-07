import { Menu, Truck } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header
      className="sticky top-0 z-30"
      style={{ background: isDark ? '#141414' : '#f5f5f7' }}
    >
      {/* Mobile header */}
      <div
        className="flex items-center gap-3 md:hidden"
        style={{ height: 56, padding: '0 16px', borderBottom: `1px solid ${isDark ? '#222' : '#e2e2e5'}` }}
      >
        <button
          onClick={onMenuClick}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: 'transparent', border: `1px solid ${isDark ? '#303030' : '#e2e2e5'}`, cursor: 'pointer', color: isDark ? '#888' : '#666' }}
        >
          <Menu style={{ width: 18, height: 18 }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck style={{ width: 13, height: 13, color: 'white' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f5f5f5' : '#1a1a1a' }}>RotaFlow</span>
        </div>
      </div>

      {/* Desktop header */}
      <div
        className="hidden md:flex items-center"
        style={{ padding: '28px 40px 20px' }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: isDark ? '#f5f5f5' : '#1a1a1a', letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
      </div>
    </header>
  )
}
