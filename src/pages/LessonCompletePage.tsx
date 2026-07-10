import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, PhoneFrame } from '../components/ui'

interface CompleteState {
  score?: number
  correct?: number
  total?: number
}

interface Encouragement {
  emoji: string
  headline: string
  message: string
}

function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

export default function LessonCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = (location.state ?? null) as CompleteState | null

  const score = useMemo<number>(() => {
    if (state && typeof state.score === 'number' && !Number.isNaN(state.score)) {
      return clampPercent(state.score)
    }
    if (
      state &&
      typeof state.correct === 'number' &&
      typeof state.total === 'number' &&
      state.total > 0
    ) {
      return clampPercent((state.correct / state.total) * 100)
    }
    return 100
  }, [state])

  const correct =
    state && typeof state.correct === 'number' && !Number.isNaN(state.correct)
      ? state.correct
      : null
  const total =
    state && typeof state.total === 'number' && !Number.isNaN(state.total)
      ? state.total
      : null
  const hasBreakdown = correct !== null && total !== null && total > 0

  const encouragement = useMemo<Encouragement>(() => {
    if (score >= 80) {
      return {
        emoji: '🎉',
        headline: 'เยี่ยมมาก!',
        message: 'คุณทำได้ยอดเยี่ยมเลย เก่งขึ้นทุกวัน ไปต่อกันเลย!',
      }
    }
    if (score >= 50) {
      return {
        emoji: '👏',
        headline: 'ทำได้ดี!',
        message: 'มาถูกทางแล้ว ฝึกอีกนิดเดียวก็เก่งขึ้นแน่นอน',
      }
    }
    return {
      emoji: '💪',
      headline: 'สู้ต่อไปนะ!',
      message: 'ไม่เป็นไรเลย ลองทบทวนอีกครั้ง แล้วคุณจะทำได้ดีขึ้นแน่นอน',
    }
  }, [score])

  return (
    <PhoneFrame>
      <div className="hero-gradient flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-12 text-center text-white">
        <div className="text-7xl" aria-hidden>
          {encouragement.emoji}
        </div>

        <h1 className="mt-4 text-3xl font-bold">{encouragement.headline}</h1>
        <p className="mt-2 text-base text-white/80">เรียนบทเรียนจบแล้ว</p>

        <div className="mt-8 flex h-44 w-44 flex-col items-center justify-center rounded-full border-4 border-white/40 bg-white/10 shadow-lg">
          <span className="text-6xl font-extrabold leading-none">{score}%</span>
          <span className="mt-2 text-sm text-white/80">คะแนน</span>
        </div>

        {hasBreakdown ? (
          <p className="mt-4 text-sm text-white/85">
            ตอบถูก {correct} จาก {total} ข้อ
          </p>
        ) : null}

        <div className="mt-6 rounded-full bg-accent px-6 py-2 text-lg font-bold text-white shadow-md">
          +50 XP
        </div>

        <p className="mt-6 max-w-xs text-base leading-relaxed text-white/90">
          {encouragement.message}
        </p>

        <div className="mt-10 w-full max-w-xs">
          <Button
            variant="accent"
            className="w-full"
            onClick={() => navigate('/home', { replace: true })}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </PhoneFrame>
  )
}
