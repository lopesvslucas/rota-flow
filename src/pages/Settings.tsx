import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun, User, Building2, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const { user, company } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <AppLayout title="Configurações">
      <div className="space-y-4 max-w-2xl">
        {/* Perfil */}
        <div className="rounded-[10px] border overflow-hidden" style={{ background: '#171717', borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-center rounded-[9px]" style={{ width: 34, height: 34, background: '#6366f120' }}>
              <User className="h-4 w-4" style={{ color: '#6366f1' }} />
            </div>
            <h4 className="text-[14px] font-semibold text-text">Perfil</h4>
          </div>
          <div>
            <div className="flex items-center justify-between px-5 py-[14px] border-b" style={{ borderColor: '#2a2a2a' }}>
              <span className="text-[14px] text-text-2">Nome</span>
              <span className="text-[14px] font-medium text-text">{user?.name ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-[14px] border-b" style={{ borderColor: '#2a2a2a' }}>
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
        <div className="rounded-[10px] border overflow-hidden" style={{ background: '#171717', borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
            <div className="flex items-center justify-center rounded-[9px]" style={{ width: 34, height: 34, background: '#3b82f620' }}>
              <Building2 className="h-4 w-4" style={{ color: '#3b82f6' }} />
            </div>
            <h4 className="text-[14px] font-semibold text-text">Empresa</h4>
          </div>
          <div className="flex items-center justify-between px-5 py-[14px]">
            <span className="text-[14px] text-text-2">Nome</span>
            <span className="text-[14px] font-medium text-text">{company?.name ?? '—'}</span>
          </div>
        </div>

        {/* Aparência */}
        <div className="rounded-[10px] border p-5" style={{ background: '#171717', borderColor: '#2a2a2a' }}>
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
              style={{ background: theme === 'dark' ? '#6366f1' : '#2a2a2a' }}
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
