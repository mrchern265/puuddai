import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, authErrorTh } from '../lib/auth'
import { Button, TextField } from '../components/ui'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await resetPassword(email.trim())
    setBusy(false)
    if (error) {
      setError(authErrorTh(error))
      return
    }
    setSent(true)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-1 text-3xl font-black text-brand">ลืมรหัสผ่าน?</h1>
      <p className="mb-8 text-gray-500">
        ใส่อีเมลที่สมัครไว้ เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้
      </p>

      {sent ? (
        <div className="rounded-2xl bg-success-light p-5 text-center">
          <div className="text-4xl">📬</div>
          <p className="mt-2 font-bold text-success">ส่งลิงก์ไปที่อีเมลแล้ว</p>
          <p className="mt-1 text-sm text-slate-600">
            เปิดอีเมล <span className="font-semibold">{email}</span> แล้วกดลิงก์เพื่อตั้งรหัสผ่านใหม่
            (ถ้าไม่เจอ ลองดูในกล่องสแปม)
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block font-semibold text-brand hover:underline"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <TextField
              label="อีเมล"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@email.com"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button variant="primary" type="submit" disabled={busy} className="mt-2">
              {busy ? 'กำลังส่ง…' : 'ส่งลิงก์ตั้งรหัสใหม่'}
            </Button>
          </form>
          <p className="mt-6 text-center text-gray-500">
            นึกออกแล้ว?{' '}
            <Link to="/login" className="font-semibold text-brand">
              เข้าสู่ระบบ
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
