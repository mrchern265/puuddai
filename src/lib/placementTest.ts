import type { CefrLevel } from '../types'

export type Skill = 'listening' | 'vocab' | 'grammar'

export interface PlacementQuestion {
  skill: Skill
  instructionTh: string
  prompt: string // English text shown (and spoken for listening items)
  audio?: string // when set, the item is a listening task — the learner taps to hear `audio`
  choices: string[]
  answerIndex: number
}

export interface PlacementScore {
  total: number // 0-100
  listening: number
  vocab: number
  grammar: number
  cefr: CefrLevel
  correct: number
  totalQuestions: number
}

export const SKILL_LABEL_TH: Record<Skill, { label: string; emoji: string }> = {
  listening: { label: 'การฟัง', emoji: '👂' },
  vocab: { label: 'คำศัพท์', emoji: '📚' },
  grammar: { label: 'ไวยากรณ์', emoji: '✍️' },
}

// 20-question placement test spanning listening, vocab, and grammar.
export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    skill: 'listening',
    instructionTh: 'กดฟังเสียง แล้วเลือกความหมาย',
    prompt: 'Good morning',
    audio: 'Good morning',
    choices: ['สวัสดีตอนเช้า', 'ราตรีสวัสดิ์', 'ลาก่อน', 'ขอบคุณ'],
    answerIndex: 0,
  },
  {
    skill: 'listening',
    instructionTh: 'กดฟังเสียง แล้วเลือกความหมาย',
    prompt: 'How much is it?',
    audio: 'How much is it?',
    choices: ['กี่โมงแล้ว', 'ราคาเท่าไร', 'คุณชื่ออะไร', 'ห้องน้ำอยู่ไหน'],
    answerIndex: 1,
  },
  {
    skill: 'listening',
    instructionTh: 'กดฟังเสียง แล้วเลือกความหมาย',
    prompt: 'Turn left',
    audio: 'Turn left',
    choices: ['เลี้ยวขวา', 'ตรงไป', 'เลี้ยวซ้าย', 'หยุด'],
    answerIndex: 2,
  },
  {
    skill: 'vocab',
    instructionTh: "เลือกความหมายของคำว่า 'water'",
    prompt: 'water',
    choices: ['ไฟ', 'ข้าว', 'นม', 'น้ำ'],
    answerIndex: 3,
  },
  {
    skill: 'vocab',
    instructionTh: "เลือกความหมายของคำว่า 'airport'",
    prompt: 'airport',
    choices: ['สนามบิน', 'สถานีรถไฟ', 'โรงแรม', 'โรงพยาบาล'],
    answerIndex: 0,
  },
  {
    skill: 'vocab',
    instructionTh: "'หนังสือเดินทาง' ภาษาอังกฤษคือคำไหน",
    prompt: 'หนังสือเดินทาง',
    choices: ['ticket', 'passport', 'visa', 'luggage'],
    answerIndex: 1,
  },
  {
    skill: 'vocab',
    instructionTh: "เลือกความหมายของคำว่า 'expensive'",
    prompt: 'expensive',
    choices: ['ถูก', 'ใหญ่', 'แพง', 'เล็ก'],
    answerIndex: 2,
  },
  {
    skill: 'grammar',
    instructionTh: 'เติมคำในช่องว่างให้ถูกต้อง',
    prompt: 'I ____ a student.',
    choices: ['am', 'is', 'are', 'be'],
    answerIndex: 0,
  },
  {
    skill: 'grammar',
    instructionTh: 'เติมคำในช่องว่างให้ถูกต้อง',
    prompt: 'She ____ to work every day.',
    choices: ['go', 'goes', 'going', 'gone'],
    answerIndex: 1,
  },
  {
    skill: 'grammar',
    instructionTh: 'เลือกประโยคที่ถูกต้องตามหลักไวยากรณ์',
    prompt: 'Which sentence is correct?',
    choices: [
      'He not like it.',
      "He doesn't like it.",
      "He don't like it.",
      'He no like it.',
    ],
    answerIndex: 1,
  },
  // ── listening (3 more) ──
  {
    skill: 'listening',
    instructionTh: 'กดฟังเสียง แล้วเลือกความหมาย',
    prompt: 'Thank you very much',
    audio: 'Thank you very much',
    choices: ['ขอโทษมาก', 'ขอบคุณมาก', 'ยินดีมาก', 'เสียใจมาก'],
    answerIndex: 1,
  },
  {
    skill: 'listening',
    instructionTh: 'กดฟังเสียง แล้วเลือกความหมาย',
    prompt: 'Where is the bathroom?',
    audio: 'Where is the bathroom?',
    choices: ['ห้องน้ำอยู่ที่ไหน', 'ห้องพักอยู่ที่ไหน', 'กี่โมงแล้ว', 'ราคาเท่าไร'],
    answerIndex: 0,
  },
  {
    skill: 'listening',
    instructionTh: 'กดฟังเสียง แล้วเลือกความหมาย',
    prompt: 'See you tomorrow',
    audio: 'See you tomorrow',
    choices: ['เจอกันเมื่อวาน', 'เจอกันวันนี้', 'เจอกันพรุ่งนี้', 'ยินดีที่ได้รู้จัก'],
    answerIndex: 2,
  },
  // ── vocab (3 more) ──
  {
    skill: 'vocab',
    instructionTh: "เลือกความหมายของคำว่า 'hospital'",
    prompt: 'hospital',
    choices: ['โรงเรียน', 'โรงพยาบาล', 'ธนาคาร', 'ตลาด'],
    answerIndex: 1,
  },
  {
    skill: 'vocab',
    instructionTh: "เลือกความหมายของคำว่า 'hungry'",
    prompt: 'hungry',
    choices: ['ง่วง', 'เหนื่อย', 'หิว', 'หนาว'],
    answerIndex: 2,
  },
  {
    skill: 'vocab',
    instructionTh: "'ซื้อ' ภาษาอังกฤษคือคำไหน",
    prompt: 'ซื้อ',
    choices: ['sell', 'buy', 'pay', 'give'],
    answerIndex: 1,
  },
  // ── grammar (4 more) ──
  {
    skill: 'grammar',
    instructionTh: 'เติมคำในช่องว่างให้ถูกต้อง',
    prompt: 'They ____ playing football.',
    choices: ['is', 'am', 'are', 'be'],
    answerIndex: 2,
  },
  {
    skill: 'grammar',
    instructionTh: 'เติมคำในช่องว่างให้ถูกต้อง',
    prompt: 'I have ____ apple.',
    choices: ['a', 'an', 'the', 'some'],
    answerIndex: 1,
  },
  {
    skill: 'grammar',
    instructionTh: 'เลือกประโยคที่ถูกต้อง (เหตุการณ์ในอดีต)',
    prompt: 'Which sentence is correct?',
    choices: [
      'I go to school yesterday.',
      'I goed to school yesterday.',
      'I went to school yesterday.',
      'I gone to school yesterday.',
    ],
    answerIndex: 2,
  },
  {
    skill: 'grammar',
    instructionTh: 'เติมคำในช่องว่างให้ถูกต้อง',
    prompt: 'She is taller ____ me.',
    choices: ['then', 'than', 'that', 'to'],
    answerIndex: 1,
  },
]

function pct(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0
}

function cefrFromScore(total: number): CefrLevel {
  if (total < 40) return 'A0'
  if (total <= 75) return 'A1'
  return 'A2'
}

// Compute the score from a per-question correctness list (skill + right/wrong).
export function computeScore(results: { skill: Skill; correct: boolean }[]): PlacementScore {
  const bySkill: Record<Skill, { c: number; n: number }> = {
    listening: { c: 0, n: 0 },
    vocab: { c: 0, n: 0 },
    grammar: { c: 0, n: 0 },
  }
  let correct = 0
  for (const r of results) {
    bySkill[r.skill].n += 1
    if (r.correct) {
      bySkill[r.skill].c += 1
      correct += 1
    }
  }
  const total = pct(correct, results.length)
  return {
    total,
    listening: pct(bySkill.listening.c, bySkill.listening.n),
    vocab: pct(bySkill.vocab.c, bySkill.vocab.n),
    grammar: pct(bySkill.grammar.c, bySkill.grammar.n),
    cefr: cefrFromScore(total),
    correct,
    totalQuestions: results.length,
  }
}
