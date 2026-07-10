import { useEffect, useMemo, useState } from 'react'
import { getAllVocab, type VocabWithSource } from '../lib/data'
import { Button, Card, TextField, BottomNav, PhoneFrame, LoadingScreen } from '../components/ui'

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

interface VocabGroup {
  title: string
  items: VocabWithSource[]
}

function groupByLesson(items: VocabWithSource[]): VocabGroup[] {
  const groups: VocabGroup[] = []
  const index = new Map<string, VocabGroup>()
  for (const item of items) {
    const title = item.lessonTitleTh || 'อื่น ๆ'
    let group = index.get(title)
    if (!group) {
      group = { title, items: [] }
      index.set(title, group)
      groups.push(group)
    }
    group.items.push(item)
  }
  return groups
}

export default function VocabBankPage() {
  const [vocab, setVocab] = useState<VocabWithSource[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<string>('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getAllVocab()
      .then((data) => {
        if (!active) return
        setVocab(data)
      })
      .catch(() => {
        if (!active) return
        setError('โหลดคำศัพท์ไม่สำเร็จ ลองใหม่อีกครั้ง')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo<VocabWithSource[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return vocab
    return vocab.filter(
      (v) => v.word.toLowerCase().includes(q) || v.thai.toLowerCase().includes(q),
    )
  }, [vocab, query])

  const groups = useMemo<VocabGroup[]>(() => groupByLesson(filtered), [filtered])

  if (loading) return <LoadingScreen text="กำลังโหลดคำศัพท์..." />

  return (
    <PhoneFrame>
      <header className="hero-gradient px-5 pb-6 pt-8 text-white">
        <h1 className="text-2xl font-bold">คลังคำศัพท์</h1>
        <p className="mt-1 text-sm text-white/80">
          รวมคำศัพท์ทั้งหมดที่คุณได้เรียนมา
        </p>
      </header>

      <main className="flex-1 space-y-5 px-5 py-5">
        <div className="rounded-2xl">
          <TextField
            label="ค้นหาคำศัพท์"
            value={query}
            onChange={setQuery}
            placeholder="พิมพ์คำอังกฤษหรือคำแปลไทย"
          />
        </div>

        {error ? (
          <Card className="text-center">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => {
                setQuery('')
                setLoading(true)
                setError(null)
                getAllVocab()
                  .then((data) => setVocab(data))
                  .catch(() => setError('โหลดคำศัพท์ไม่สำเร็จ ลองใหม่อีกครั้ง'))
                  .finally(() => setLoading(false))
              }}
            >
              ลองใหม่
            </Button>
          </Card>
        ) : vocab.length === 0 ? (
          <Card className="text-center">
            <p className="text-4xl">📭</p>
            <p className="mt-3 text-brand">ยังไม่มีคำศัพท์</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 text-brand">
              ไม่พบคำศัพท์ที่ตรงกับ “{query.trim()}”
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.title} className="space-y-3">
                <h2 className="px-1 text-base font-bold text-brand">
                  {group.title}
                  <span className="ml-2 text-sm font-normal text-accent">
                    {group.items.length} คำ
                  </span>
                </h2>

                {group.items.map((item, i) => (
                  <Card key={`${group.title}-${item.word}-${i}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-lg font-bold text-brand">{item.word}</p>
                        {item.ipa ? (
                          <p className="mt-0.5 text-sm text-slate-500">/{item.ipa}/</p>
                        ) : null}
                        <p className="mt-1 text-base text-slate-800">{item.thai}</p>
                      </div>
                      <button
                        type="button"
                        aria-label={`ฟังเสียงคำว่า ${item.word}`}
                        onClick={() => speak(item.word)}
                        className="shrink-0 rounded-full bg-brand-light px-3 py-2 text-lg"
                      >
                        🔊
                      </button>
                    </div>

                    {(item.exampleEn || item.exampleTh) && (
                      <div className="mt-3 rounded-xl bg-brand-light/60 p-3">
                        {item.exampleEn ? (
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-slate-800">
                              {item.exampleEn}
                            </p>
                            <button
                              type="button"
                              aria-label="ฟังเสียงประโยคตัวอย่าง"
                              onClick={() => speak(item.exampleEn)}
                              className="shrink-0 text-base"
                            >
                              🔊
                            </button>
                          </div>
                        ) : null}
                        {item.exampleTh ? (
                          <p className="mt-1 text-sm text-slate-600">{item.exampleTh}</p>
                        ) : null}
                      </div>
                    )}
                  </Card>
                ))}
              </section>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </PhoneFrame>
  )
}
