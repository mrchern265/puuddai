import { useMemo, useState } from 'react'
import { Button, Card } from './ui'
import { PLACEMENT_QUESTIONS, computeScore } from '../lib/placementTest'
import type { PlacementScore, Skill } from '../lib/placementTest'

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

function shuffle<T>(input: T[]): T[] {
  const arr = input.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface PreparedQuestion {
  skill: Skill
  instructionTh: string
  prompt: string
  audio?: string
  choices: string[]
  answerIndex: number
}

export default function TestRunner({
  onComplete,
}: {
  onComplete: (score: PlacementScore) => void
}) {
  // shuffle choices once so the correct answer isn't in a fixed slot
  const questions = useMemo<PreparedQuestion[]>(
    () =>
      PLACEMENT_QUESTIONS.map((q) => {
        const correct = q.choices[q.answerIndex]
        const choices = shuffle(q.choices)
        return {
          skill: q.skill,
          instructionTh: q.instructionTh,
          prompt: q.prompt,
          audio: q.audio,
          choices,
          answerIndex: Math.max(0, choices.indexOf(correct)),
        }
      }),
    [],
  )

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [results, setResults] = useState<{ skill: Skill; correct: boolean }[]>([])

  const q = questions[index]
  const answered = selected !== null
  const progressPct = Math.round(((index + (answered ? 1 : 0)) / questions.length) * 100)

  function choose(ci: number) {
    if (answered) return
    setSelected(ci)
    setResults((prev) => [...prev, { skill: q.skill, correct: ci === q.answerIndex }])
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setSelected(null)
    } else {
      onComplete(computeScore(results))
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-500">
          <span>
            ข้อ {index + 1} / {questions.length}
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

      <Card className="flex flex-1 flex-col">
        <p className="text-sm font-medium text-brand">{q.instructionTh}</p>
        <div className="mt-3 flex items-center gap-3">
          <p className="text-2xl font-bold text-slate-800">{q.prompt}</p>
          {q.audio && (
            <button
              type="button"
              onClick={() => speak(q.audio as string)}
              aria-label="ฟังเสียง"
              className="ml-auto shrink-0 rounded-full bg-brand-light px-3 py-2 text-lg text-brand active:scale-90 animate-pulse-glow"
            >
              🔊
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {q.choices.map((c, ci) => {
            const isAnswer = ci === q.answerIndex
            const isSelected = ci === selected
            let cls =
              'flex w-full items-center justify-between gap-2 rounded-xl border-2 p-4 text-left transition'
            if (!answered) {
              cls += ' border-slate-200 bg-white active:scale-[0.98] hover:border-brand'
            } else if (isAnswer) {
              cls += ' border-success bg-success-light text-success animate-pop-in'
            } else if (isSelected) {
              cls += ' border-danger bg-danger-light text-danger animate-shake'
            } else {
              cls += ' border-slate-200 bg-white opacity-50'
            }
            return (
              <button
                key={ci}
                type="button"
                disabled={answered}
                onClick={() => choose(ci)}
                className={cls}
              >
                <span className="text-base font-medium">{c}</span>
                {answered && isAnswer && <span className="text-lg">✓</span>}
                {answered && isSelected && !isAnswer && <span className="text-lg">✗</span>}
              </button>
            )
          })}
        </div>
      </Card>

      <div className="mt-4">
        <Button
          variant={answered ? 'success' : 'ghost'}
          disabled={!answered}
          onClick={next}
          className="w-full"
        >
          {index + 1 < questions.length ? 'ข้อถัดไป' : 'ดูผลวัดระดับ'}
        </Button>
      </div>
    </div>
  )
}
