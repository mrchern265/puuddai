import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getVocabThemes, getVocabWordsByTheme } from '../lib/data'
import type { VocabTheme, VocabWord } from '../types'
import { BottomNav, LoadingScreen, PhoneFrame } from '../components/ui'
import { unitGlyph } from '../lib/units'

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

export default function VocabClusterPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [theme, setTheme] = useState<VocabTheme | null>(null)
  const [words, setWords] = useState<VocabWord[]>([])
  const [loading, setLoading] = useState(true)
  const [hideTh, setHideTh] = useState(false)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  useEffect(() => {
    let active = true
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const [themes, ws] = await Promise.all([getVocabThemes(), getVocabWordsByTheme(id)])
        if (!active) return
        setTheme(themes.find((t) => t.id === id) ?? null)
        setWords(ws)
      } catch (e) {
        console.error('cluster load error', e)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [id])

  function tap(w: VocabWord) {
    speak(w.word)
    if (hideTh) setRevealed((prev) => new Set(prev).add(w.id))
  }

  function toggleHide() {
    setHideTh((h) => !h)
    setRevealed(new Set())
  }

  if (loading) return <LoadingScreen text="กำลังโหลดศัพท์…" />

  return (
    <PhoneFrame>
      <header className="hero-gradient rounded-b-3xl px-5 pb-5 pt-7 text-white">
        <button
          type="button"
          onClick={() => nav('/clusters')}
          aria-label="กลับไปเลือกหมวด"
          className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30"
        >
          ← หมวดทั้งหมด
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="text-5xl leading-none">{unitGlyph(theme?.hero_emoji)}</div>
          <h1 className="mt-2 text-xl font-bold">{theme?.title_th ?? 'หมวดศัพท์'}</h1>
          <span className="mt-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            {words.length} คำในหมวดนี้
          </span>
        </div>

        <button
          type="button"
          onClick={toggleHide}
          className={`mt-4 w-full rounded-full py-2.5 text-sm font-bold transition ${
            hideTh ? 'bg-gold text-[#3a2a06]' : 'bg-white/18 text-white'
          }`}
        >
          {hideTh ? '🙈 โหมดทดสอบ: แตะเพื่อเฉลย' : '👁️ กำลังโชว์คำแปล — แตะเพื่อซ่อน'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl">📭</div>
            <p className="mt-3 font-medium text-slate-700">หมวดนี้ยังไม่มีคำศัพท์</p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-center text-xs text-slate-500">แตะการ์ดเพื่อฟังเสียง 🔊</p>
            <div className="grid grid-cols-3 gap-2.5">
              {words.map((w) => {
                const show = !hideTh || revealed.has(w.id)
                return (
                  <button
                    key={w.id}
                    onClick={() => tap(w)}
                    className="flex flex-col items-center gap-0.5 rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                  >
                    <span className="text-3xl leading-none">{w.image_emoji || '📘'}</span>
                    <span className="mt-1 text-[13px] font-bold leading-tight text-slate-800">
                      {w.word}
                    </span>
                    <span
                      className={`min-h-[14px] text-[11px] text-slate-500 transition-opacity ${
                        show ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {w.thai}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </PhoneFrame>
  )
}
