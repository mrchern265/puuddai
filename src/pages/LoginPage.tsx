import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, authErrorTh } from '../lib/auth'
import { Button, TextField } from '../components/ui'

export default function LoginPage() {
  const { signIn, session, loading } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) {
      setError(authErrorTh(error))
      return
    }
    nav('/home', { replace: true })
  }

  if (!loading && session) return <Navigate to="/home" replace />

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-1 text-3xl font-black text-brand">เข้าสู่ระบบ</h1>
      <p className="mb-8 text-gray-500">ยินดีต้อนรับกลับมา</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <TextField
          label="อีเมล"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@email.com"
        />
        <TextField
          label="รหัสผ่าน"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="รหัสผ่าน"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-brand hover:underline">
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <Button variant="primary" type="submit" disabled={busy} className="mt-1">
          {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
        </Button>
      </form>
      <p className="mt-6 text-center text-gray-500">
        ยังไม่มีบัญชี?{' '}
        <Link to="/register" className="font-semibold text-brand">
          สมัครฟรี
        </Link>
      </p>
    </div>
  )
}
