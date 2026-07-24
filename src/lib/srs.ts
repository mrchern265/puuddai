// Spaced-repetition (Leitner-style) scheduling, stored in localStorage so it
// works with no backend. Words you get right move up a box and come back later;
// words you miss drop to box 1 and return soon.

export interface SrsCard {
  box: number // 1..5
  dueAt: number // epoch ms — review when now >= dueAt
  seen: boolean
}

type Store = Record<string, SrsCard>

const KEY = 'puuddai-srs'
const DAY = 86_400_000
// Interval before a card is due again, indexed by box (1..5).
const INTERVALS = [0, 0, DAY, 3 * DAY, 7 * DAY, 14 * DAY]

function load(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Store
  } catch {
    return {}
  }
}

function save(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* storage unavailable — reviews just won't persist */
  }
}

export function getStates(): Store {
  return load()
}

// Record a review. `remembered` = the learner recalled it correctly.
export function reviewCard(id: string, remembered: boolean): void {
  const store = load()
  const cur = store[id] ?? { box: 1, dueAt: 0, seen: false }
  const box = remembered ? Math.min((cur.box || 1) + 1, 5) : 1
  store[id] = { box, dueAt: Date.now() + INTERVALS[box], seen: true }
  save(store)
}

// Build a study session: cards that are due first, then a few brand-new words.
export function buildQueue<T extends { id: string }>(
  words: T[],
  newLimit = 10,
  cap = 20,
): T[] {
  const store = load()
  const now = Date.now()
  const due = words.filter((w) => store[w.id]?.seen && store[w.id].dueAt <= now)
  const fresh = words.filter((w) => !store[w.id]?.seen).slice(0, newLimit)
  return [...due, ...fresh].slice(0, cap)
}

// How many cards are ready to study right now (due reviews + unseen words).
export function dueCount<T extends { id: string }>(words: T[]): number {
  const store = load()
  const now = Date.now()
  let n = 0
  for (const w of words) {
    const s = store[w.id]
    if (!s?.seen) n++
    else if (s.dueAt <= now) n++
  }
  return n
}

// How many words the learner has started learning (box >= 2 = recalled at least once).
export function learnedCount<T extends { id: string }>(words: T[]): number {
  const store = load()
  return words.filter((w) => (store[w.id]?.box ?? 0) >= 2).length
}
