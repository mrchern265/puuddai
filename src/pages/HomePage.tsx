import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getUnits, getAllLessons, getMyProgress, getProfile } from '../lib/data'
import type { Unit, Lesson, UserLessonProgress, Profile } from '../types'
import { BottomNav, LoadingScreen, PhoneFrame, XpBar } from '../components/ui'

const XP_PER_LESSON = 50
const XP_PER_LEVEL = 150

// A lively accent per unit card, cycled by index.
const UNIT_TINTS = [
  { bar: 'bg-brand', ring: 'text-brand', chip: 'bg-brand-light text-brand' },
  { bar: 'bg-accent', ring: 'text-accent', chip: 'bg-accent/15 text-accent' },
  { bar: 'bg-success', ring: 'text-success', chip: 'bg-success-light text-success' },
  { bar: 'bg-grape', ring: 'text-grape', chip: 'bg-grape/15 text-grape' },
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
  const streak = profile?.streak_count ?? 0
  const cefr = profile?.cefr_level ?? 'A0'

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
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <h2 className="mb-1 font-bold text-slate-800">เลือกบทที่อยากเล่น</h2>
        <p className="mb-4 text-xs text-slate-500">เล่นบทไหนก่อนก็ได้ ไม่ต้องเรียงลำดับ</p>

        {units.map((u, ui) => {
          const unitLessons = lessons
            .filter((l) => l.unit_id === u.id)
            .sort((a, b) => a.order_index - b.order_index)
          const doneInUnit = unitLessons.filter((l) => doneIds.has(l.id)).length
          const allDone = unitLessons.length > 0 && doneInUnit === unitLessons.length
          const tint = UNIT_TINTS[ui % UNIT_TINTS.length]
          const pct =
            unitLessons.length > 0 ? Math.round((doneInUnit / unitLessons.length) * 100) : 0
          return (
            <div key={u.id} className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{u.milestone_badge}</div>
                <div className="min-w-0 flex-1">
                  <div className={`text-[11px] font-bold uppercase ${tint.ring}`}>
                    Unit {u.order_index} · {u.cefr_level}
                  </div>
                  <div className="truncate font-bold text-slate-800">{u.title_th}</div>
                </div>
                {allDone ? (
                  <span className="shrink-0 rounded-full bg-success-light px-2 py-1 text-xs font-bold text-success">
                    จบแล้ว ✓
                  </span>
                ) : (
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${tint.chip}`}>
                    {doneInUnit}/{unitLessons.length}
                  </span>
                )}
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${tint.bar} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {unitLessons.map((l) => {
                  const done = doneIds.has(l.id)
                  return (
                    <button
                      key={l.id}
                      onClick={() => nav(`/lesson/${l.id}`)}
                      title={l.title_th}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white transition active:scale-90 ${
                        done ? 'bg-success' : tint.bar
                      }`}
                    >
                      {done ? '✓' : l.order_index}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <BottomNav />
    </PhoneFrame>
  )
}
