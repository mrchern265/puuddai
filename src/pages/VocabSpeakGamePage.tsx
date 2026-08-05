import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getVocabThemes, getVocabWordsByTheme } from '../lib/data'
import type { VocabTheme, VocabWord } from '../types'
import { recordActivity } from '../lib/daily'
import { Confetti, LoadingScreen, PhoneFrame } from '../components/ui'

// Minimal typing for the Web Speech API (not in lib.dom for all targets).
interface SpeechResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}
interface Recognition {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: (e: SpeechResultEvent) => void
  onerror: () => void
  onend: () => void
  start: () => void
  stop: () => void
}
type RecognitionCtor = new () => Recognition

function getRecognitionCtor(): RecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.8
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim()
}

function matches(heard: string, target: string): boolean {
  const h = normalize(heard)
  const t = normalize(target)
  if (!h) return false
  return h === t || h.includes(t) || t.includes(h)
}

export default function VocabSpeakGamePage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [theme, setTheme] = useState<VocabTheme | null>(null)
  const [words, setWords] = useState<VocabWord[]>([])
  const [loading, setLoading] = useState(true)
  const [i, setI] = useState(0)
  const [listening, setListening] = useState(false)
  const [heard, setHeard] = useState<string | null>(null)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const recRef = useRef<Recognition | null>(null)

  const supported = getRecognitionCtor() !== null
  const current = words[i]
  const done = words.length > 0 && i >= words.length

  useEffect(() => {
    let alive = true
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const [themes, ws] = await Promise.all([getVocabThemes(), getVocabWordsByTheme(id)])
        if (!alive) return
        setTheme(themes.find((t) => t.id === id) ?? null)
        setWords(ws)
      } catch (e) {
        console.error('speak load error', e)
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
      recRef.current?.stop()
    }
  }, [id])

  const listen = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor || !current || listening) return
    setHeard(null)
    setResult(null)
    const rec = new Ctor()
    recRef.current = rec
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e: SpeechResultEvent) => {
      const said = e.results[0]?.[0]?.transcript ?? ''
      setHeard(said)
      const ok = matches(said, current.word)
      setResult(ok ? 'correct' : 'wrong')
      if (ok) recordActivity(1)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    setListening(true)
    rec.start()
  }, [current, listening])

  function nextWord() {
    setHeard(null)
    setResult(null)
    setI((n) => n + 1)
  }

  if (loading) return <LoadingScreen text="กำลังเตรียมโหมดฝึกพูด…" />

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
        <h1 className="text-xl font-bold">🎤 ฝึกพูด</h1>
        <p className="mt-1 text-sm text-white/80">{theme?.title_th}</p>
        {words.length > 0 && !done && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gold transition-all duration-300"
              style={{ width: `${Math.round((i / words.length) * 100)}%` }}
            />
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col px-5 py-6">
        {!supported ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="text-5xl">🎤</div>
            <p className="mt-3 font-bold text-slate-700">เบราว์เซอร์นี้ยังไม่รองรับการฟังเสียง</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              ลองเปิดด้วย Chrome บนมือถือหรือคอม แล้วอนุญาตให้ใช้ไมโครโฟนนะ
            </p>
          </div>
        ) : done ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="text-6xl">🎉</div>
            <h2 className="mt-3 text-xl font-bold text-brand">ฝึกพูดครบทุกคำแล้ว!</h2>
            <div className="mt-5 flex w-full max-w-xs flex-col gap-2">
              <button
                onClick={() => {
                  setI(0)
                  setHeard(null)
                  setResult(null)
                }}
                className="w-full rounded-full bg-accent py-3 font-bold text-white active:scale-95"
              >
                ฝึกอีกรอบ 🔄
              </button>
              <button
                onClick={() => nav(`/clusters/${id}`)}
                className="w-full rounded-full bg-brand-light py-3 font-bold text-brand active:scale-95"
              >
                กลับไปหมวดศัพท์
              </button>
            </div>
          </div>
        ) : current ? (
          <>
            <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
              <div className="text-4xl leading-none">{current.image_emoji || '📘'}</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-3xl font-extrabold text-slate-800">{current.word}</span>
                <button
                  type="button"
                  onClick={() => speak(current.word)}
                  aria-label="ฟังเสียงต้นแบบ"
                  className="grid h-9 w-9 place-items-center rounded-full bg-brand-light text-lg text-brand active:scale-90"
                >
                  🔊
                </button>
              </div>
              {current.ipa && <div className="text-sm text-slate-400">{current.ipa}</div>}
              <div className="mt-1 text-sm text-slate-500">{current.thai}</div>

              <div className="mt-5 min-h-[2.5rem]">
                {result === 'correct' && (
                  <div className="rounded-2xl bg-success-light px-4 py-2 font-bold text-success">
                    เยี่ยม! ออกเสียงถูกต้อง ✓
                  </div>
                )}
                {result === 'wrong' && (
                  <div className="rounded-2xl bg-danger-light px-4 py-2 text-sm text-danger">
                    ได้ยินว่า “{heard}” — ลองอีกครั้งนะ 💪
                  </div>
                )}
                {listening && <div className="text-sm text-brand">🎙️ กำลังฟัง… พูดเลย!</div>}
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <button
                onClick={listen}
                disabled={listening}
                className={`grid h-20 w-20 place-items-center rounded-full text-3xl text-white shadow-lg transition active:scale-90 ${
                  listening ? 'animate-pulse-glow bg-danger' : 'bg-brand'
                }`}
                aria-label="กดเพื่อพูด"
              >
                🎤
              </button>
              <p className="text-xs text-slate-400">แตะไมค์ แล้วพูดคำนี้เป็นภาษาอังกฤษ</p>

              {result && (
                <button
                  onClick={nextWord}
                  className="w-full rounded-full bg-brand py-3.5 font-bold text-white active:scale-95"
                >
                  {result === 'correct' ? 'คำถัดไป →' : 'ข้ามไปก่อน →'}
                </button>
              )}
            </div>
          </>
        ) : null}
      </main>
    </PhoneFrame>
  )
}
