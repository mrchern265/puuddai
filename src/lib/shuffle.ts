// Deterministic-per-call choice shuffling so the correct answer never sits in a
// fixed slot. Fixes the "answer is always A" bias in the seeded content and any
// future content, at the display layer.

export interface ShuffledQuestion {
  questionTh: string
  choices: string[]
  answerIndex: number
  explainTh: string
}

interface QuizLike {
  questionTh: string
  choices: string[]
  answerIndex: number
  explainTh: string
}

function fisherYates<T>(input: T[]): T[] {
  const arr = input.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Shuffle one question's choices and return the new index of the correct answer.
export function shuffleQuestion(q: QuizLike): ShuffledQuestion {
  const correct = q.choices[q.answerIndex]
  const choices = fisherYates(q.choices)
  const answerIndex = choices.findIndex((c) => c === correct)
  return {
    questionTh: q.questionTh,
    choices,
    // fall back to the original index if the correct text somehow wasn't found
    answerIndex: answerIndex >= 0 ? answerIndex : q.answerIndex,
    explainTh: q.explainTh,
  }
}

export function shuffleQuiz(quiz: QuizLike[]): ShuffledQuestion[] {
  return quiz.map(shuffleQuestion)
}
