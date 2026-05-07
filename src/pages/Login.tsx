import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Truck, ArrowRight, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error: err } = await signIn(email, password)
    if (err) {
      if (err.message.includes('Invalid login')) {
        setError('E-mail ou senha incorretos')
      } else {
        setError(err.message)
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#0f0f11' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>
            <Truck style={{ width: 28, height: 28, color: 'white' }} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.03em' }}>RotaFlow</h1>
          <p style={{ fontSize: 14, color: '#666', marginTop: 6, fontWeight: 500 }}>Controle inteligente de transportadora</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#1c1c1c', border: '1px solid #303030', borderRadius: 16, padding: 32 }}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#555' }} />
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                required
                style={{
                  width: '100%', borderRadius: 10, border: '1px solid #303030',
                  paddingLeft: 42, paddingRight: 14, paddingTop: 12, paddingBottom: 12,
                  fontSize: 14, color: '#f5f5f5', background: '#141414', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#555' }} />
              <input
                type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                required
                style={{
                  width: '100%', borderRadius: 10, border: '1px solid #303030',
                  paddingLeft: 42, paddingRight: 44, paddingTop: 12, paddingBottom: 12,
                  fontSize: 14, color: '#f5f5f5', background: '#141414', outline: 'none',
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: 4 }}
              >
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#ef444412', border: '1px solid #ef444430', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: '#ef4444' }}>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading || !email || !password}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 16px', borderRadius: 10, border: 'none',
              fontSize: 14, fontWeight: 600, color: 'white',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
              opacity: (loading || !email || !password) ? 0.5 : 1,
              transition: 'all 150ms',
            }}
          >
            {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <><span>Entrar</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 16 }}>
            Acesso restrito a convidados
          </p>
        </form>
      </div>
    </div>
  )
}
