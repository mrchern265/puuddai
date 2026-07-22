import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const FEATURES: [string, string][] = [
  ['🎧', 'ฟัง'],
  ['📚', 'ศัพท์'],
  ['💬', 'พูดจริง'],
]

export default function LandingPage() {
  const { session, loading } = useAuth()
  // Already signed in → go straight to the app instead of showing the
  // marketing/login page again (the "must log in every time I open it" feeling).
  if (loading) return null
  if (session) return <Navigate to="/home" replace />

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <div className="hero-gradient flex flex-1 flex-col items-center justify-center px-6 py-16 text-center text-white">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
          <span className="rounded bg-white/25 px-1.5 py-0.5 text-xs font-bold">TH</span>
          เรียนฟรี ไม่มีค่าใช้จ่าย
        </span>
        <div className="mb-2 text-6xl">🗣️</div>
        <h1 className="text-5xl font-black">พูดได้</h1>
        <p className="mb-8 text-white/70">PuudDai</p>
        <h2 className="mb-4 text-3xl font-bold leading-snug text-balance">
          เรียนภาษาอังกฤษ
          <br />
          เพื่อการสื่อสาร
        </h2>
        <p className="mb-10 max-w-sm text-white/80">
          สำหรับคนไทยเริ่มต้น ฟัง พูด จำศัพท์ ใช้ได้จริงในชีวิตประจำวัน
        </p>
        <Link
          to="/register"
          className="w-full max-w-sm rounded-full bg-accent px-8 py-4 text-lg font-bold shadow-lg transition hover:bg-accent-dark"
        >
          เริ่มเรียนฟรี
        </Link>
        <Link to="/login" className="mt-4 text-white/80 transition hover:text-white">
          มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 bg-white px-4 py-6">
        {FEATURES.map(([icon, label]) => (
          <div key={label} className="rounded-2xl bg-brand-light/50 py-5 text-center">
            <div className="text-2xl">{icon}</div>
            <div className="mt-1 text-sm font-semibold text-brand">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
