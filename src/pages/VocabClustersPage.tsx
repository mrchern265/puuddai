import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getVocabThemes } from '../lib/data'
import type { VocabTheme } from '../types'
import { BottomNav, LoadingScreen, PhoneFrame } from '../components/ui'
import { unitGlyph } from '../lib/units'

const TINTS = [
  { soft: 'bg-brand-light', ring: 'text-brand' },
  { soft: 'bg-accent/15', ring: 'text-accent' },
  { soft: 'bg-success-light', ring: 'text-success' },
  { soft: 'bg-grape/15', ring: 'text-grape' },
]

export default function VocabClustersPage() {
  const nav = useNavigate()
  const [themes, setThemes] = useState<VocabTheme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getVocabThemes()
      .then(setThemes)
      .catch((e) => console.error('themes load error', e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen text="กำลังโหลดหมวดศัพท์…" />

  return (
    <PhoneFrame>
      <header className="hero-gradient rounded-b-3xl px-5 pb-6 pt-7 text-white">
        <div className="text-sm text-white/80">🍔 ศัพท์เป็นชุด</div>
        <h1 className="mt-1 text-xl font-bold">จำศัพท์แบบแฮมเบอร์เกอร์</h1>
        <p className="mt-1 text-sm text-white/80">
          เลือกฉากที่อยากเรียน แล้วเก็บศัพท์ทั้งชุดพร้อมกัน ไม่ต้องท่องทีละคำ
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {themes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl">🍔</div>
            <p className="mt-3 font-medium text-slate-700">ยังไม่มีหมวดศัพท์</p>
            <p className="mt-1 text-sm text-slate-500">
              รัน migration 0006 และเทเนื้อหาใน Supabase แล้วหมวดจะโผล่ที่นี่
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t, i) => {
              const tint = TINTS[i % TINTS.length]
              return (
                <button
                  key={t.id}
                  onClick={() => nav(`/clusters/${t.id}`)}
                  title={t.title_th}
                  className="group flex flex-col items-center rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
                >
                  <div
                    className={`grid h-16 w-16 place-items-center overflow-hidden rounded-2xl text-4xl leading-none transition group-hover:scale-105 ${tint.soft}`}
                  >
                    {unitGlyph(t.hero_emoji)}
                  </div>
                  <div className={`mt-2 text-[10px] font-bold uppercase tracking-wide ${tint.ring}`}>
                    {t.cefr_level}
                  </div>
                  <div className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-slate-800">
                    {t.title_th}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </PhoneFrame>
  )
}
