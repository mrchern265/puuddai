import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Confetti, PhoneFrame, ProgressRing, Stars } from '../components/ui'

interface CompleteState {
  score?: number
  correct?: number
  total?: number
  points?: number
  maxCombo?: number
  lives?: number
  stars?: number
  unitId?: string
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
  const points = state?.points ?? 0
  const maxCombo = state?.maxCombo ?? 0
  const stars = state?.stars ?? (score >= 80 ? 3 : score >= 50 ? 2 : 1)

  const encouragement = useMemo<Encouragement>(() => {
    if (stars >= 3) {
      return { emoji: '🏆', headline: 'สุดยอด! เพอร์เฟกต์!', message: 'ตอบถูกหมดเลย เก่งมากกก ไปต่อกันเลย!' }
    }
    if (score >= 50) {
      return { emoji: '🎉', headline: 'ทำได้ดีมาก!', message: 'มาถูกทางแล้ว ฝึกอีกนิดเดียวก็เก่งขึ้นแน่นอน' }
    }
    return { emoji: '💪', headline: 'สู้ต่อไปนะ!', message: 'ไม่เป็นไรเลย ลองเล่นซ้ำอีกครั้ง แล้วคุณจะทำได้ดีขึ้นแน่นอน' }
  }, [score, stars])

  return (
    <PhoneFrame>
      {score >= 50 && <Confetti />}
      <div className="hero-gradient flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-12 text-center text-white">
        <div className="text-6xl animate-bounce-in" aria-hidden>
          {encouragement.emoji}
        </div>

        <h1 className="mt-3 text-2xl font-bold animate-slide-up">{encouragement.headline}</h1>

        <div className="mt-5">
          <Stars earned={stars} />
        </div>

        <div className="mt-6">
          <ProgressRing percent={score} size={168} stroke={13}>
            <span className="text-5xl font-extrabold leading-none">{score}%</span>
            <span className="mt-1 text-sm text-white/80">คะแนน</span>
          </ProgressRing>
        </div>

        {hasBreakdown && (
          <p className="mt-4 text-sm text-white/85">
            ตอบถูก {correct} จาก {total} ข้อ
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full bg-accent px-5 py-2 text-lg font-bold shadow-md">+50 XP</span>
          <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
            ⭐ {points} แต้ม
          </span>
          {maxCombo >= 2 && (
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
              🔥 คอมโบสูงสุด x{maxCombo}
            </span>
          )}
        </div>

        <p className="mt-6 max-w-xs text-base leading-relaxed text-white/90 animate-slide-up">
          {encouragement.message}
        </p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <Button
            variant="accent"
            className="w-full"
            onClick={() =>
              navigate(state?.unitId ? `/unit/${state.unitId}` : '/home', { replace: true })
            }
          >
            ไปต่อ 🚀
          </Button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-white/70 underline-offset-2 hover:underline"
          >
            เล่นบทนี้อีกครั้ง
          </button>
        </div>
      </div>
    </PhoneFrame>
  )
}
