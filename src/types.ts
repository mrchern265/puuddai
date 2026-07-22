export type CefrLevel = 'A0' | 'A1' | 'A2'

export interface VocabItem {
  word: string
  ipa: string
  thai: string
  exampleEn: string
  exampleTh: string
  associationHintTh: string
}

export interface QuizQuestion {
  questionTh: string
  choices: string[]
  answerIndex: number
  explainTh: string
}

export interface LessonContent {
  listen: { audioText: string; thaiExplain: string }
  vocab: VocabItem[]
  examples: { en: string; th: string }[]
  quiz: QuizQuestion[]
}

export interface Lesson {
  id: string
  unit_id: string
  order_index: number
  type: string
  title_th: string
  content_json: LessonContent
}

export interface Unit {
  id: string
  order_index: number
  title_th: string
  description_th: string
  cefr_level: string
  milestone_badge: string
}

export interface Scenario {
  id: string
  unit_id: string
  title_th: string
  setting_en: string
  ai_role: string
  user_goal_th: string
  success_criteria_json: string[]
}

export interface UserLessonProgress {
  id: string
  user_id: string
  lesson_id: string
  status: 'locked' | 'available' | 'completed'
  score: number | null
  completed_at: string | null
}

export interface Profile {
  id: string
  display_name: string | null
  goal: string | null
  cefr_level: string
  daily_goal_minutes: number
  streak_count: number
}

export interface SkillProfile {
  user_id: string
  listening_score: number
  speaking_score: number
  vocab_score: number
  grammar_score: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  thai?: string
}

export interface ScoreResult {
  taskSuccess: boolean
  fluencyScore: number
  corrections: { wrong: string; right: string }[]
  encouragementTh: string
}

export interface VocabTheme {
  id: string
  slug: string
  order_index: number
  title_th: string
  title_en: string | null
  hero_emoji: string | null
  description_th: string | null
  cefr_level: string
}

export interface VocabWord {
  id: string
  theme_id: string
  order_index: number
  word: string
  ipa: string | null
  thai: string
  image_emoji: string | null
  image_url: string | null
  hint_th: string | null
  part_of_speech: string | null
  example_en: string | null
  example_th: string | null
}

export type AssessmentKind = 'pre' | 'post'

export interface AssessmentResult {
  id: string
  user_id: string
  kind: AssessmentKind
  total_score: number
  listening_score: number
  vocab_score: number
  grammar_score: number
  cefr_level: string
  taken_at: string
}
