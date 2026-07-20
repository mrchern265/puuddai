import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getUnits, getAllLessons, getMyProgress, getScenarioByUnit } from '../lib/data'
import type { Unit, Lesson, UserLessonProgress, Scenario } from '../types'
import { BottomNav, LoadingScreen, PhoneFrame } from '../components/ui'
import { unitGlyph } from '../lib/units'

export default function UnitPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()

  const [unit, setUnit] = useState<Unit | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progress, setProgress] = useState<UserLessonProgress[]>([])
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!id || !user) return
      setLoading(true)
      try {
        const [units, allLessons, prog, sc] = await Promise.all([
          getUnits(),
          getAllLessons(),
          getMyProgress(user.id),
          getScenarioByUnit(id),
        ])
        if (!active) return
        setUnit(units.find((u) => u.id === id) ?? null)
        setLessons(allLessons.filter((l) => l.unit_id === id).sort((a, b) => a.order_index - b.order_index))
        setProgress(prog)
        setScenario(sc)
      } catch (e) {
        console.error('unit load error', e)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [id, user])

  const doneIds = useMemo(
    () => new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lesson_id)),
    [progress],
  )

  if (loading) return <LoadingScreen />

  const total = lessons.length
  const doneInUnit = lessons.filter((l) => doneIds.has(l.id)).length
  const pct = total > 0 ? Math.round((doneInUnit / total) * 100) : 0

  return (
    <PhoneFrame>
      <header className="hero-gradient rounded-b-3xl px-5 pb-6 pt-7 text-white">
        <button
          type="button"
          onClick={() => nav('/home')}
          aria-label="กลับไปเลือกหมวด"
          className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30"
        >
          ← หมวดทั้งหมด
        </button>

        {unit ? (
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-2xl bg-white/15 text-4xl leading-none">
              {unitGlyph(unit.milestone_badge)}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wide text-white/70">
                Unit {unit.order_index} · {unit.cefr_level}
              </div>
              <h1 className="truncate text-xl font-bold leading-tight">{unit.title_th}</h1>
              <p className="mt-0.5 line-clamp-2 text-xs text-white/80">{unit.description_th}</p>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-bold">ไม่พบหมวดนี้</h1>
        )}

        {total > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-white/80">
              <span>ความคืบหน้า</span>
              <span className="font-bold">
                {doneInUnit}/{total} บท
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gold transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {!unit ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl">🧭</div>
            <p className="mt-3 text-sm text-slate-500">หมวดนี้อาจถูกลบไปแล้ว</p>
          </div>
        ) : (
          <>
            {scenario && (
              <button
                onClick={() => nav(`/practice/${unit.id}`)}
                className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-accent/10 p-4 text-left ring-1 ring-accent/20 transition active:scale-[0.98]"
              >
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-accent text-xl text-white">
                  💬
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-accent-dark">ฝึกสนทนากับ AI</div>
                  <div className="truncate text-xs text-slate-500">{scenario.title_th}</div>
                </div>
                <span className="text-accent">→</span>
              </button>
            )}

            <h2 className="mb-2 text-sm font-bold text-slate-700">บทเรียน</h2>
            <div className="flex flex-col gap-2.5">
              {lessons.map((l) => {
                const done = doneIds.has(l.id)
                return (
                  <button
                    key={l.id}
                    onClick={() => nav(`/lesson/${l.id}`)}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md active:scale-[0.98]"
                  >
                    <div
                      className={`grid h-11 w-11 flex-none place-items-center rounded-full text-base font-bold text-white ${
                        done ? 'bg-success' : 'bg-brand'
                      }`}
                    >
                      {done ? '✓' : l.order_index}
                    </div>
                    <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                      {l.title_th}
                    </span>
                    <span className="text-slate-300">›</span>
                  </button>
                )
              })}
              {total === 0 && (
                <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 ring-1 ring-black/5">
                  หมวดนี้ยังไม่มีบทเรียน กลับมาใหม่ทีหลังนะ 🙌
                </p>
              )}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </PhoneFrame>
  )
}
