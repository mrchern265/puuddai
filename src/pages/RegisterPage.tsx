import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, authErrorTh } from '../lib/auth'
import { Button, TextField } from '../components/ui'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const nav = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!displayName.trim()) {
      setError('กรุณากรอกชื่อที่แสดง')
      return
    }
    setBusy(true)
    const { error } = await signUp(email, password, displayName.trim())
    setBusy(false)
    if (error) {
      setError(authErrorTh(error))
      return
    }
    nav('/onboarding', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-1 text-3xl font-black text-brand">สมัครเรียนฟรी</h1>
      <p className="mb-8 text-gray-500">เริ่มเรียนภาษาอังกฤษได้ทันที ไม่มีค่าใช้จ่าย</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <TextField
          label="ชื่อที่แสดง"
          type="text"
          value={displayName}
          onChange={setDisplayName}
          placeholder="เช่น น้องพูดได้"
        />
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
          placeholder="อย่างน้อย 6 ตัวอักษร"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button variant="accent" type="submit" disabled={busy} className="mt-2">
          {busy ? 'กำลังสมัคร…' : 'สมัครและเริ่มเรียน'}
        </Button>
      </form>
      <p className="mt-6 text-center text-gray-500">
        มีบัญชีแล้ว?{' '}
        <Link to="/login" className="font-semibold text-brand">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  )
}
