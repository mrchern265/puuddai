import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { saveAssessment, saveOnboarding } from '../lib/data'
import { SKILL_LABEL_TH } from '../lib/placementTest'
import type { PlacementScore } from '../lib/placementTest'
import { Button, Card, Confetti, LoadingScreen, PhoneFrame, ProgressRing } from '../components/ui'
import TestRunner from '../components/TestRunner'

type Step = 'goal' | 'test' | 'result'
type Goal = 'travel' | 'work' | 'general'

const GOAL_OPTIONS: { key: Goal; emoji: string; titleTh: string; descTh: string }[] = [
  { key: 'travel', emoji: '✈️', titleTh: 'ท่องเที่ยว', descTh: 'สั่งอาหาร เช็คอิน ถามทาง ผ่าน ตม.' },
  { key: 'work', emoji: '💼', titleTh: 'ทำงาน', descTh: 'อีเมล ประชุม คุยกับลูกค้า' },
  { key: 'general', emoji: '🌍', titleTh: 'ทั่วไป', descTh: 'ใช้ในชีวิตประจำวันทั่วไป' },
]

const GOAL_LABEL: Record<Goal, string> = {
  travel: 'ท่องเที่ยว ✈️',
  work: 'ทำงาน 💼',
  general: 'ทั่วไป 🌍',
}

const LEVEL_INFO: Record<string, { emoji: string; blurbTh: string }> = {
  A0: { emoji: '🌱', blurbTh: 'เริ่มจากศูนย์ ไม่เป็นไรเลย เราจะพาไปทีละก้าว' },
  A1: { emoji: '🌤️', blurbTh: 'มีพื้นฐานติดตัวมาแล้ว มาต่อยอดกัน' },
  A2: { emoji: '🚀', blurbTh: 'เก่งกว่าที่คิด! พร้อมลุยบทที่ท้าทายขึ้น' },
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const [step, setStep] = useState<Step>('goal')
  const [goal, setGoal] = useState<Goal | null>(null)
  const [score, setScore] = useState<PlacementScore | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [loading, user, navigate])

  const handleComplete = useCallback(
    async (result: PlacementScore) => {
      setScore(result)
      setStep('result')
      if (!user) return
      setSaveError(null)
      try {
        await saveOnboarding(user.id, goal ?? 'general', result.cefr)
        await saveAssessment(user.id, 'pre', result)
      } catch {
        setSaveError('บันทึกผลไม่สำเร็จ แต่คุณเริ่มเรียนได้เลย')
      }
    },
    [user, goal],
  )

  if (loading || !user) {
    return <LoadingScreen text="กำลังเตรียมความพร้อม..." />
  }

  const skillBars = score
    ? ([
        ['listening', score.listening],
        ['vocab', score.vocab],
        ['grammar', score.grammar],
      ] as const)
    : []

  return (
    <PhoneFrame>
      <header className="hero-gradient px-6 pb-8 pt-10 text-white">
        <p className="text-sm font-medium text-white/80">ยินดีต้อนรับสู่ PuudDai 👋</p>
        <h1 className="mt-1 text-2xl font-bold">
          {step === 'goal'
            ? 'เป้าหมายของคุณ'
            : step === 'test'
              ? 'แบบทดสอบวัดระดับ'
              : 'ผลวัดระดับของคุณ'}
        </h1>
        <p className="mt-1 text-sm text-white/85">
          {step === 'goal'
            ? 'เลือกสิ่งที่คุณอยากใช้ภาษาอังกฤษมากที่สุด'
            : step === 'test'
              ? 'ตอบ 10 ข้อ วัดการฟัง คำศัพท์ และไวยากรณ์'
              : 'นี่คือจุดเริ่มต้นของคุณ — ไว้เทียบพัฒนาการทีหลัง'}
        </p>
      </header>

      <main className="flex flex-1 flex-col px-5 py-6">
        {step === 'goal' && (
          <div className="flex flex-col gap-4">
            {GOAL_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => {
                  setGoal(o.key)
                  setStep('test')
                }}
                className="flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left shadow-sm transition active:scale-[0.98] hover:border-brand"
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

        {step === 'test' && <TestRunner onComplete={handleComplete} />}

        {step === 'result' && score && (
          <div className="flex flex-1 flex-col items-center text-center">
            <Confetti pieces={30} />
            <ProgressRing percent={score.total} size={168} stroke={13} color="#1e4799" track="#e8eef9">
              <span className="text-5xl font-extrabold leading-none text-brand">{score.total}</span>
              <span className="mt-1 text-xs text-slate-500">คะแนน /100</span>
            </ProgressRing>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-3xl">{LEVEL_INFO[score.cefr]?.emoji}</span>
              <span className="text-3xl font-extrabold text-brand">{score.cefr}</span>
            </div>
            <p className="mt-1 max-w-xs text-sm text-slate-600">{LEVEL_INFO[score.cefr]?.blurbTh}</p>

            <Card className="mt-6 w-full text-left">
              <p className="mb-3 text-sm font-semibold text-slate-700">คะแนนแยกทักษะ</p>
              {skillBars.map(([key, val]) => (
                <div key={key} className="mb-3 last:mb-0">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {SKILL_LABEL_TH[key].emoji} {SKILL_LABEL_TH[key].label}
                    </span>
                    <span className="font-semibold text-brand">{val}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-light">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-700"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-3 rounded-xl bg-brand-light px-3 py-2 text-sm text-brand">
                ตอบถูก {score.correct}/{score.totalQuestions} ข้อ
                {goal ? ` · เป้าหมาย: ${GOAL_LABEL[goal]}` : ''}
              </div>
            </Card>

            {saveError && <p className="mt-4 text-sm text-accent-dark">{saveError}</p>}

            <div className="mt-6 w-full">
              <Button variant="accent" className="w-full" onClick={() => navigate('/home', { replace: true })}>
                เริ่มเรียนเลย 🚀
              </Button>
            </div>
          </div>
        )}
      </main>
    </PhoneFrame>
  )
}
