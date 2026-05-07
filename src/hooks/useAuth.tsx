import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User, Company } from '@/types'

// Developer email - always has access as owner
const DEV_EMAIL = 'lugotgroup@gmail.com'

interface AuthContextType {
  session: Session | null
  user: User | null
  company: Company | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchUserProfile(userId: string, email: string) {
    // First check if there's an existing profile by auth ID
    let { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      // Check if there's a pending invite by email
      const { data: invitedProfile } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (invitedProfile && invitedProfile.id !== userId) {
        // Update the invited profile with the real auth user ID
        const { data: updated } = await supabase
          .from('users')
          .update({ id: userId })
          .eq('email', email)
          .select()
          .single()

        profile = updated
      } else if (invitedProfile) {
        profile = invitedProfile
      }
    }

    // If no profile exists, check if it's the developer email
    if (!profile) {
      if (email === DEV_EMAIL) {
        profile = await autoCreateDevProfile(userId, email)
      } else {
        // Not invited - sign out
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setCompany(null)
        setLoading(false)
        return
      }
    }

    if (profile) {
      setUser(profile)

      if (profile.company_id) {
        const { data: comp } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single()

        if (comp) setCompany(comp)
      }
    }
  }

  async function autoCreateDevProfile(userId: string, email: string): Promise<User | null> {
    const { data: comp, error: compError } = await supabase
      .from('companies')
      .insert({ name: 'Minha Transportadora' })
      .select()
      .single()

    if (compError || !comp) return null

    const { data: profile, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        company_id: comp.id,
        email,
        name: 'Desenvolvedor',
        role: 'owner',
        permissions: { financeiro: true, rotas: true, usuarios: true },
      })
      .select()
      .single()

    if (userError || !profile) return null

    setCompany(comp)
    return profile
  }

  async function refreshUser() {
    if (session?.user) {
      await fetchUserProfile(session.user.id, session.user.email ?? '')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        fetchUserProfile(s.user.id, s.user.email ?? '').finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        fetchUserProfile(s.user.id, s.user.email ?? '').finally(() => setLoading(false))
      } else {
        setUser(null)
        setCompany(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signUp(email: string, password: string) {
    // Check if this email is invited or is the dev email
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (!existingUser && email !== DEV_EMAIL) {
      return { error: new Error('Este e-mail não foi convidado. Solicite um convite ao administrador.') }
    }

    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setCompany(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        company,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
