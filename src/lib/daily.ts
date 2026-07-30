// Daily goal + streak, tracked in localStorage (no backend).
// Meet the daily review goal → streak grows; miss a whole day → it resets.

export interface DailySnapshot {
  count: number // reviews done today
  goal: number // target per day
  streak: number // consecutive days the goal was met (alive = met today or yesterday)
  longest: number
  goalMet: boolean
  justHit: boolean // true only on the review that first hit today's goal
}

interface DailyState {
  date: string
  count: number
  goal: number
  streak: number
  longest: number
  lastGoalDate: string
}

const KEY = 'puuddai-daily'
const DEFAULT_GOAL = 10

function keyForOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
const todayKey = () => keyForOffset(0)

function load(): DailyState {
  const base: DailyState = {
    date: todayKey(),
    count: 0,
    goal: DEFAULT_GOAL,
    streak: 0,
    longest: 0,
    lastGoalDate: '',
  }
  try {
    return { ...base, ...(JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<DailyState>) }
  } catch {
    return base
  }
}

function save(s: DailyState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* storage unavailable */
  }
}

// Reset today's counter when the day rolls over.
function normalize(s: DailyState): DailyState {
  const t = todayKey()
  if (s.date !== t) {
    s.date = t
    s.count = 0
  }
  return s
}

// Streak is "alive" only if the goal was met today or yesterday; otherwise it's broken.
function liveStreak(s: DailyState): number {
  return s.lastGoalDate === todayKey() || s.lastGoalDate === keyForOffset(-1) ? s.streak : 0
}

function snap(s: DailyState, justHit = false): DailySnapshot {
  return {
    count: s.count,
    goal: s.goal,
    streak: liveStreak(s),
    longest: s.longest,
    goalMet: s.count >= s.goal,
    justHit,
  }
}

export function getDaily(): DailySnapshot {
  const s = normalize(load())
  save(s)
  return snap(s)
}

// Call once per review action. Returns the new snapshot (justHit flags the moment
// today's goal is first reached, so the UI can celebrate).
export function recordActivity(n = 1): DailySnapshot {
  const s = normalize(load())
  const wasMet = s.count >= s.goal
  s.count += n
  let justHit = false
  if (!wasMet && s.count >= s.goal && s.lastGoalDate !== todayKey()) {
    s.streak = s.lastGoalDate === keyForOffset(-1) ? s.streak + 1 : 1
    s.lastGoalDate = todayKey()
    s.longest = Math.max(s.longest, s.streak)
    justHit = true
  }
  save(s)
  return snap(s, justHit)
}
