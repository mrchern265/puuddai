import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getUnits, getAllLessons, getMyProgress, getProfile } from '../lib/data'
import type { Unit, Lesson, UserLessonProgress, Profile } from '../types'
import { BottomNav, LoadingScreen, PhoneFrame, XpBar } from '../components/ui'
import { unitGlyph } from '../lib/units'
import { getDaily } from '../lib/daily'

const XP_PER_LESSON = 50
const XP_PER_LEVEL = 150

// A lively accent per category card, cycled by index.
const UNIT_TINTS = [
  { bar: 'bg-brand', ring: 'text-brand', soft: 'bg-brand-light' },
  { bar: 'bg-accent', ring: 'text-accent', soft: 'bg-accent/15' },
  { bar: 'bg-success', ring: 'text-success', soft: 'bg-success-light' },
  { bar: 'bg-grape', ring: 'text-grape', soft: 'bg-grape/15' },
]

export default function HomePage() {
  const { user, signOut } = useAuth()
  const nav = useNavigate()
  const [units, setUnits] = useState<Unit[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<UserLessonProgress[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getUnits(),
      getAllLessons(),
      getMyProgress(user.id),
      getProfile(user.id),
    ])
      .then(([u, l, p, pr]) => {
        setUnits(u)
        setLessons(l)
        setProgress(p)
        setProfile(pr)
      })
      .catch((e) => console.error('home load error', e))
      .finally(() => setLoading(false))
  }, [user])

  const doneIds = useMemo(
    () => new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lesson_id)),
    [progress],
  )

  if (loading) return <LoadingScreen />

  const name = profile?.display_name ?? user?.email?.split('@')[0] ?? 'เพื่อน'
  const xp = doneIds.size * XP_PER_LESSON
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = xp % XP_PER_LEVEL
  const daily = getDaily()
  const streak = daily.streak
  const cefr = profile?.cefr_level ?? 'A0'
  const goalPct = Math.min(100, Math.round((daily.count / daily.goal) * 100))

  return (
    <PhoneFrame>
      <header className="hero-gradient rounded-b-3xl px-5 pb-6 pt-7 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/80">สวัสดี, {name} 👋</div>
            <div className="text-lg font-bold">มาเล่นให้เก่งขึ้นกัน!</div>
          </div>
          <button
            onClick={async () => {
              await signOut()
              nav('/login')
            }}
            className="rounded-full bg-white/20 px-3 py-1 text-sm hover:bg-white/30"
          >
            ออก
          </button>
        </div>

        {/* level + xp progress */}
        <div className="mt-5 rounded-2xl bg-white/12 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold">🏅 เลเวล {level}</span>
            <span className="text-white/80">
              {xpIntoLevel} / {XP_PER_LEVEL} XP
            </span>
          </div>
          <XpBar value={xpIntoLevel} max={XP_PER_LEVEL} className="mt-2 bg-white/20" />
          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">🔥 {streak} วัน</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">⭐ {xp} XP</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">🎯 {cefr}</span>
          </div>

          {/* daily review goal */}
          <div className="mt-3 border-t border-white/15 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold">🎯 เป้าหมายทบทวนวันนี้</span>
              <span className="text-white/85">
                {Math.min(daily.count, daily.goal)}/{daily.goal} คำ {daily.goalMet ? '✓' : ''}
              </span>
            </div>
            <XpBar value={goalPct} max={100} className="mt-1.5 bg-white/20" />
            {!daily.goalMet && (
              <button
                onClick={() => nav('/review')}
                className="mt-2 w-full rounded-full bg-gold py-2 text-sm font-bold text-[#3a2a06] transition active:scale-95"
              >
                ทบทวนต่อ →
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <h2 className="mb-1 font-bold text-slate-800">เลือกหมวดที่อยากเล่น</h2>
        <p className="mb-4 text-xs text-slate-500">แตะหมวดไหนก็ได้ เล่นก่อน-หลังได้ตามใจ 🎈</p>

        <div className="grid grid-cols-2 gap-3">
          {units.map((u, ui) => {
            const unitLessons = lessons.filter((l) => l.unit_id === u.id)
            const total = unitLessons.length
            const doneInUnit = unitLessons.filter((l) => doneIds.has(l.id)).length
            const allDone = total > 0 && doneInUnit === total
            const pct = total > 0 ? Math.round((doneInUnit / total) * 100) : 0
            const tint = UNIT_TINTS[ui % UNIT_TINTS.length]
            return (
              <button
                key={u.id}
                onClick={() => nav(`/unit/${u.id}`)}
                title={u.title_th}
                className="group relative flex flex-col items-center rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              >
                {allDone && (
                  <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-success text-xs font-bold text-white shadow">
                    ✓
                  </span>
                )}
                <div
                  className={`grid h-16 w-16 place-items-center overflow-hidden rounded-2xl text-4xl leading-none transition group-hover:scale-105 ${tint.soft}`}
                >
                  {unitGlyph(u.milestone_badge)}
                </div>
                <div className={`mt-2 text-[10px] font-bold uppercase tracking-wide ${tint.ring}`}>
                  Unit {u.order_index} · {u.cefr_level}
                </div>
                <div className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-slate-800">
                  {u.title_th}
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${tint.bar} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[11px] font-bold text-slate-400">
                  {allDone ? 'จบแล้ว 🎉' : `${doneInUnit}/${total} บท`}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  )
}
