import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { DashboardPage } from '@/pages/Dashboard'
import { FinancialPage } from '@/pages/Financial'
import { RoutesPage } from '@/pages/Routes'
import { RouteDetailPage } from '@/pages/RouteDetail'
import { UsersPage } from '@/pages/Users'
import { LoginPage } from '@/pages/Login'
import { PublicDeliveryPage } from '@/pages/PublicDelivery'
import { Loader2 } from 'lucide-react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
})

function ProtectedRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>
        <Loader2 style={{ width: 24, height: 24, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!session) return <LoginPage />

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/financeiro" element={<FinancialPage />} />
      <Route path="/rotas" element={<RoutesPage />} />
      <Route path="/rotas/:id" element={<RouteDetailPage />} />
      <Route path="/usuarios" element={<UsersPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function ThemeInit() {
  useTheme()
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeInit />
          <Routes>
            <Route path="/entrega/:token" element={<PublicDeliveryPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-foreground)',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
