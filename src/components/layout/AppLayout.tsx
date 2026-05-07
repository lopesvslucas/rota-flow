import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Header } from './Header'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

interface AppLayoutProps {
  title: string
  children: ReactNode
}

export function AppLayout({ title, children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const bg = isDark ? '#141414' : '#f5f5f7'

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-40" style={{ width: 220 }}>
        <Sidebar />
      </div>

      {/* Desktop main */}
      <div className="hidden md:flex flex-col min-h-screen" style={{ marginLeft: 220 }}>
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="page-enter" style={{ padding: '0 40px 40px', background: bg, minHeight: '100vh', flex: 1 }}>{children}</main>
      </div>

      {/* Mobile main */}
      <div className="md:hidden min-h-screen pb-20">
        <Header title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 py-5 page-enter">{children}</main>
      </div>

      <BottomNav />
    </div>
  )
}
