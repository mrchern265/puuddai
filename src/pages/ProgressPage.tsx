import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import {
  getProfile,
  getSkillProfile,
  getMyProgress,
  getAllLessons,
  getAssessments,
} from '../lib/data'
import type {
  Profile,
  SkillProfile,
  UserLessonProgress,
  Lesson,
  AssessmentResult,
} from '../types'
import { BottomNav, Button, LoadingScreen, PhoneFrame } from '../components/ui'

interface SkillBar {
  label: string
  emoji: string
  value: number
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0
  if (n < 0) return 0
  if (n > 100) return 100
  return Math.round(n)
}

function SkillProgressBar({ label, emoji, value }: SkillBar) {
  const pct = clamp(value)
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {emoji} {label}
        </span>
        <span className="text-sm font-semibold text-brand">{pct}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-brand-light">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skill, setSkill] = useState<SkillProfile | null>(null)
  const [progress, setProgress] = useState<UserLessonProgress[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [assessments, setAssessments] = useState<AssessmentResult[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const [p, s, prog, all, asmts] = await Promise.all([
          getProfile(user.id),
          getSkillProfile(user.id),
          getMyProgress(user.id),
          getAllLessons(),
          getAssessments(user.id),
        ])
        if (cancelled) return
        setProfile(p)
        setSkill(s)
        setProgress(prog)
        setLessons(all)
        setAssessments(asmts)
      } catch {
        if (cancelled) return
        setError('โหลดข้อมูลความก้าวหน้าไม่สำเร็จ ลองใหม่อีกครั้ง')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return <LoadingScreen text="กำลังโหลดความก้าวหน้า…" />
  }

  if (!user) {
    return (
      <PhoneFrame>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="text-4xl">🔒</div>
          <p className="text-slate-600">กรุณาเข้าสู่ระบบเพื่อดูความก้าวหน้า</p>
        </div>
        <BottomNav />
      </PhoneFrame>
    )
  }

  const cefr = profile?.cefr_level ?? 'A0'
  const streak = profile?.streak_count ?? 0
  const completedCount = progress.filter((p) => p.status === 'completed').length
  const totalLessons = lessons.length
  const xp = completedCount * 50

  const pre = assessments.find((a) => a.kind === 'pre') ?? null
  const post = assessments.find((a) => a.kind === 'post') ?? null
  const latest = post ?? pre
  const delta = pre && post ? post.total_score - pre.total_score : null

  // Prefer measured assessment skill scores; fall back to skill profile.
  const skillBars: SkillBar[] = [
    { label: 'การฟัง', emoji: '👂', value: latest?.listening_score ?? skill?.listening_score ?? 0 },
    { label: 'คำศัพท์', emoji: '📚', value: latest?.vocab_score ?? skill?.vocab_score ?? 0 },
    { label: 'ไวยากรณ์', emoji: '✍️', value: latest?.grammar_score ?? skill?.grammar_score ?? 0 },
  ]

  return (
    <PhoneFrame>
      <header className="hero-gradient px-6 pb-7 pt-8 text-white">
        <h1 className="text-2xl font-bold">ความก้าวหน้า</h1>
        <p className="mt-1 text-sm text-white/80">ติดตามพัฒนาการของคุณ</p>
        <div className="mt-5 flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
            <div className="text-xs text-white/80">ระดับ CEFR</div>
            <div className="text-xl font-bold">{cefr}</div>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
            <div className="text-xs text-white/80">สตรีค</div>
            <div className="text-xl font-bold">🔥 {streak} วัน</div>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-5 overflow-y-auto p-5">
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-3xl font-bold text-brand">⭐ {xp}</div>
            <div className="mt-1 text-sm text-slate-500">XP รวม</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="text-3xl font-bold text-accent">
              {completedCount}
              <span className="text-lg text-slate-400"> / {totalLessons}</span>
            </div>
            <div className="mt-1 text-sm text-slate-500">เรียนจบแล้ว {completedCount} บท</div>
          </div>
        </section>

        {/* Assessment: measurable pre -> post */}
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">แบบวัดผล 📊</h2>
          {pre ? (
            <div className="flex items-center justify-around rounded-2xl bg-brand-light py-4 text-center">
              <div>
                <div className="text-xs text-slate-500">ตอนเริ่ม</div>
                <div className="text-2xl font-extrabold text-slate-700">{pre.total_score}</div>
                <div className="text-xs text-slate-400">{pre.cefr_level}</div>
              </div>
              <div className="text-2xl text-slate-300">→</div>
              <div>
                <div className="text-xs text-slate-500">ล่าสุด</div>
                <div className="text-2xl font-extrabold text-brand">
                  {post ? post.total_score : '—'}
                </div>
                <div className="text-xs text-slate-400">{post ? post.cefr_level : 'ยังไม่ทำ'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">พัฒนา</div>
                <div
                  className={`text-2xl font-extrabold ${
                    delta === null ? 'text-slate-300' : delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-slate-400'
                  }`}
                >
                  {delta === null ? '—' : delta > 0 ? `+${delta}` : delta}
                </div>
                <div className="text-xs text-slate-400">คะแนน</div>
              </div>
            </div>
          ) : (
            <p className="mb-3 text-sm text-slate-500">ยังไม่มีผลวัดระดับ ลองทำแบบทดสอบเพื่อเก็บคะแนนเริ่มต้น</p>
          )}
          <div className="mt-4">
            <Button variant="primary" className="w-full" onClick={() => navigate('/assessment')}>
              {post || pre ? 'ทำแบบวัดผลอีกครั้ง' : 'ทำแบบทดสอบวัดผล'}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">ทักษะของคุณ</h2>
          {skillBars.map((b) => (
            <SkillProgressBar key={b.label} label={b.label} emoji={b.emoji} value={b.value} />
          ))}
          {!latest && !skill && (
            <p className="mt-2 text-xs text-slate-400">ทำแบบทดสอบวัดผลเพื่อดูคะแนนทักษะ</p>
          )}
        </section>
      </main>

      <BottomNav />
    </PhoneFrame>
  )
}
