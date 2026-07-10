import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'

interface AuthCtx {
  session: Session | null
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  }
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider
      value={{ session, user: session?.user ?? null, loading, signUp, signIn, signOut }}
    >
      {children}
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const loc = useLocation()
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-brand">
        กำลังโหลด…
      </div>
    )
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <>{children}</>
}

// eslint-disable-next-line react-refresh/only-export-components
export function authErrorTh(msg: string): string {
  if (/already registered|already exists|user already/i.test(msg))
    return 'อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน'
  if (/password/i.test(msg)) return 'รหัสผ่านไม่ผ่าน (อย่างน้อย 6 ตัวอักษร)'
  if (/invalid login|invalid credentials/i.test(msg))
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  if (/invalid|email/i.test(msg)) return 'อีเมลไม่ถูกต้อง'
  return 'เกิดข้อผิดพลาด: ' + msg
}
