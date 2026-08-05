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
  const [active, setActive] = useState<VocabWord | null>(null)

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
        console.error('cluster load error', e)
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [id])

  function openWord(w: VocabWord) {
    setActive(w)
    speak(w.word)
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
          onClick={() => setHideTh((h) => !h)}
          className={`mt-4 w-full rounded-full py-2.5 text-sm font-bold transition ${
            hideTh ? 'bg-gold text-[#3a2a06]' : 'bg-white/18 text-white'
          }`}
        >
          {hideTh ? '🙈 ซ่อนคำแปลอยู่' : '👁️ โชว์คำแปล'}
        </button>
        {words.length >= 4 && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => nav(`/clusters/${id}/game`)}
              className="flex-1 rounded-full bg-accent py-2.5 text-sm font-bold text-white transition active:scale-95"
            >
              🎮 เกมจับคู่
            </button>
            <button
              type="button"
              onClick={() => nav(`/clusters/${id}/speak`)}
              className="flex-1 rounded-full bg-success py-2.5 text-sm font-bold text-white transition active:scale-95"
            >
              🎤 ฝึกพูด
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl">📭</div>
            <p className="mt-3 font-medium text-slate-700">หมวดนี้ยังไม่มีคำศัพท์</p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-center text-xs text-slate-500">แตะการ์ดเพื่อฟังเสียง + ดูตัวช่วยจำ 💡</p>
            <div className="grid grid-cols-3 gap-2.5">
              {words.map((w) => (
                <button
                  key={w.id}
                  onClick={() => openWord(w)}
                  className="flex flex-col items-center gap-0.5 rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                >
                  <span className="text-3xl leading-none">{w.image_emoji || '📘'}</span>
                  <span className="mt-1 text-[13px] font-bold leading-tight text-slate-800">
                    {w.word}
                  </span>
                  <span
                    className={`min-h-[14px] text-[11px] text-slate-500 transition-opacity ${
                      hideTh ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    {w.thai}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-md animate-slide-up rounded-3xl bg-white p-6 pb-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-light text-5xl leading-none">
              {active.image_emoji || '📘'}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-800">{active.word}</h2>
              <button
                type="button"
                onClick={() => speak(active.word)}
                aria-label="ฟังเสียง"
                className="grid h-9 w-9 place-items-center rounded-full bg-brand-light text-lg text-brand active:scale-90"
              >
                🔊
              </button>
            </div>
            {active.ipa && <div className="mt-0.5 text-sm text-slate-400">{active.ipa}</div>}
            <div className="mt-2 text-lg font-bold text-success">{active.thai}</div>

            {active.hint_th && (
              <div className="mt-4 rounded-2xl bg-accent/10 px-4 py-3 text-left text-sm leading-relaxed text-accent-dark ring-1 ring-accent/20">
                <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wide opacity-70">
                  💡 เทคนิคช่วยจำ
                </span>
                {active.hint_th}
              </div>
            )}
            {active.example_en && (
              <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm">
                <div className="font-medium text-slate-700">{active.example_en}</div>
                {active.example_th && (
                  <div className="mt-0.5 text-xs text-slate-500">{active.example_th}</div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setActive(null)}
              className="mt-5 w-full rounded-full bg-brand py-3 font-bold text-white active:scale-95"
            >
              เข้าใจแล้ว 👍
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </PhoneFrame>
  )
}
