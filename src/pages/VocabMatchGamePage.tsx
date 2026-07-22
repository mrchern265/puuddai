import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getVocabThemes, getVocabWordsByTheme } from '../lib/data'
import type { VocabTheme, VocabWord } from '../types'
import { Confetti, LoadingScreen, PhoneFrame } from '../components/ui'

const ROUND_SIZE = 6

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

export default function VocabMatchGamePage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [theme, setTheme] = useState<VocabTheme | null>(null)
  const [pool, setPool] = useState<VocabWord[]>([])
  const [loading, setLoading] = useState(true)

  const [round, setRound] = useState<VocabWord[]>([])
  const [rightOrder, setRightOrder] = useState<VocabWord[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)
  const [moves, setMoves] = useState(0)
  const [startedAt, setStartedAt] = useState(0)
  const [now, setNow] = useState(0)

  const newRound = useCallback((words: VocabWord[]) => {
    const pick = shuffle(words).slice(0, Math.min(ROUND_SIZE, words.length))
    setRound(pick)
    setRightOrder(shuffle(pick))
    setPicked(null)
    setMatched(new Set())
    setWrong(null)
    setMoves(0)
    setStartedAt(Date.now())
    setNow(Date.now())
  }, [])

  useEffect(() => {
    let alive = true
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const [themes, ws] = await Promise.all([getVocabThemes(), getVocabWordsByTheme(id)])
        if (!alive) return
        setTheme(themes.find((t) => t.id === id) ?? null)
        setPool(ws)
        newRound(ws)
      } catch (e) {
        console.error('game load error', e)
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [id, newRound])

  const done = round.length > 0 && matched.size === round.length

  // tick the timer while playing
  useEffect(() => {
    if (loading || done) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [loading, done])

  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000))

  function tapLeft(w: VocabWord) {
    if (matched.has(w.id)) return
    setWrong(null)
    setPicked(w.id)
    speak(w.word)
  }

  function tapRight(w: VocabWord) {
    if (matched.has(w.id) || !picked) return
    setMoves((m) => m + 1)
    if (w.id === picked) {
      setMatched((prev) => new Set(prev).add(w.id))
      setPicked(null)
    } else {
      setWrong(w.id)
      setTimeout(() => setWrong(null), 450)
    }
  }

  const stars = useMemo(() => {
    if (!done) return 0
    const perfect = round.length
    if (moves <= perfect) return 3
    if (moves <= perfect + 2) return 2
    return 1
  }, [done, moves, round.length])

  if (loading) return <LoadingScreen text="กำลังเตรียมเกม…" />

  return (
    <PhoneFrame>
      {done && <Confetti />}
      <header className="hero-gradient rounded-b-3xl px-5 pb-5 pt-7 text-white">
        <button
          type="button"
          onClick={() => nav(`/clusters/${id}`)}
          className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30"
        >
          ← กลับ
        </button>
        <h1 className="text-xl font-bold">🎮 จับคู่คำศัพท์</h1>
        <p className="mt-1 text-sm text-white/80">{theme?.title_th}</p>
        <div className="mt-3 flex gap-2 text-sm font-bold">
          <span className="rounded-full bg-white/18 px-3 py-1">⏱️ {seconds}s</span>
          <span className="rounded-full bg-white/18 px-3 py-1">🎯 {matched.size}/{round.length}</span>
          <span className="rounded-full bg-white/18 px-3 py-1">👆 {moves} ครั้ง</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-3 text-center text-xs text-slate-500">แตะคำอังกฤษ แล้วแตะคำแปลที่คู่กัน</p>
        <div className="flex gap-3">
          {/* English column */}
          <div className="flex flex-1 flex-col gap-2.5">
            {round.map((w) => {
              const isMatched = matched.has(w.id)
              const isPicked = picked === w.id
              return (
                <button
                  key={w.id}
                  onClick={() => tapLeft(w)}
                  disabled={isMatched}
                  className={`flex items-center gap-2 rounded-2xl border p-3 text-left text-sm font-bold transition active:scale-95 ${
                    isMatched
                      ? 'border-success/30 bg-success-light text-success'
                      : isPicked
                        ? 'border-brand bg-brand text-white shadow-md'
                        : 'border-slate-100 bg-white text-slate-800 shadow-sm'
                  }`}
                >
                  <span className="text-xl leading-none">{w.image_emoji || '📘'}</span>
                  <span className="min-w-0 flex-1 truncate">{isMatched ? '✓ ' : ''}{w.word}</span>
                </button>
              )
            })}
          </div>
          {/* Thai column */}
          <div className="flex flex-1 flex-col gap-2.5">
            {rightOrder.map((w) => {
              const isMatched = matched.has(w.id)
              const isWrong = wrong === w.id
              return (
                <button
                  key={w.id}
                  onClick={() => tapRight(w)}
                  disabled={isMatched}
                  className={`rounded-2xl border p-3 text-center text-sm font-medium transition active:scale-95 ${
                    isMatched
                      ? 'border-success/30 bg-success-light text-success'
                      : isWrong
                        ? 'animate-shake border-danger bg-danger-light text-danger'
                        : 'border-slate-100 bg-white text-slate-700 shadow-sm'
                  }`}
                >
                  {w.thai}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm animate-pop-in rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="text-5xl">{stars >= 3 ? '🏆' : '🎉'}</div>
            <h2 className="mt-2 text-xl font-bold text-brand">จับคู่ครบแล้ว!</h2>
            <div className="mt-2 text-3xl">{'⭐'.repeat(stars)}{'▫️'.repeat(3 - stars)}</div>
            <div className="mt-3 flex justify-center gap-4 text-sm text-slate-600">
              <span>⏱️ {seconds} วินาที</span>
              <span>👆 {moves} ครั้ง</span>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => newRound(pool)}
                className="w-full rounded-full bg-accent py-3 font-bold text-white active:scale-95"
              >
                เล่นอีกรอบ 🔄
              </button>
              <button
                type="button"
                onClick={() => nav(`/clusters/${id}`)}
                className="w-full rounded-full bg-brand-light py-3 font-bold text-brand active:scale-95"
              >
                กลับไปหมวดศัพท์
              </button>
            </div>
          </div>
        </div>
      )}
    </PhoneFrame>
  )
}
