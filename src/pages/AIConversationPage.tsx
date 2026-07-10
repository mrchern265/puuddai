import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getScenarioByUnit, callTutor, saveConversationSession } from '../lib/data'
import type { Scenario, ChatMessage, ScoreResult } from '../types'
import { Button, Card, LoadingScreen, PhoneFrame } from '../components/ui'

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

function ChatHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <header className="hero-gradient flex-none px-4 pt-10 pb-5 text-white">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดและกลับหน้าหลัก"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-lg leading-none"
        >
          ✕
        </button>
        <span className="text-sm font-medium opacity-90">ฝึกสนทนา</span>
        <span className="h-9 w-9" aria-hidden="true" />
      </div>
      <h1 className="mt-3 text-xl font-bold leading-snug">{title}</h1>
    </header>
  )
}

export default function AIConversationPage() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(true)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const [ending, setEnding] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!unitId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const s = await getScenarioByUnit(unitId)
        if (!active) return
        setScenario(s)
      } catch {
        if (!active) return
        setScenario(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [unitId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending, hint])

  const instructions = useMemo(() => {
    if (!scenario) return null
    const criteria =
      scenario.success_criteria_json.length > 0
        ? scenario.success_criteria_json.join('; ')
        : 'reach the goal naturally'
    const chat = `You are role-playing as ${scenario.ai_role} in this setting: ${scenario.setting_en}. Your job is to help a Thai beginner learner reach this goal: ${scenario.user_goal_th}. Stay fully in character. Reply ONLY in English at CEFR A1 level, using at most 2 short, simple sentences. If the learner makes a mistake, gently recast it by using the correct form naturally in your reply (do not lecture). Always finish with one simple question to keep the conversation going. OUTPUT ONLY valid JSON, no markdown and no extra text, in exactly this shape: {"reply":"<your english reply>","thai":"<a faithful Thai translation of your reply>"}`
    const hintInstruction = `You are helping a Thai beginner who is stuck in an English conversation. They are talking with ${scenario.ai_role} in this setting: ${scenario.setting_en}, trying to reach this goal: ${scenario.user_goal_th}. Give ONE short, encouraging hint IN THAI about what they could say next. You may quote a short useful English phrase inside quotation marks. Keep it to a single sentence. OUTPUT ONLY valid JSON, no markdown and no extra text, in exactly this shape: {"hint":"<thai hint>"}`
    const score = `Grade this entire English conversation for a Thai beginner learner. Their goal was: ${scenario.user_goal_th}. The success criteria are: ${criteria}. Set taskSuccess to true ONLY if the learner clearly reached the goal. Give fluencyScore as an integer from 0 to 100. In corrections, list the learner's most important mistakes each with the corrected version (leave the array empty if there were none). Write encouragementTh as warm, supportive feedback IN THAI. OUTPUT ONLY valid JSON, no markdown and no extra text, in exactly this shape: {"taskSuccess":true,"fluencyScore":0,"corrections":[{"wrong":"","right":""}],"encouragementTh":""}`
    return { chat, hint: hintInstruction, score }
  }, [scenario])

  function toggleThai(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || !scenario || !instructions || sending) return
    setActionError(null)
    setHint(null)
    const userMsg: ChatMessage = { role: 'user', content: text }
    const next: ChatMessage[] = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setSending(true)
    try {
      const res = await callTutor('chat', next, instructions.chat)
      const reply = (res.reply ?? '').trim()
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: reply || 'Sorry, could you say that again?',
        thai: res.thai,
      }
      setMessages((m) => [...m, assistantMsg])
    } catch {
      setActionError('เชื่อมต่อ AI ไม่สำเร็จ ลองส่งใหม่อีกครั้งนะ')
    } finally {
      setSending(false)
    }
  }

  async function handleHint() {
    if (!scenario || !instructions || hintLoading) return
    setActionError(null)
    setHintLoading(true)
    try {
      const res = await callTutor('hint', messages, instructions.hint)
      setHint((res.hint ?? '').trim() || 'ลองทักทายหรือถามคำถามสั้นๆ เป็นภาษาอังกฤษดูสิ')
    } catch {
      setActionError('ขอคำใบ้ไม่สำเร็จ ลองใหม่อีกครั้งนะ')
    } finally {
      setHintLoading(false)
    }
  }

  async function handleEnd() {
    if (!scenario || !instructions || ending || messages.length === 0) return
    setActionError(null)
    setEnding(true)
    try {
      const res = await callTutor('score', messages, instructions.score)
      const scored: ScoreResult = {
        taskSuccess: res.taskSuccess ?? false,
        fluencyScore: typeof res.fluencyScore === 'number' ? Math.round(res.fluencyScore) : 0,
        corrections: res.corrections ?? [],
        encouragementTh:
          (res.encouragementTh ?? '').trim() ||
          'เก่งมากที่กล้าลองฝึกสนทนา! ครั้งหน้าจะดียิ่งขึ้นแน่นอน',
      }
      if (user) {
        await saveConversationSession(user.id, scenario.id, messages, scored, scored.taskSuccess)
      }
      setResult(scored)
    } catch {
      setActionError('ประเมินผลไม่สำเร็จ ลองกดจบบทสนทนาใหม่อีกครั้งนะ')
    } finally {
      setEnding(false)
    }
  }

  if (loading || authLoading) {
    return <LoadingScreen text="กำลังโหลดบทสนทนา..." />
  }

  if (!unitId) {
    return (
      <PhoneFrame>
        <ChatHeader title="ฝึกสนทนา" onClose={() => navigate('/home')} />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">🗺️</div>
          <p className="mt-3 font-medium text-slate-700">ไม่พบด่านที่ต้องการ</p>
          <Button variant="accent" className="mt-4" onClick={() => navigate('/home')}>
            กลับหน้าหลัก
          </Button>
        </div>
      </PhoneFrame>
    )
  }

  if (!scenario) {
    return (
      <PhoneFrame>
        <ChatHeader title="ฝึกสนทนา" onClose={() => navigate('/home')} />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">💬</div>
          <p className="mt-3 font-medium text-slate-700">ยังไม่มีสถานการณ์สนทนา</p>
          <p className="mt-1 text-sm text-slate-500">
            ด่านนี้ยังไม่มีบทสนทนาให้ฝึก ลองกลับมาใหม่ภายหลังนะ
          </p>
          <Button variant="accent" className="mt-4" onClick={() => navigate('/home')}>
            กลับหน้าหลัก
          </Button>
        </div>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <ChatHeader title={scenario.title_th} onClose={() => navigate('/home')} />

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">สถานการณ์</div>
          <p className="mt-1 text-sm text-slate-700">🎬 {scenario.setting_en}</p>
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-semibold">คู่สนทนา:</span> {scenario.ai_role}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            <span className="font-semibold">เป้าหมายของคุณ:</span> {scenario.user_goal_th}
          </p>
          {scenario.success_criteria_json.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500">เกณฑ์ผ่านด่าน</div>
              <ul className="mt-1 space-y-1">
                {scenario.success_criteria_json.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-full bg-brand-light text-[10px] font-bold text-brand">
                      ✓
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="mt-4 space-y-3">
          {messages.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              พิมพ์ทักทายเป็นภาษาอังกฤษเพื่อเริ่มบทสนทนาได้เลย 👋
            </p>
          )}

          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand px-4 py-2 text-sm text-white">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-slate-800 shadow">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 leading-relaxed">{m.content}</p>
                    <button
                      type="button"
                      onClick={() => speak(m.content)}
                      aria-label="ฟังเสียงภาษาอังกฤษ"
                      className="flex-none text-base leading-none"
                    >
                      🔊
                    </button>
                  </div>
                  {m.thai && (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleThai(i)}
                        className="mt-1 text-xs font-medium text-brand"
                      >
                        {revealed.has(i) ? 'ซ่อนคำแปล' : 'แปล'}
                      </button>
                      {revealed.has(i) && <p className="mt-1 text-xs text-slate-500">{m.thai}</p>}
                    </>
                  )}
                </div>
              </div>
            ),
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-slate-400 shadow">
                กำลังพิมพ์…
              </div>
            </div>
          )}

          {hint && (
            <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-dark">
              <span className="font-semibold">💡 คำใบ้: </span>
              {hint}
            </div>
          )}

          {actionError && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{actionError}</div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <div className="flex-none border-t border-slate-200 bg-white px-4 py-3">
        <div className="mb-2 flex gap-2">
          <Button
            variant="ghost"
            onClick={handleHint}
            disabled={hintLoading || sending}
            className="flex-1 text-sm"
          >
            {hintLoading ? 'กำลังคิด…' : '💡 ใบ้'}
          </Button>
          <Button
            variant="accent"
            onClick={handleEnd}
            disabled={ending || messages.length === 0}
            className="flex-1 text-sm"
          >
            {ending ? 'กำลังประเมิน…' : 'จบบทสนทนา'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
            placeholder="พิมพ์ภาษาอังกฤษ…"
            aria-label="พิมพ์ข้อความภาษาอังกฤษ"
            className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-800 outline-none focus:border-brand"
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="px-5"
          >
            ส่ง
          </Button>
        </div>
      </div>

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-sm text-center">
            <div className="text-5xl">{result.taskSuccess ? '🎉' : '💪'}</div>
            <h2 className="mt-2 text-xl font-bold text-brand">
              {result.taskSuccess ? 'ผ่านด่านแล้ว! 🎉' : 'ยังไม่ผ่าน ลองอีกครั้งนะ'}
            </h2>
            {result.taskSuccess && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1 text-sm font-semibold text-accent-dark">
                🏅 ปลดล็อกเหรียญตราด่านนี้
              </div>
            )}
            <div className="mt-3 text-sm text-slate-500">คะแนนความคล่อง</div>
            <div className="text-3xl font-bold text-accent">
              {result.fluencyScore}
              <span className="text-base text-slate-400">/100</span>
            </div>
            <p className="mt-3 rounded-xl bg-brand-light px-4 py-3 text-sm text-brand">
              {result.encouragementTh}
            </p>
            {result.corrections.length > 0 && (
              <div className="mt-4 text-left">
                <div className="text-sm font-semibold text-slate-700">จุดที่ปรับได้</div>
                <ul className="mt-2 space-y-2">
                  {result.corrections.map((c, i) => (
                    <li key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="text-red-500 line-through">{c.wrong}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="font-medium text-green-600">{c.right}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2">
              <Button variant="accent" onClick={() => navigate('/home')}>
                กลับหน้าหลัก
              </Button>
              <Button variant="ghost" onClick={() => setResult(null)}>
                สนทนาต่อ
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PhoneFrame>
  )
}
