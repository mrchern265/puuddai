import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getLesson, completeLesson, saveQuizAttempt } from '../lib/data'
import { shuffleQuiz } from '../lib/shuffle'
import type { Lesson } from '../types'
import { Button, Card, HeartBar, LoadingScreen, PhoneFrame } from '../components/ui'

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}

const STEP_LABELS = ['ฟังและเรียน', 'คำศัพท์', 'ตัวอย่างประโยค', 'แบบทดสอบ'] as const

function SpeakerButton({ text, className = '' }: { text: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label="เล่นเสียงภาษาอังกฤษ"
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-light text-brand transition active:scale-95 ${className}`}
    >
      🔊
    </button>
  )
}

export default function LessonPlayerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [step, setStep] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [submitting, setSubmitting] = useState(false)

  // game state
  const [lives, setLives] = useState(3)
  const [points, setPoints] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [floater, setFloater] = useState<{ key: number; text: string } | null>(null)

  // shuffle choices once per lesson so the correct answer isn't in a fixed slot
  const quiz = useMemo(
    () => (lesson ? shuffleQuiz(lesson.content_json.quiz) : []),
    [lesson],
  )

  useEffect(() => {
    let active = true
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    getLesson(id)
      .then((l) => {
        if (!active) return
        if (!l) {
          setNotFound(true)
        } else {
          setLesson(l)
          setAnswers(Array(l.content_json.quiz.length).fill(null))
        }
      })
      .catch((e) => {
        if (!active) return
        console.error('getLesson failed', e)
        setNotFound(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading || authLoading) {
    return <LoadingScreen text="กำลังโหลดบทเรียน..." />
  }

  if (notFound || !lesson) {
    return (
      <PhoneFrame>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-5xl">🔍</div>
          <p className="text-lg font-semibold text-slate-700">ไม่พบบทเรียน</p>
          <p className="text-sm text-slate-500">บทเรียนนี้อาจถูกลบหรือลิงก์ไม่ถูกต้อง</p>
          <Button variant="primary" onClick={() => navigate('/home')}>
            กลับหน้าหลัก
          </Button>
        </div>
      </PhoneFrame>
    )
  }

  const content = lesson.content_json
  const hasQuiz = quiz.length > 0

  const selected = hasQuiz ? answers[quizIndex] ?? null : null
  const answered = step === 3 ? (!hasQuiz || selected !== null) : true
  const current = hasQuiz ? quiz[quizIndex] : null

  function selectAnswer(ci: number) {
    if (!current) return
    if (answers[quizIndex] !== null && answers[quizIndex] !== undefined) return
    setAnswers((prev) => {
      const copy = [...prev]
      copy[quizIndex] = ci
      return copy
    })
    if (ci === current.answerIndex) {
      const gain = 10 + combo * 5
      setPoints((p) => p + gain)
      setCombo((c) => {
        const nc = c + 1
        setMaxCombo((m) => Math.max(m, nc))
        return nc
      })
      setFloater({ key: Date.now(), text: `+${gain}${combo >= 1 ? ` 🔥x${combo + 1}` : ''}` })
    } else {
      setLives((l) => Math.max(0, l - 1))
      setCombo(0)
      setFloater({ key: Date.now(), text: '💔' })
    }
  }

  async function finish() {
    if (!lesson) return
    setSubmitting(true)
    const total = quiz.length
    const correct = quiz.reduce(
      (acc, q, i) => acc + (answers[i] === q.answerIndex ? 1 : 0),
      0,
    )
    const score = total > 0 ? Math.round((correct / total) * 100) : 100
    const wrong = total - correct
    const stars = wrong === 0 ? 3 : score >= 60 ? 2 : 1
    if (user) {
      try {
        await completeLesson(user.id, lesson.id, score)
        await saveQuizAttempt(user.id, lesson.unit_id, lesson.id, quiz, answers, score)
      } catch (e) {
        console.error('finish lesson failed', e)
      }
    }
    navigate(`/lesson/${lesson.id}/complete`, {
      state: { score, correct, total, points, maxCombo, lives, stars },
    })
  }

  function goPrev() {
    if (step < 3) {
      if (step > 0) setStep(step - 1)
      return
    }
    if (quizIndex > 0) setQuizIndex(quizIndex - 1)
    else setStep(2)
  }

  function goNext() {
    if (step < 3) {
      const next = step + 1
      setStep(next)
      if (next === 3) setQuizIndex(0)
      return
    }
    if (quizIndex < quiz.length - 1) setQuizIndex(quizIndex + 1)
    else void finish()
  }

  function goStep(i: number) {
    setStep(i)
    if (i === 3) setQuizIndex(0)
  }

  const prevVisible = step > 0
  const nextDisabled = (step === 3 && !answered) || submitting
  const nextLabel =
    step < 3 ? 'ถัดไป' : quizIndex === quiz.length - 1 ? 'ดูผลลัพธ์' : 'ข้อถัดไป'

  return (
    <PhoneFrame>
      <header className="hero-gradient rounded-b-3xl px-5 pb-6 pt-6 text-white">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/home')}
            aria-label="ปิดบทเรียน"
            className="text-2xl leading-none opacity-90 transition active:scale-90"
          >
            ✕
          </button>
          {step === 3 && hasQuiz ? (
            <HeartBar lives={lives} />
          ) : (
            <span className="text-sm font-medium opacity-90">{STEP_LABELS[step]}</span>
          )}
          <span className="text-sm opacity-80">{step + 1}/4</span>
        </div>
        <h1 className="mt-3 text-xl font-bold">{lesson.title_th}</h1>
        <div className="mt-3 flex gap-1.5">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => goStep(i)}
              className={`flex-1 rounded-full px-1 py-1.5 text-[11px] font-semibold transition active:scale-95 ${
                i === step ? 'bg-white text-brand' : 'bg-white/20 text-white/90'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-white/70">แตะเลือกช่วงที่อยากฝึกได้เลย</p>
      </header>

      <main className="relative flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {/* floating points / heart feedback */}
        {floater && (
          <div
            key={floater.key}
            className="animate-float-up pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 text-2xl font-extrabold text-accent drop-shadow"
          >
            {floater.text}
          </div>
        )}

        {step === 0 && (
          <Card className="text-center animate-slide-up">
            <p className="text-2xl font-bold leading-snug text-brand">
              {content.listen.audioText}
            </p>
            <button
              type="button"
              onClick={() => speak(content.listen.audioText)}
              className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-3xl text-white shadow-lg transition active:scale-95 animate-pulse-glow"
              aria-label="เล่นเสียง"
            >
              🔊
            </button>
            <p className="mt-5 text-slate-600">{content.listen.thaiExplain}</p>
          </Card>
        )}

        {step === 1 &&
          (content.vocab.length === 0 ? (
            <Card>
              <p className="text-center text-slate-500">ยังไม่มีคำศัพท์ในบทเรียนนี้</p>
            </Card>
          ) : (
            content.vocab.map((v, i) => (
              <Card key={`${v.word}-${i}`} className="animate-slide-up" >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-lg font-bold text-slate-800">{v.word}</span>
                    <span className="ml-2 text-sm text-gray-500">{v.ipa}</span>
                  </div>
                  <SpeakerButton text={v.word} className="h-10 w-10 text-lg" />
                </div>
                <p className="mt-1 font-semibold text-brand">{v.thai}</p>
                <p className="mt-3 text-slate-800">{v.exampleEn}</p>
                <p className="text-sm text-slate-500">{v.exampleTh}</p>
                {v.associationHintTh && (
                  <div className="mt-3 rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">
                    💡 {v.associationHintTh}
                  </div>
                )}
              </Card>
            ))
          ))}

        {step === 2 &&
          (content.examples.length === 0 ? (
            <Card>
              <p className="text-center text-slate-500">ยังไม่มีตัวอย่างประโยค</p>
            </Card>
          ) : (
            content.examples.map((ex, i) => (
              <Card key={`${ex.en}-${i}`} className="animate-slide-up">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-slate-800">{ex.en}</p>
                  <SpeakerButton text={ex.en} className="h-10 w-10 text-lg" />
                </div>
                <p className="mt-1 text-sm text-slate-500">{ex.th}</p>
              </Card>
            ))
          ))}

        {step === 3 &&
          (!hasQuiz || !current ? (
            <Card>
              <p className="text-center text-slate-500">บทเรียนนี้ไม่มีแบบทดสอบ</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                <span>
                  ข้อ {quizIndex + 1} จาก {quiz.length}
                </span>
                {combo >= 2 && <span className="font-bold text-accent">🔥 คอมโบ x{combo}</span>}
              </div>
              <Card>
                <p className="text-lg font-semibold text-slate-800">{current.questionTh}</p>
                <div className="mt-4 space-y-3">
                  {current.choices.map((choice, ci) => {
                    const isAnswer = ci === current.answerIndex
                    const isSelected = ci === selected
                    let cls =
                      'flex w-full items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left transition'
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
                        onClick={() => selectAnswer(ci)}
                        className={cls}
                      >
                        <span className="font-medium">{choice}</span>
                        {answered && isAnswer && <span className="text-lg">✓</span>}
                        {answered && isSelected && !isAnswer && <span className="text-lg">✗</span>}
                      </button>
                    )
                  })}
                </div>
              </Card>

              {answered && (
                <div
                  className={`animate-slide-up rounded-2xl p-4 ${
                    selected === current.answerIndex
                      ? 'bg-success-light'
                      : 'bg-danger-light'
                  }`}
                >
                  <p
                    className={`text-sm font-bold ${
                      selected === current.answerIndex ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {selected === current.answerIndex ? '🎉 ถูกต้อง!' : '💡 คำตอบที่ถูกคือ'}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{current.explainTh}</p>
                </div>
              )}
            </div>
          ))}
      </main>

      <footer className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
        {prevVisible ? (
          <Button variant="ghost" onClick={goPrev} className="flex-1">
            ก่อนหน้า
          </Button>
        ) : (
          <div className="flex-1" />
        )}
        <Button
          variant={step === 3 && answered ? 'success' : 'accent'}
          onClick={goNext}
          disabled={nextDisabled}
          className="flex-1"
        >
          {submitting ? 'กำลังบันทึก...' : nextLabel}
        </Button>
      </footer>
    </PhoneFrame>
  )
}
