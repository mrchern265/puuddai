import { useEffect, useState } from 'react'
import { getAllVocab, type VocabWithSource } from '../lib/data'
import { Button, Card, BottomNav, PhoneFrame, LoadingScreen } from '../components/ui'

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
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

export default function VocabReviewPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [allVocab, setAllVocab] = useState<VocabWithSource[]>([])
  const [queue, setQueue] = useState<VocabWithSource[]>([])
  const [flipped, setFlipped] = useState<boolean>(false)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getAllVocab()
        if (!alive) return
        setAllVocab(data)
        setQueue(shuffle(data))
      } catch {
        if (!alive) return
        setError('โหลดคำศัพท์ไม่สำเร็จ ลองใหม่อีกครั้ง')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  function handleKnow() {
    setQueue((q) => q.slice(1))
    setFlipped(false)
  }

  function handleDontKnow() {
    setQueue((q) => (q.length <= 1 ? q : [...q.slice(1), q[0]]))
    setFlipped(false)
  }

  function handleRestart() {
    setQueue(shuffle(allVocab))
    setFlipped(false)
  }

  if (loading) return <LoadingScreen text="กำลังโหลดคำศัพท์..." />

  const total = allVocab.length
  const remaining = queue.length
  const current = queue[0]
  const progressPct = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0

  return (
    <PhoneFrame>
      <header className="hero-gradient px-5 pt-8 pb-6 text-white">
        <h1 className="text-2xl font-bold">ทบทวนคำศัพท์ 📇</h1>
        <p className="mt-1 text-sm text-white/80">แตะการ์ดเพื่อพลิกดูคำแปล แล้วประเมินตัวเอง</p>
      </header>

      <main className="flex flex-1 flex-col px-5 py-6">
        {error ? (
          <Card className="text-center">
            <p className="text-4xl">😕</p>
            <p className="mt-3 text-slate-600">{error}</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => window.location.reload()}>
                ลองใหม่
              </Button>
            </div>
          </Card>
        ) : total === 0 ? (
          <Card className="text-center">
            <p className="text-4xl">📭</p>
            <p className="mt-3 text-slate-600">ยังไม่มีคำศัพท์ให้ทบทวน</p>
          </Card>
        ) : current ? (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm font-medium text-brand">
                <span>เหลือ {remaining} คำ</span>
                <span className="text-slate-400">
                  {total - remaining}/{total} จำได้
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-light">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setFlipped((f) => !f)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setFlipped((f) => !f)
                }
              }}
              className="cursor-pointer select-none outline-none"
              style={{ perspective: '1200px' }}
            >
              <div
                className="relative min-h-[20rem] w-full"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* FRONT */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6 text-center shadow card"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-xs font-medium text-brand/50">
                    {current.lessonTitleTh}
                  </span>
                  <div className="text-4xl font-bold text-brand">{current.word}</div>
                  {current.ipa ? <div className="text-accent">{current.ipa}</div> : null}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      speak(current.word)
                    }}
                    aria-label="ฟังเสียงคำศัพท์"
                    className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-2xl"
                  >
                    🔊
                  </button>
                  <p className="mt-2 text-xs text-slate-400">แตะการ์ดเพื่อดูคำแปล</p>
                </div>

                {/* BACK */}
                <div
                  className="absolute inset-0 flex flex-col justify-center gap-4 rounded-2xl bg-white p-6 shadow card"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="text-center text-2xl font-bold text-brand">{current.thai}</div>
                  <div className="rounded-xl bg-brand-light p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-700">{current.exampleEn}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          speak(current.exampleEn)
                        }}
                        aria-label="ฟังเสียงประโยคตัวอย่าง"
                        className="shrink-0 text-xl"
                      >
                        🔊
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{current.exampleTh}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {flipped ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="ghost" onClick={handleDontKnow}>
                    ยังไม่ได้ ✗
                  </Button>
                  <Button variant="accent" onClick={handleKnow}>
                    จำได้ ✓
                  </Button>
                </div>
              ) : (
                <p className="text-center text-sm text-slate-400">
                  แตะการ์ดเพื่อดูคำแปลก่อนประเมินตัวเอง
                </p>
              )}
            </div>
          </>
        ) : (
          <Card className="text-center">
            <p className="text-5xl">🎉</p>
            <p className="mt-4 text-lg font-bold text-brand">ทบทวนครบแล้ว!</p>
            <p className="mt-1 text-slate-500">เก่งมาก ทบทวนไปทั้งหมด {total} คำ</p>
            <div className="mt-5">
              <Button variant="accent" onClick={handleRestart}>
                เริ่มใหม่ 🔁
              </Button>
            </div>
          </Card>
        )}
      </main>

      <BottomNav />
    </PhoneFrame>
  )
}
