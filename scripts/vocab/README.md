# ศัพท์เป็นชุด (Hamburger-technique vocabulary) — content pipeline

Learn a whole themed scene of vocabulary at once (a hamburger shop, an airport…)
instead of one word at a time. Content lives in two Supabase tables — see
`supabase/migrations/0006_vocab_clusters.sql`.

This folder is the **bulk-content pipeline**: keep word lists as CSV in git, turn
them into idempotent SQL, and paste that into the Supabase SQL Editor.

## One-time setup

Run `supabase/migrations/0006_vocab_clusters.sql` once in the Supabase SQL Editor
to create `vocab_themes` and `vocab_words`.

## Workflow for each batch of words

1. **Write a CSV** — one row per word (see `hamburger.csv` for the format).
   Columns: `theme_slug, theme_title_th, theme_emoji, theme_order, word, ipa,
   thai, emoji, pos, example_en, example_th, order`.
   A file can hold many themes; rows are grouped by `theme_slug`.

2. **Generate SQL**
   ```bash
   node scripts/vocab/import-vocab.mjs scripts/vocab/hamburger.csv scripts/vocab/hamburger.seed.sql
   ```

3. **Load it** — paste the generated `.sql` into the Supabase SQL Editor and Run.
   Re-running is safe: rows upsert by `slug` / `(theme_id, word)`, so fixing a
   translation and re-importing updates in place instead of duplicating.

## Scaling to thousands of words

- Split by theme (~60–80 words each). Keep one CSV per theme (or a big combined one).
- IPA / translations / examples can be filled in bulk with AI, then reviewed.
- Images: `emoji` column works for common concrete nouns now; `image_url` is
  reserved for real illustrations added later — no schema change needed.

## Copyright

The "hamburger" method is fine to use, but do **not** copy another product's word
lists, groupings, or artwork. Author original lists and images.
