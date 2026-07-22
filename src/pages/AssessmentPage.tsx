import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getAssessments, saveAssessment } from '../lib/data'
import { SKILL_LABEL_TH, PLACEMENT_QUESTIONS } from '../lib/placementTest'
import type { PlacementScore } from '../lib/placementTest'
import type { AssessmentResult } from '../types'
import { Button, Card, Confetti, LoadingScreen, PhoneFrame, ProgressRing } from '../components/ui'
import TestRunner from '../components/TestRunner'

type Step = 'intro' | 'test' | 'result'

function Delta({ from, to }: { from: number; to: number }) {
  const d = to - from
  if (d > 0) return <span className="font-bold text-success">▲ +{d}</span>
  if (d < 0) return <span className="font-bold text-danger">▼ {d}</span>
  return <span className="font-bold text-slate-400">= 0</span>
}

export default function AssessmentPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const [step, setStep] = useState<Step>('intro')
  const [pre, setPre] = useState<AssessmentResult | null>(null)
  const [score, setScore] = useState<PlacementScore | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    getAssessments(user.id)
      .then((list) => setPre(list.find((a) => a.kind === 'pre') ?? null))
      .catch((e) => console.error('load assessments', e))
      .finally(() => setLoadingData(false))
  }, [user, loading, navigate])

  async function handleComplete(result: PlacementScore) {
    setScore(result)
    setStep('result')
    if (user) {
      try {
        await saveAssessment(user.id, 'post', result)
      } catch (e) {
        console.error('save post assessment', e)
      }
    }
  }

  if (loading || loadingData) return <LoadingScreen text="กำลังโหลด…" />

  return (
    <PhoneFrame>
      <header className="hero-gradient px-6 pb-8 pt-9 text-white">
        <button
          type="button"
          onClick={() => navigate('/progress')}
          className="mb-2 text-sm opacity-90"
        >
          ← กลับ
        </button>
        <h1 className="text-2xl font-bold">แบบทดสอบวัดผล</h1>
        <p className="mt-1 text-sm text-white/85">
          {step === 'result'
            ? 'เทียบกับตอนเริ่มต้น'
            : `ทำ ${PLACEMENT_QUESTIONS.length} ข้อเหมือนตอนเริ่ม เพื่อวัดพัฒนาการ`}
        </p>
      </header>

      <main className="flex flex-1 flex-col px-5 py-6">
        {step === 'intro' && (
          <div className="flex flex-1 flex-col">
            <Card className="text-center">
              <div className="text-5xl">📈</div>
              <p className="mt-3 font-bold text-slate-800">ทำแบบวัดผลตอนนี้</p>
              <p className="mt-2 text-sm text-slate-600">
                ชุดข้อสอบเดียวกับตอนเริ่มเรียน ({PLACEMENT_QUESTIONS.length} ข้อ) เพื่อเทียบว่าคุณเก่งขึ้นแค่ไหน
              </p>
              {pre ? (
                <div className="mt-4 rounded-xl bg-brand-light px-4 py-3 text-sm text-brand">
                  คะแนนตอนเริ่ม: <span className="font-bold">{pre.total_score}/100</span> ({pre.cefr_level})
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400">ยังไม่มีคะแนนพรีเทสไว้เทียบ — ทำครั้งนี้จะถือเป็นจุดเริ่ม</p>
              )}
            </Card>
            <div className="mt-5">
              <Button variant="accent" className="w-full" onClick={() => setStep('test')}>
                เริ่มทำแบบทดสอบ
              </Button>
            </div>
          </div>
        )}

        {step === 'test' && <TestRunner onComplete={handleComplete} />}

        {step === 'result' && score && (
          <div className="flex flex-1 flex-col items-center text-center">
            {pre && score.total > pre.total_score && <Confetti pieces={34} />}
            <ProgressRing percent={score.total} size={160} stroke={13} color="#22a06b" track="#e3f6ee">
              <span className="text-5xl font-extrabold leading-none text-success">{score.total}</span>
              <span className="mt-1 text-xs text-slate-500">คะแนน /100</span>
            </ProgressRing>

            {pre ? (
              <>
                <p className="mt-4 text-lg font-bold text-slate-800">
                  {score.total > pre.total_score
                    ? '🎉 คุณเก่งขึ้น!'
                    : score.total === pre.total_score
                      ? 'รักษาระดับไว้ได้ 👍'
                      : 'ลองทบทวนอีกนิดนะ 💪'}
                </p>
                <Card className="mt-4 w-full text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm text-slate-600">คะแนนรวม</span>
                    <span className="text-sm">
                      {pre.total_score} → <span className="font-bold text-slate-800">{score.total}</span>{' '}
                      <Delta from={pre.total_score} to={score.total} />
                    </span>
                  </div>
                  {([
                    ['listening', pre.listening_score, score.listening],
                    ['vocab', pre.vocab_score, score.vocab],
                    ['grammar', pre.grammar_score, score.grammar],
                  ] as const).map(([k, a, b]) => (
                    <div key={k} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-slate-600">
                        {SKILL_LABEL_TH[k].emoji} {SKILL_LABEL_TH[k].label}
                      </span>
                      <span>
                        {a} → <span className="font-bold text-slate-800">{b}</span> <Delta from={a} to={b} />
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 rounded-xl bg-brand-light px-3 py-2 text-sm text-brand">
                    ระดับ: {pre.cefr_level} → <span className="font-bold">{score.cefr}</span>
                  </div>
                </Card>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                บันทึกเป็นจุดเริ่มแล้ว — เรียนไปสักพักแล้วกลับมาทำใหม่เพื่อดูพัฒนาการ
              </p>
            )}

            <div className="mt-6 w-full">
              <Button variant="accent" className="w-full" onClick={() => navigate('/progress')}>
                ดูความก้าวหน้า
              </Button>
            </div>
          </div>
        )}
      </main>
    </PhoneFrame>
  )
}
