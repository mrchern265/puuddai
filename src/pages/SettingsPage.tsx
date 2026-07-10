import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getProfile } from '../lib/data'
import type { Profile } from '../types'
import { Button, Card, BottomNav, PhoneFrame, LoadingScreen } from '../components/ui'

const LEVEL_LABELS: Record<string, string> = {
  A0: 'เริ่มต้น (A0)',
  A1: 'พื้นฐาน (A1)',
  A2: 'ต้น-กลาง (A2)',
}

function levelLabel(level: string | undefined | null): string {
  if (!level) return 'ยังไม่ระบุ'
  return LEVEL_LABELS[level] ?? level
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signOut } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState<boolean>(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    getProfile(user.id)
      .then((p) => {
        if (active) setProfile(p)
      })
      .catch(() => {
        if (active) setError('โหลดข้อมูลโปรไฟล์ไม่สำเร็จ')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [user, authLoading])

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login')
    } catch {
      setError('ออกจากระบบไม่สำเร็จ ลองอีกครั้ง')
      setSigningOut(false)
    }
  }

  if (authLoading || loading) {
    return <LoadingScreen text="กำลังโหลดการตั้งค่า…" />
  }

  const email = user?.email ?? 'ไม่ทราบอีเมล'
  const displayName = profile?.display_name?.trim() || 'ผู้เรียน'
  const cefr = levelLabel(profile?.cefr_level)

  return (
    <PhoneFrame>
      <header className="hero-gradient px-5 pb-8 pt-10 text-white">
        <h1 className="text-2xl font-bold">ตั้งค่า</h1>
        <p className="mt-1 text-sm text-white/80">จัดการบัญชีและข้อมูลของคุณ</p>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
            👤
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{displayName}</p>
            <p className="truncate text-sm text-white/80">{email}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 px-5 py-6">
        {error && (
          <Card className="border border-red-200 bg-red-50">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </Card>
        )}

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-brand">ข้อมูลบัญชี</h2>

          <div className="flex items-center justify-between gap-3 border-b border-brand-light py-3">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <span aria-hidden>📧</span> อีเมล
            </span>
            <span className="truncate text-sm font-medium text-gray-800">{email}</span>
          </div>

          <div className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <span aria-hidden>🎯</span> ระดับ
            </span>
            <span className="rounded-full bg-brand-light px-3 py-1 text-sm font-semibold text-brand">
              {cefr}
            </span>
          </div>
        </Card>

        <Card className="bg-brand-light/60">
          <p className="text-sm leading-relaxed text-gray-600">
            <span aria-hidden className="mr-1">ℹ️</span>
            การยืนยันอีเมล/ระบบสมาชิกจะเพิ่มในอนาคต
          </p>
        </Card>

        <div className="pt-2">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full border border-red-200 text-red-600"
          >
            {signingOut ? 'กำลังออกจากระบบ…' : '🚪 ออกจากระบบ'}
          </Button>
        </div>

        <p className="pt-2 text-center text-xs text-gray-400">PuudDai • เรียนอังกฤษง่ายๆ ทุกวัน</p>
      </main>

      <BottomNav />
    </PhoneFrame>
  )
}
