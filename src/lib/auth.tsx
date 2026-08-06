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
  signUp: (
    username: string,
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: string | null }>
  // `identifier` may be a username or an email — usernames are resolved to the
  // account email before signing in.
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION plus every SIGNED_IN/OUT/TOKEN_REFRESHED.
    // Track that so the initial getSession() (which may resolve LATE with a stale
    // null) can't clobber a session already set by an auth event — that race was
    // signing users out shortly after they signed up.
    let gotEvent = false
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      gotEvent = true
      setSession(s)
      setLoading(false)
    })
    supabase.auth.getSession().then(({ data }) => {
      if (gotEvent) return
      setSession(data.session)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signUp = async (
    username: string,
    email: string,
    password: string,
    displayName: string,
  ) => {
    const uname = username.trim()

    // Reject a taken username up front (the DB unique index is the real guard,
    // but this gives a friendly message before we create the auth account).
    const { data: taken } = await supabase.rpc('email_for_username', { uname })
    if (taken) return { error: 'username-taken' }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, username: uname } },
    })
    if (error) return { error: error.message }

    // When email confirmation is off, signUp returns a session and the user is
    // already logged in. If no session came back, sign in right away so signup
    // flows straight into the app (no separate login step).
    let activeSession = data.session
    if (!activeSession) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password })
      if (signInError) return { error: signInError.message }
      activeSession = signInData.session
    }

    // profiles row is auto-created by the handle_new_user trigger; set the
    // username + display name on it now.
    const uid = activeSession?.user?.id ?? data.user?.id
    if (uid) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: uname, display_name: displayName.trim() })
        .eq('id', uid)
      if (profileError)
        return {
          error: /duplicate|unique/i.test(profileError.message)
            ? 'username-taken'
            : profileError.message,
        }
    }
    return { error: null }
  }
  const signIn = async (identifier: string, password: string) => {
    let email = identifier.trim()
    // No "@" → treat it as a username and resolve to the account email first.
    if (!email.includes('@')) {
      const { data, error } = await supabase.rpc('email_for_username', { uname: email })
      if (error) return { error: error.message }
      if (!data) return { error: 'no-username' }
      email = data as string
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }
  const signOut = async () => {
    await supabase.auth.signOut()
  }
  // Sends a password-recovery email. The link brings the user back to
  // /reset-password, where detectSessionInUrl establishes a temporary session.
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error?.message ?? null }
  }
  // Sets a new password for the currently-authenticated (recovery) session.
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
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
  if (msg === 'username-taken') return 'ชื่อผู้ใช้นี้ถูกใช้แล้ว ลองชื่ออื่นครับ'
  if (msg === 'no-username') return 'ไม่พบชื่อผู้ใช้นี้ ลองใหม่หรือสมัครก่อนครับ'
  if (/already registered|already exists|user already/i.test(msg))
    return 'อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน'
  if (/password/i.test(msg)) return 'รหัสผ่านไม่ผ่าน (อย่างน้อย 6 ตัวอักษร)'
  if (/invalid login|invalid credentials/i.test(msg))
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  if (/invalid|email/i.test(msg)) return 'อีเมลไม่ถูกต้อง'
  return 'เกิดข้อผิดพลาด: ' + msg
}
