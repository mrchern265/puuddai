import { useEffect, useMemo, useState } from 'react'
import { getAllClusterWords } from '../lib/data'
import type { VocabWord } from '../types'
import { buildQueue, reviewCard, getStates } from '../lib/srs'
import { BottomNav, Confetti, LoadingScreen, PhoneFrame } from '../components/ui'

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

export default function VocabReviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queue, setQueue] = useState<VocabWord[]>([])
  const [revealed, setRevealed] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [isNew, setIsNew] = useState(false)

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
        setIsNew(q.length > 0 ? !states[q[0].id]?.seen : false)
        setQueue(q)
        setTotal(q.length)
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
  const doneCount = reviewedCount
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const finished = !loading && !error && total > 0 && queue.length === 0
  const emptyToday = useMemo(() => !loading && !error && total === 0, [loading, error, total])

  function answer(remembered: boolean) {
    if (!current) return
    reviewCard(current.id, remembered)
    setReviewedCount((c) => c + 1)
    setRevealed(false)
    setQueue((q) => {
      // Correct → drop it. Wrong → send to the back to try again this session.
      const rest = q.slice(1)
      const next = remembered ? rest : [...rest, q[0]]
      const states = getStates()
      if (next[0]) setIsNew(!states[next[0].id]?.seen)
      return next
    })
  }

  if (loading) return <LoadingScreen text="กำลังเตรียมคำทบทวน…" />

  return (
    <PhoneFrame>
      {finished && <Confetti />}
      <header className="hero-gradient rounded-b-3xl px-5 pb-6 pt-8 text-white">
        <h1 className="text-2xl font-bold">ทบทวนคำศัพท์ 🧠</h1>
        <p className="mt-1 text-sm text-white/80">คำที่ยังไม่แม่นจะวนกลับมาถี่ คำที่จำได้จะห่างออกไป</p>
        {total > 0 && !finished && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">{doneCount}/{total} คำ</span>
              <span className="text-white/80">{isNew ? '✨ คำใหม่' : '🔁 ทบทวน'}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gold transition-all duration-300"
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
            <div
              role="button"
              tabIndex={0}
              onClick={() => setRevealed(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setRevealed(true)
              }}
              className="flex flex-1 flex-col items-center justify-center rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5"
            >
              <div className="text-5xl leading-none">{current.image_emoji || '📘'}</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-3xl font-extrabold text-slate-800">{current.word}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    speak(current.word)
                  }}
                  aria-label="ฟังเสียง"
                  className="grid h-9 w-9 place-items-center rounded-full bg-brand-light text-lg text-brand active:scale-90"
                >
                  🔊
                </button>
              </div>
              {current.ipa && <div className="mt-0.5 text-sm text-slate-400">{current.ipa}</div>}

              {revealed ? (
                <>
                  <div className="mt-4 text-2xl font-bold text-success">{current.thai}</div>
                  {current.hint_th && (
                    <div className="mt-3 rounded-2xl bg-accent/10 px-4 py-2 text-sm text-accent-dark ring-1 ring-accent/20">
                      💡 {current.hint_th}
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-6 text-sm text-slate-400">แตะเพื่อดูความหมาย 👆</div>
              )}
            </div>

            <div className="mt-5">
              {revealed ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => answer(false)}
                    className="flex-1 rounded-full bg-danger-light py-3.5 font-bold text-danger active:scale-95"
                  >
                    😅 ยังไม่ได้
                  </button>
                  <button
                    onClick={() => answer(true)}
                    className="flex-1 rounded-full bg-success py-3.5 font-bold text-white active:scale-95"
                  >
                    😎 จำได้
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full rounded-full bg-brand py-3.5 font-bold text-white active:scale-95"
                >
                  เฉลย
                </button>
              )}
            </div>
          </>
        ) : null}
      </main>
      <BottomNav />
    </PhoneFrame>
  )
}
