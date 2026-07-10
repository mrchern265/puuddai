import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { setCefrLevel } from '../lib/data'
import type { CefrLevel } from '../types'
import { Button, Card, LoadingScreen, PhoneFrame } from '../components/ui'

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

type Step = 'goal' | 'test' | 'result'
type Goal = 'travel' | 'work' | 'general'

interface GoalOption {
  key: Goal
  emoji: string
  titleTh: string
  descTh: string
}

interface PlacementQuestion {
  instructionTh: string
  prompt: string
  choices: string[]
  answerIndex: number
}

const GOAL_OPTIONS: GoalOption[] = [
  { key: 'travel', emoji: '✈️', titleTh: 'ท่องเที่ยว', descTh: 'สั่งอาหาร เช็คอิน ถามทาง' },
  { key: 'work', emoji: '💼', titleTh: 'ทำงาน', descTh: 'อีเมล ประชุม คุยกับลูกค้า' },
  { key: 'general', emoji: '🌍', titleTh: 'ทั่วไป', descTh: 'ใช้ในชีวิตประจำวันทั่วไป' },
]

const GOAL_LABEL: Record<Goal, string> = {
  travel: 'ท่องเที่ยว ✈️',
  work: 'ทำงาน 💼',
  general: 'ทั่วไป 🌍',
}

const QUESTIONS: PlacementQuestion[] = [
  {
    instructionTh: 'เลือกคำทักทายที่ถูกต้องในตอนเช้า',
    prompt: 'Good ____!',
    choices: ['Morning', 'Night', 'Bye', 'Thanks'],
    answerIndex: 0,
  },
  {
    instructionTh: "เลือกคำภาษาอังกฤษที่แปลว่า 'น้ำ'",
    prompt: "Which word means 'น้ำ'?",
    choices: ['Rice', 'Water', 'Milk', 'Fire'],
    answerIndex: 1,
  },
  {
    instructionTh: 'เติมคำในช่องว่างให้ถูกต้อง',
    prompt: 'I ____ a student.',
    choices: ['am', 'is', 'are', 'be'],
    answerIndex: 0,
  },
  {
    instructionTh: 'เลือกคำกริยาที่เหมาะสมที่สุด',
    prompt: 'She ____ to school every day.',
    choices: ['go', 'goes', 'going', 'gone'],
    answerIndex: 1,
  },
  {
    instructionTh: 'เลือกประโยคที่ถูกต้องตามหลักไวยากรณ์',
    prompt: 'Which sentence is correct?',
    choices: [
      "He don't like it.",
      "He doesn't like it.",
      'He not like it.',
      'He no like it.',
    ],
    answerIndex: 1,
  },
]

function levelFromScore(correct: number): CefrLevel {
  if (correct <= 1) return 'A0'
  if (correct <= 3) return 'A1'
  return 'A2'
}

const LEVEL_INFO: Record<CefrLevel, { emoji: string; blurbTh: string }> = {
  A0: { emoji: '🌱', blurbTh: 'เริ่มจากศูนย์ ไม่เป็นไรเลย เราจะพาไปทีละก้าว' },
  A1: { emoji: '🌤️', blurbTh: 'มีพื้นฐานติดตัวมาแล้ว มาต่อยอดกัน' },
  A2: { emoji: '🚀', blurbTh: 'เก่งกว่าที่คิด! พร้อมลุยบทที่ท้าทายขึ้น' },
}

const CHOICE_LETTERS = ['A', 'B', 'C', 'D']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const [step, setStep] = useState<Step>('goal')
  const [goal, setGoal] = useState<Goal | null>(null)
  const [current, setCurrent] = useState<number>(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array<number | null>(QUESTIONS.length).fill(null),
  )
  const [level, setLevel] = useState<CefrLevel | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [loading, user, navigate])

  const saveLevel = useCallback(
    async (lvl: CefrLevel) => {
      if (!user) return
      setSaving(true)
      setSaveError(null)
      try {
        await setCefrLevel(user.id, lvl)
      } catch {
        setSaveError('บันทึกระดับไม่สำเร็จ กรุณาลองอีกครั้ง')
      } finally {
        setSaving(false)
      }
    },
    [user],
  )

  const selectGoal = (g: Goal) => {
    setGoal(g)
    setStep('test')
  }

  const handleAnswer = (choiceIndex: number) => {
    const q = QUESTIONS[current]
    if (!q) return
    const next = answers.slice()
    next[current] = choiceIndex
    setAnswers(next)

    if (current + 1 < QUESTIONS.length) {
      setCurrent(current + 1)
    } else {
      const correctCount = next.reduce<number>(
        (acc, ans, i) => acc + (ans !== null && ans === QUESTIONS[i]?.answerIndex ? 1 : 0),
        0,
      )
      const lvl = levelFromScore(correctCount)
      setLevel(lvl)
      setStep('result')
      void saveLevel(lvl)
    }
  }

  const handleBack = () => {
    if (current > 0) {
      setCurrent(current - 1)
      return
    }
    setStep('goal')
  }

  if (loading || !user) {
    return <LoadingScreen text="กำลังเตรียมความพร้อม..." />
  }

  const question = QUESTIONS[current]
  const progressPct = Math.round(((current + 1) / QUESTIONS.length) * 100)
  const correctCount = answers.reduce<number>(
    (acc, ans, i) => acc + (ans !== null && ans === QUESTIONS[i]?.answerIndex ? 1 : 0),
    0,
  )

  return (
    <PhoneFrame>
      <header className="hero-gradient px-6 pb-8 pt-10 text-white">
        <p className="text-sm font-medium text-white/80">ยินดีต้อนรับสู่ PuudDai 👋</p>
        <h1 className="mt-1 text-2xl font-bold">
          {step === 'goal'
            ? 'เป้าหมายของคุณ'
            : step === 'test'
              ? 'วัดระดับเริ่มต้น'
              : 'พร้อมเริ่มเรียนแล้ว!'}
        </h1>
        <p className="mt-1 text-sm text-white/85">
          {step === 'goal'
            ? 'เลือกสิ่งที่คุณอยากใช้ภาษาอังกฤษมากที่สุด'
            : step === 'test'
              ? 'ตอบ 5 ข้อสั้น ๆ เพื่อจัดบทเรียนให้เหมาะกับคุณ'
              : 'เราปรับบทเรียนให้เข้ากับระดับของคุณแล้ว'}
        </p>
      </header>

      <main className="flex flex-1 flex-col px-5 py-6">
        {step === 'goal' && (
          <div className="flex flex-col gap-4">
            {GOAL_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => selectGoal(o.key)}
                className="flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left shadow-sm transition active:scale-[0.98] hover:border-brand hover:bg-brand-light"
              >
                <span className="text-4xl" aria-hidden>
                  {o.emoji}
                </span>
                <span className="flex flex-col">
                  <span className="text-lg font-bold text-slate-800">{o.titleTh}</span>
                  <span className="text-sm text-slate-500">{o.descTh}</span>
                </span>
                <span className="ml-auto text-brand" aria-hidden>
                  ➜
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 'test' && question && (
          <div className="flex flex-1 flex-col">
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-500">
                <span>
                  ข้อ {current + 1} / {QUESTIONS.length}
                </span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-light">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <Card className="flex flex-col">
              <p className="text-sm font-medium text-brand">{question.instructionTh}</p>
              <div className="mt-3 flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-800">{question.prompt}</p>
                <button
                  type="button"
                  onClick={() => speak(question.prompt)}
                  aria-label="ฟังเสียงอ่าน"
                  className="ml-auto shrink-0 rounded-full bg-brand-light px-3 py-2 text-lg text-brand active:scale-90"
                >
                  🔊
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {question.choices.map((c, i) => {
                  const selected = answers[current] === i
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleAnswer(i)}
                      className={[
                        'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition active:scale-[0.98]',
                        selected
                          ? 'border-brand bg-brand-light text-brand'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-brand',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                          selected ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500',
                        ].join(' ')}
                      >
                        {CHOICE_LETTERS[i]}
                      </span>
                      <span className="text-base font-medium">{c}</span>
                    </button>
                  )
                })}
              </div>
            </Card>

            <div className="mt-4">
              <Button variant="ghost" type="button" onClick={handleBack}>
                ← ย้อนกลับ
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && level && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Card className="w-full">
              <div className="text-6xl" aria-hidden>
                {LEVEL_INFO[level].emoji}
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">ระดับเริ่มต้นของคุณ</p>
              <p className="mt-1 text-4xl font-extrabold text-brand">{level}</p>
              <p className="mt-3 text-base text-slate-600">{LEVEL_INFO[level].blurbTh}</p>

              <div className="mt-5 rounded-xl bg-brand-light px-4 py-3 text-sm text-brand">
                ตอบถูก {correctCount} จาก {QUESTIONS.length} ข้อ
                {goal ? ` · เป้าหมาย: ${GOAL_LABEL[goal]}` : ''}
              </div>

              {saveError && (
                <p className="mt-4 text-sm font-medium text-accent-dark">{saveError}</p>
              )}

              <div className="mt-6">
                {saveError ? (
                  <Button
                    variant="primary"
                    type="button"
                    disabled={saving}
                    onClick={() => void saveLevel(level)}
                  >
                    {saving ? 'กำลังบันทึก...' : 'ลองบันทึกอีกครั้ง'}
                  </Button>
                ) : (
                  <Button
                    variant="accent"
                    type="button"
                    disabled={saving}
                    onClick={() => navigate('/home', { replace: true })}
                  >
                    {saving ? 'กำลังบันทึก...' : 'เริ่มเรียนเลย 🚀'}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </PhoneFrame>
  )
}
