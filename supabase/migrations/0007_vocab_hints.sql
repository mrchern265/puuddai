-- =============================================================================
-- Add a memory-aid hint to cluster words.
-- hint_th holds a Thai mnemonic (sound-alike / word breakdown), e.g.
--   hotel → "โฮ-เทล ออกเสียงเกือบเหมือนไทย"
-- Surfaced when the learner taps a word in the "ศัพท์เป็นชุด" board.
--
-- Run once in Supabase SQL Editor (safe to re-run).
-- =============================================================================
alter table vocab_words add column if not exists hint_th text;
