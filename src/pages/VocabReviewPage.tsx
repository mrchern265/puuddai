import { useEffect, useMemo, useState } from 'react'
import { getAllClusterWords } from '../lib/data'
import type { VocabWord } from '../types'
import { buildQueue, reviewCard, getStates } from '../lib/srs'
import { getDaily, recordActivity, type DailySnapshot } from '../lib/daily'
import { BottomNav, Confetti, LoadingScreen, PhoneFrame } from '../components/ui'

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Four Thai choices: the correct meaning + 3 distractors from other words.
function makeOptions(word: VocabWord, pool: VocabWord[]): string[] {
  const seen = new Set([word.thai])
  const distractors: string[] = []
  for (const w of shuffle(pool)) {
    if (distractors.length >= 3) break
    if (!seen.has(w.thai)) {
      seen.add(w.thai)
      distractors.push(w.thai)
    }
  }
  return shuffle([word.thai, ...distractors])
}

export default function VocabReviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pool, setPool] = useState<VocabWord[]>([])
  const [queue, setQueue] = useState<VocabWord[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [chosen, setChosen] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [isNew, setIsNew] = useState(false)
  const [daily, setDaily] = useState<DailySnapshot>(() => getDaily())
  const [goalToast, setGoalToast] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const words = await getAllClusterWords()
        if (!alive) return
        const q = buildQueue(words)
        const states = getStates()
        setPool(words)
        setQueue(q)
        setTotal(q.length)
        if (q[0]) {
          setOptions(makeOptions(q[0], words))
          setIsNew(!states[q[0].id]?.seen)
        }
      } catch {
        if (alive) setError('โหลดคำศัพท์ไม่สำเร็จ ลองใหม่อีกครั้ง')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  const current = queue[0]
  const answered = chosen !== null
  const isCorrect = answered && chosen === current?.thai
  const doneCount = Math.max(0, total - queue.length)
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const finished = !loading && !error && total > 0 && queue.length === 0
  const emptyToday = useMemo(() => !loading && !error && total === 0, [loading, error, total])

  function choose(opt: string) {
    if (answered || !current) return
    setChosen(opt)
    const ok = opt === current.thai
    reviewCard(current.id, ok)
    if (ok) {
      // Daily goal / streak only counts words you actually got right.
      const snap = recordActivity(1)
      setDaily(snap)
      if (snap.justHit) {
        setGoalToast(true)
        setTimeout(() => setGoalToast(false), 3500)
      }
    }
  }

  function next() {
    setQueue((q) => {
      const rest = q.slice(1)
      // Right → done. Wrong → back of the queue to try again this session.
      const nextQ = isCorrect ? rest : [...rest, q[0]]
      const states = getStates()
      if (nextQ[0]) {
        setOptions(makeOptions(nextQ[0], pool))
        setIsNew(!states[nextQ[0].id]?.seen)
      }
      return nextQ
    })
    setChosen(null)
  }

  if (loading) return <LoadingScreen text="กำลังเตรียมคำทบทวน…" />

  return (
    <PhoneFrame>
      {(finished || goalToast) && <Confetti />}
      {goalToast && (
        <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div className="animate-pop-in rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-[#3a2a06] shadow-lg">
            🔥 ทำเป้าหมายวันนี้สำเร็จ! สตรีค {daily.streak} วัน
          </div>
        </div>
      )}

      <header className="hero-gradient rounded-b-3xl px-5 pb-6 pt-8 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">ทบทวนคำศัพท์ 🧠</h1>
            <p className="mt-1 text-sm text-white/80">เลือกความหมายให้ถูก — ตอบถูกถึงจะนับ</p>
          </div>
          <span className="flex-none rounded-full bg-white/18 px-3 py-1 text-sm font-bold">
            🔥 {daily.streak}
          </span>
        </div>
        <div className="mt-3 rounded-2xl bg-white/12 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold">🎯 เป้าหมายวันนี้</span>
            <span className="text-white/85">
              {Math.min(daily.count, daily.goal)}/{daily.goal} คำ {daily.goalMet ? '✓' : ''}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gold transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((daily.count / daily.goal) * 100))}%` }}
            />
          </div>
        </div>
        {total > 0 && !finished && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span>รอบนี้ {doneCount}/{total}</span>
              <span className="text-white/80">{isNew ? '✨ คำใหม่' : '🔁 ทบทวน'}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/70 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col px-5 py-6">
        {error ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-4xl">😕</p>
            <p className="mt-3 text-slate-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-brand px-6 py-3 font-bold text-white"
            >
              ลองใหม่
            </button>
          </div>
        ) : emptyToday || finished ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="text-6xl">🎉</div>
            <h2 className="mt-3 text-xl font-bold text-brand">
              {finished ? `ทบทวนครบ ${total} คำแล้ว!` : 'ทบทวนครบแล้ววันนี้'}
            </h2>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              เก่งมาก! คำที่ทบทวนวันนี้จะกลับมาให้ทวนอีกครั้งตามเวลาที่เหมาะสม — แวะมาใหม่พรุ่งนี้นะ
            </p>
          </div>
        ) : current ? (
          <>
            <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
              <div className="text-4xl leading-none">{current.image_emoji || '📘'}</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-2xl font-extrabold text-slate-800">{current.word}</span>
                <button
                  type="button"
                  onClick={() => speak(current.word)}
                  aria-label="ฟังเสียง"
                  className="grid h-8 w-8 place-items-center rounded-full bg-brand-light text-base text-brand active:scale-90"
                >
                  🔊
                </button>
              </div>
              {current.ipa && <div className="text-xs text-slate-400">{current.ipa}</div>}
              <div className="mt-2 text-sm font-medium text-slate-500">แปลว่าอะไร?</div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {options.map((opt) => {
                const isChoice = chosen === opt
                const isRight = opt === current.thai
                let cls = 'border-slate-100 bg-white text-slate-800 shadow-sm'
                if (answered) {
                  if (isRight) cls = 'border-success/40 bg-success-light text-success'
                  else if (isChoice) cls = 'border-danger/40 bg-danger-light text-danger'
                  else cls = 'border-slate-100 bg-white text-slate-400'
                }
                return (
                  <button
                    key={opt}
                    onClick={() => choose(opt)}
                    disabled={answered}
                    className={`flex items-center justify-between rounded-2xl border p-3.5 text-left text-base font-bold transition active:scale-[0.98] ${cls}`}
                  >
                    <span>{opt}</span>
                    {answered && isRight && <span>✓</span>}
                    {answered && isChoice && !isRight && <span>✗</span>}
                  </button>
                )
              })}
            </div>

            {answered && (
              <div className="mt-4">
                {(current.hint_th || current.example_en) && (
                  <div className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent-dark ring-1 ring-accent/20">
                    {current.hint_th && <div>💡 {current.hint_th}</div>}
                    {current.example_en && (
                      <div className="mt-1 text-slate-600">
                        <span className="font-medium">{current.example_en}</span>
                        {current.example_th && <span className="text-slate-400"> — {current.example_th}</span>}
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={next}
                  className="mt-3 w-full rounded-full bg-brand py-3.5 font-bold text-white active:scale-95"
                >
                  {isCorrect ? 'ถัดไป →' : 'เข้าใจแล้ว ลองใหม่ทีหลัง →'}
                </button>
              </div>
            )}
          </>
        ) : null}
      </main>
      <BottomNav />
    </PhoneFrame>
  )
}
