import { supabase } from './supabase'
import type {
  Unit,
  Lesson,
  Scenario,
  UserLessonProgress,
  Profile,
  SkillProfile,
  ChatMessage,
  ScoreResult,
  VocabItem,
} from '../types'

export interface VocabWithSource extends VocabItem {
  lessonId: string
  lessonTitleTh: string
}

export async function getUnits(): Promise<Unit[]> {
  const { data, error } = await supabase.from('units').select('*').order('order_index')
  if (error) throw error
  return (data ?? []) as Unit[]
}

export async function getAllLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase.from('lessons').select('*').order('order_index')
  if (error) throw error
  return (data ?? []) as Lesson[]
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const { data, error } = await supabase.from('lessons').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data as Lesson | null
}

export async function getScenarioByUnit(unitId: string): Promise<Scenario | null> {
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('unit_id', unitId)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as Scenario | null
}

export async function getMyProgress(userId: string): Promise<UserLessonProgress[]> {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as UserLessonProgress[]
}

export async function completeLesson(userId: string, lessonId: string, score: number) {
  const { error } = await supabase.from('user_lesson_progress').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      status: 'completed',
      score,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' },
  )
  if (error) throw error
}

export async function saveQuizAttempt(
  userId: string,
  unitId: string,
  lessonId: string,
  questions: unknown,
  answers: unknown,
  score: number,
) {
  const { error } = await supabase.from('quiz_attempts').insert({
    user_id: userId,
    unit_id: unitId,
    lesson_id: lessonId,
    questions_json: questions,
    answers_json: answers,
    score,
  })
  if (error) throw error
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export async function setCefrLevel(userId: string, level: string) {
  const { error } = await supabase.from('profiles').update({ cefr_level: level }).eq('id', userId)
  if (error) throw error
}

export async function getSkillProfile(userId: string): Promise<SkillProfile | null> {
  const { data, error } = await supabase
    .from('user_skill_profile')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data as SkillProfile | null
}

type TutorResponse = {
  reply?: string
  thai?: string
  hint?: string
} & Partial<ScoreResult>

// Calls the Supabase Edge Function `ai-tutor` (Gemini). Deployed separately.
export async function callTutor(
  mode: 'chat' | 'hint' | 'score',
  messages: ChatMessage[],
  systemInstruction: string,
): Promise<TutorResponse> {
  const { data, error } = await supabase.functions.invoke('ai-tutor', {
    body: {
      mode,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      systemInstruction,
    },
  })
  if (error) throw error
  return data as TutorResponse
}

export async function saveConversationSession(
  userId: string,
  scenarioId: string,
  transcript: ChatMessage[],
  feedback: ScoreResult,
  passed: boolean,
) {
  const { error } = await supabase.from('conversation_sessions').insert({
    user_id: userId,
    scenario_id: scenarioId,
    transcript_json: transcript,
    ai_feedback_json: feedback,
    passed,
  })
  if (error) throw error
}

// Flattens every vocab item out of all lessons' content_json (vocab lives inside lessons).
export async function getAllVocab(): Promise<VocabWithSource[]> {
  const lessons = await getAllLessons()
  return lessons.flatMap((l) =>
    (l.content_json?.vocab ?? []).map((v) => ({
      ...v,
      lessonId: l.id,
      lessonTitleTh: l.title_th,
    })),
  )
}
