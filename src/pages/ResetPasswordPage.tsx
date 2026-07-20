import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, authErrorTh } from '../lib/auth'
import { Button, TextField } from '../components/ui'

export default function ResetPasswordPage() {
  const { session, loading, updatePassword } = useAuth()
  const nav = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    if (password !== confirm) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน')
      return
    }
    setBusy(true)
    const { error } = await updatePassword(password)
    setBusy(false)
    if (error) {
      setError(authErrorTh(error))
      return
    }
    setDone(true)
  }

  // The recovery link signs the user in with a temporary session. If there is
  // no session (link expired or opened directly), guide them to request a new one.
  if (!loading && !session && !done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
        <div className="text-4xl">⌛</div>
        <h1 className="mt-3 text-2xl font-black text-brand">ลิงก์หมดอายุ</h1>
        <p className="mt-2 text-gray-500">
          ลิงก์ตั้งรหัสผ่านใหม่ใช้ไม่ได้แล้ว หรือถูกเปิดผิดวิธี ลองขอลิงก์ใหม่อีกครั้งนะ
        </p>
        <Link
          to="/forgot-password"
          className="mt-5 inline-block font-semibold text-brand hover:underline"
        >
          ขอลิงก์ใหม่
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-1 text-3xl font-black text-brand">ตั้งรหัสผ่านใหม่</h1>
      <p className="mb-8 text-gray-500">ใส่รหัสผ่านใหม่ที่อยากใช้</p>

      {done ? (
        <div className="rounded-2xl bg-success-light p-5 text-center">
          <div className="text-4xl">✅</div>
          <p className="mt-2 font-bold text-success">เปลี่ยนรหัสผ่านเรียบร้อย!</p>
          <p className="mt-1 text-sm text-slate-600">ตอนนี้ใช้รหัสผ่านใหม่เข้าสู่ระบบได้เลย</p>
          <Button variant="primary" className="mt-4 w-full" onClick={() => nav('/home', { replace: true })}>
            ไปหน้าเรียน 🚀
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <TextField
            label="รหัสผ่านใหม่"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="อย่างน้อย 6 ตัวอักษร"
          />
          <TextField
            label="ยืนยันรหัสผ่านใหม่"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button variant="primary" type="submit" disabled={busy} className="mt-2">
            {busy ? 'กำลังบันทึก…' : 'บันทึกรหัสผ่านใหม่'}
          </Button>
        </form>
      )}
    </div>
  )
}
