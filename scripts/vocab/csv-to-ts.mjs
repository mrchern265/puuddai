#!/usr/bin/env node
// Generate src/lib/vocabFallback.ts from the vocab CSVs, so the app can show the
// starter "ศัพท์เป็นชุด" content even before the Supabase tables are seeded.
//
//   node scripts/vocab/csv-to-ts.mjs
//
// Reads hamburger.csv + starter-pack.csv (same folder) and writes the TS module.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

function parseCsv(text) {
  const rows = []
  let row = [], field = '', inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false }
      else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c === '\r') { /* skip */ }
    else field += c
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((v) => v.trim() !== ''))
}

const themes = new Map()
for (const file of ['hamburger.csv', 'starter-pack.csv']) {
  const rows = parseCsv(readFileSync(join(here, file), 'utf8'))
  const header = rows.shift().map((h) => h.trim().toLowerCase())
  const col = (n) => header.indexOf(n)
  const val = (r, n) => (col(n) > -1 ? (r[col(n)] ?? '').trim() : '')
  rows.forEach((r) => {
    const slug = val(r, 'theme_slug')
    if (!slug) return
    if (!themes.has(slug)) {
      themes.set(slug, {
        slug,
        title_th: val(r, 'theme_title_th') || slug,
        hero_emoji: val(r, 'theme_emoji') || null,
        order_index: Number(val(r, 'theme_order')) || themes.size + 1,
        words: [],
      })
    }
    const word = val(r, 'word')
    if (!word) return
    const t = themes.get(slug)
    t.words.push({
      order_index: Number(val(r, 'order')) || t.words.length + 1,
      word,
      ipa: val(r, 'ipa') || null,
      thai: val(r, 'thai'),
      image_emoji: val(r, 'emoji') || null,
      hint_th: val(r, 'hint') || null,
      part_of_speech: val(r, 'pos') || null,
      example_en: val(r, 'example_en') || null,
      example_th: val(r, 'example_th') || null,
    })
  })
}

const themeList = []
const wordList = []
for (const t of themes.values()) {
  themeList.push({
    id: t.slug,
    slug: t.slug,
    order_index: t.order_index,
    title_th: t.title_th,
    title_en: null,
    hero_emoji: t.hero_emoji,
    description_th: null,
    cefr_level: 'A1',
  })
  t.words.forEach((w, i) => {
    wordList.push({
      id: `${t.slug}-${i + 1}`,
      theme_id: t.slug,
      order_index: w.order_index,
      word: w.word,
      ipa: w.ipa,
      thai: w.thai,
      image_emoji: w.image_emoji,
      image_url: null,
      hint_th: w.hint_th,
      part_of_speech: w.part_of_speech,
      example_en: w.example_en,
      example_th: w.example_th,
    })
  })
}

const out = `// AUTO-GENERATED from scripts/vocab/*.csv by csv-to-ts.mjs — do not edit by hand.
// Starter "ศัพท์เป็นชุด" content bundled with the app so it shows even before the
// Supabase vocab tables are seeded (data.ts falls back to this when the DB is empty).
import type { VocabTheme, VocabWord } from '../types'

export const FALLBACK_THEMES: VocabTheme[] = ${JSON.stringify(themeList, null, 2)}

const FALLBACK_WORDS: VocabWord[] = ${JSON.stringify(wordList, null, 2)}

export function fallbackWords(themeId: string): VocabWord[] {
  return FALLBACK_WORDS.filter((w) => w.theme_id === themeId)
}
`

const dest = join(here, '..', '..', 'src', 'lib', 'vocabFallback.ts')
writeFileSync(dest, out)
console.error(`✓ wrote src/lib/vocabFallback.ts — ${themeList.length} themes, ${wordList.length} words`)
