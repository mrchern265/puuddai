import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getVocabThemes, getVocabWordsByTheme } from '../lib/data'
import type { VocabTheme, VocabWord } from '../types'
import { Confetti, LoadingScreen, PhoneFrame } from '../components/ui'

const TOTAL_LEVELS = 10

// Pairs grow with the level (capped by the pool): L1-2:4, L3-4:5, … L9-10:8.
function pairsForLevel(level: number, poolSize: number): number {
  return Math.min(4 + Math.floor((level - 1) / 2), 8, poolSize)
}

function starsForMoves(moves: number, pairs: number): number {
  if (moves <= pairs) return 3
  if (moves <= pairs + 2) return 2
  return 1
}

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

  const [level, setLevel] = useState(1)
  const [round, setRound] = useState<VocabWord[]>([])
  const [rightOrder, setRightOrder] = useState<VocabWord[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)
  const [moves, setMoves] = useState(0)
  const [levelStars, setLevelStars] = useState<number[]>([]) // one entry per cleared level
  const [levelCleared, setLevelCleared] = useState(false)

  const startRound = useCallback((lvl: number, words: VocabWord[]) => {
    const n = pairsForLevel(lvl, words.length)
    const pick = shuffle(words).slice(0, n)
    setRound(pick)
    setRightOrder(shuffle(pick))
    setPicked(null)
    setMatched(new Set())
    setWrong(null)
    setMoves(0)
    setLevelCleared(false)
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
        startRound(1, ws)
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
  }, [id, startRound])

  const allLevelsDone = levelCleared && level >= TOTAL_LEVELS
  const totalStars = levelStars.reduce((a, b) => a + b, 0)
  const currentStars = levelStars[level - 1] ?? 0

  function tapLeft(w: VocabWord) {
    if (matched.has(w.id) || levelCleared) return
    setWrong(null)
    setPicked(w.id)
    speak(w.word)
  }

  function tapRight(w: VocabWord) {
    if (matched.has(w.id) || !picked || levelCleared) return
    const attempt = moves + 1
    setMoves(attempt)
    if (w.id === picked) {
      const next = new Set(matched).add(w.id)
      setMatched(next)
      setPicked(null)
      if (next.size === round.length) {
        setLevelStars((prev) => [...prev, starsForMoves(attempt, round.length)])
        setLevelCleared(true)
      }
    } else {
      setWrong(w.id)
      setTimeout(() => setWrong(null), 450)
    }
  }

  function nextLevel() {
    const lvl = level + 1
    setLevel(lvl)
    startRound(lvl, pool)
  }

  function restart() {
    setLevel(1)
    setLevelStars([])
    startRound(1, pool)
  }

  if (loading) return <LoadingScreen text="กำลังเตรียมเกม…" />

  return (
    <PhoneFrame>
      {levelCleared && <Confetti />}
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
        <div className="mt-3 flex items-center gap-2 text-sm font-bold">
          <span className="rounded-full bg-gold px-3 py-1 text-[#3a2a06]">เลเวล {level}/{TOTAL_LEVELS}</span>
          <span className="rounded-full bg-white/18 px-3 py-1">🎯 {matched.size}/{round.length}</span>
          <span className="rounded-full bg-white/18 px-3 py-1">⭐ {totalStars}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-3 text-center text-xs text-slate-500">แตะคำอังกฤษ แล้วแตะคำแปลที่คู่กัน</p>
        <div className="flex gap-3">
          {/* English column — no image in the game, on purpose */}
          <div className="flex flex-1 flex-col gap-2.5">
            {round.map((w) => {
              const isMatched = matched.has(w.id)
              const isPicked = picked === w.id
              return (
                <button
                  key={w.id}
                  onClick={() => tapLeft(w)}
                  disabled={isMatched}
                  className={`rounded-2xl border p-3 text-center text-sm font-bold transition active:scale-95 ${
                    isMatched
                      ? 'border-success/30 bg-success-light text-success'
                      : isPicked
                        ? 'border-brand bg-brand text-white shadow-md'
                        : 'border-slate-100 bg-white text-slate-800 shadow-sm'
                  }`}
                >
                  {isMatched ? '✓ ' : ''}{w.word}
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

      {levelCleared && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm animate-pop-in rounded-3xl bg-white p-6 text-center shadow-2xl">
            {allLevelsDone ? (
              <>
                <div className="text-5xl">🏆</div>
                <h2 className="mt-2 text-xl font-bold text-brand">จบครบ 10 เลเวล!</h2>
                <p className="mt-1 text-sm text-slate-600">เก่งมากกก 🎉</p>
                <div className="mt-3 text-3xl">⭐ {totalStars}/30</div>
                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={restart}
                    className="w-full rounded-full bg-accent py-3 font-bold text-white active:scale-95"
                  >
                    เล่นใหม่ตั้งแต่เลเวล 1 🔄
                  </button>
                  <button
                    type="button"
                    onClick={() => nav(`/clusters/${id}`)}
                    className="w-full rounded-full bg-brand-light py-3 font-bold text-brand active:scale-95"
                  >
                    กลับไปหมวดศัพท์
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl">{currentStars >= 3 ? '🌟' : '🎉'}</div>
                <h2 className="mt-2 text-xl font-bold text-brand">ผ่านเลเวล {level}!</h2>
                <div className="mt-2 text-3xl">
                  {'⭐'.repeat(currentStars)}{'▫️'.repeat(3 - currentStars)}
                </div>
                <p className="mt-2 text-sm text-slate-500">ต่อไปเลเวล {level + 1} — คู่เยอะขึ้นนะ 💪</p>
                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={nextLevel}
                    className="w-full rounded-full bg-accent py-3 font-bold text-white active:scale-95"
                  >
                    เลเวลถัดไป →
                  </button>
                  <button
                    type="button"
                    onClick={() => nav(`/clusters/${id}`)}
                    className="w-full rounded-full bg-brand-light py-3 font-bold text-brand active:scale-95"
                  >
                    พักก่อน
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PhoneFrame>
  )
}
