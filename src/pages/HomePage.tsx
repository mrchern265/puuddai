import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getUnits, getAllLessons, getMyProgress, getProfile } from '../lib/data'
import type { Unit, Lesson, UserLessonProgress, Profile } from '../types'
import { BottomNav, LoadingScreen, PhoneFrame } from '../components/ui'

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

  // Flatten lessons in unit/lesson order to compute unlock chain.
  const ordered = useMemo(
    () =>
      units.flatMap((u) =>
        lessons
          .filter((l) => l.unit_id === u.id)
          .sort((a, b) => a.order_index - b.order_index),
      ),
    [units, lessons],
  )

  function isUnlocked(lessonId: string): boolean {
    const i = ordered.findIndex((l) => l.id === lessonId)
    if (i <= 0) return true
    return doneIds.has(ordered[i - 1].id)
  }

  if (loading) return <LoadingScreen />

  const name = profile?.display_name ?? user?.email?.split('@')[0] ?? 'เพื่อน'

  return (
    <PhoneFrame>
      <header className="hero-gradient m-4 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/80">สวัสดี, {name} 👋</div>
            <div className="text-lg font-bold">มาเรียนกันต่อ!</div>
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
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
            🔥 {profile?.streak_count ?? 0} วัน
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
            ⭐ {doneIds.size * 50} XP
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <h2 className="mb-4 font-bold">เส้นทางการเรียน</h2>
        {units.map((u) => (
          <div key={u.id} className="mb-6">
            <div className="text-xs font-bold uppercase text-accent">Unit {u.order_index}</div>
            <div className="font-bold">{u.title_th}</div>
            <div className="mb-3 text-xs text-gray-400">{u.milestone_badge}</div>
            <div className="flex flex-col gap-3">
              {lessons
                .filter((l) => l.unit_id === u.id)
                .sort((a, b) => a.order_index - b.order_index)
                .map((l) => {
                  const unlocked = isUnlocked(l.id)
                  const done = doneIds.has(l.id)
                  return (
                    <button
                      key={l.id}
                      disabled={!unlocked}
                      onClick={() => nav(`/lesson/${l.id}`)}
                      className={`flex items-center gap-3 rounded-2xl p-3 text-left ${
                        unlocked ? 'bg-white shadow-sm' : 'cursor-not-allowed bg-gray-100 opacity-70'
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${
                          done ? 'bg-green-500' : unlocked ? 'bg-brand' : 'bg-gray-300'
                        }`}
                      >
                        {done ? '✓' : unlocked ? l.order_index : '🔒'}
                      </div>
                      <span className="text-sm font-medium">{l.title_th}</span>
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </PhoneFrame>
  )
}
