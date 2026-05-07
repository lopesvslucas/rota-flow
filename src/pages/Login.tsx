import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Truck, ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, KeyRound, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

type PageMode = 'login' | 'reset-request' | 'reset-confirm'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<PageMode>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error: err } = await signUp(email, password)
      if (err) {
        setError(err.message)
      } else {
        toast.success('Conta criada! Fazendo login...')
        // Auto-login after signup
        const { error: loginErr } = await signIn(email, password)
        if (loginErr) setError(loginErr.message)
      }
    } else {
      const { error: err } = await signIn(email, password)
      if (err) {
        if (err.message.includes('Invalid login')) {
          setError('E-mail ou senha incorretos')
        } else {
          setError(err.message)
        }
      }
    }
    setLoading(false)
  }

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!resetEmail) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/`,
    })
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
      toast.success('Email de recuperação enviado!')
    }
    setLoading(false)
  }

  if (mode === 'reset-request') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#0f0f11' }}>
        <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}>
              <KeyRound style={{ width: 28, height: 28, color: 'white' }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-0.03em' }}>Recuperar Senha</h1>
            <p style={{ fontSize: 14, color: '#555', marginTop: 6, fontWeight: 500, textAlign: 'center' }}>
              {resetSent ? 'Verifique seu email para redefinir a senha' : 'Informe seu email para receber o link de recuperação'}
            </p>
          </div>

          {!resetSent ? (
            <form onSubmit={handleResetRequest} style={{ background: '#1c1c1c', border: '1px solid #303030', borderRadius: 16, padding: 32 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>E-mail</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#555' }} />
                  <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="nome@empresa.com" required
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #303030', paddingLeft: 42, paddingRight: 14, paddingTop: 12, paddingBottom: 12, fontSize: 14, color: '#f5f5f5', background: '#141414', outline: 'none' }} />
                </div>
              </div>

              {error && (
                <div style={{ background: '#ef444412', border: '1px solid #ef444430', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                  <span style={{ fontSize: 13, color: '#ef4444' }}>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading || !resetEmail}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)', cursor: (loading || !resetEmail) ? 'not-allowed' : 'pointer', opacity: (loading || !resetEmail) ? 0.5 : 1, transition: 'all 150ms' }}>
                {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : 'Enviar link de recuperação'}
              </button>

              <button type="button" onClick={() => { setMode('login'); setError(''); setResetSent(false) }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, padding: '8px', background: 'transparent', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <ChevronLeft style={{ width: 14, height: 14 }} /> Voltar ao login
              </button>
            </form>
          ) : (
            <div style={{ background: '#1c1c1c', border: '1px solid #303030', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#22c55e20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Mail style={{ width: 24, height: 24, color: '#22c55e' }} />
              </div>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 20 }}>
                Enviamos um link de recuperação para <strong style={{ color: '#f5f5f5' }}>{resetEmail}</strong>. Verifique sua caixa de entrada.
              </p>
              <button onClick={() => { setMode('login'); setResetSent(false); setError('') }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                Voltar ao login
              </button>
            </div>
          )}
        </div>
      </div>
    )
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
          <p style={{ fontSize: 14, color: '#555', marginTop: 6, fontWeight: 500 }}>Controle inteligente de transportadora</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#1c1c1c', border: '1px solid #303030', borderRadius: 16, padding: 32 }}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>E-mail</label>
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
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Senha</label>
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

          {/* Forgot password link */}
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <button type="button" onClick={() => { setMode('reset-request'); setError(''); setResetEmail(email) }}
              style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: 0 }}>
              Esqueci minha senha
            </button>
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
            {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <><span>{isSignUp ? 'Criar conta' : 'Entrar'}</span><ArrowRight style={{ width: 16, height: 16 }} /></>}
          </button>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              style={{ background: 'transparent', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', padding: 0 }}>
              {isSignUp ? 'Já tem conta? ' : 'Primeiro acesso? '}
              <span style={{ color: '#6366f1', fontWeight: 600 }}>{isSignUp ? 'Fazer login' : 'Criar conta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
