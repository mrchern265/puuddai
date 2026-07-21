-- =============================================================================
-- "ศัพท์เป็นชุด" (Hamburger-technique vocabulary clusters)
-- -----------------------------------------------------------------------------
-- Learn a whole themed scene of vocabulary at once (a hamburger shop, an
-- airport, a hospital…) instead of memorizing words one by one.
--
-- This is a NEW feature, separate from the vocab that lives inside lessons'
-- content_json — so it does not touch existing units/lessons.
--
-- Structure:
--   vocab_themes  — one row per scene/หมวด (e.g. "ร้านแฮมเบอร์เกอร์")
--   vocab_words   — the words that belong to a theme (english + ipa + thai + รูป)
--
-- Content is loaded in bulk from CSV via scripts/vocab/import-vocab.mjs, which
-- emits idempotent INSERT ... ON CONFLICT SQL you run in the Supabase SQL Editor.
--
-- Run this file once in Supabase SQL Editor to create the tables.
-- =============================================================================

-- ── themes (one per scene) ──────────────────────────────────────────────────
create table if not exists vocab_themes (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,           -- stable key used by the importer
  order_index    integer not null default 0,
  title_th       text not null,                  -- ชื่อหมวด เช่น "ร้านแฮมเบอร์เกอร์"
  title_en       text,
  hero_emoji     text,                           -- ไอคอนใหญ่ประจำหมวด เช่น 🍔
  description_th text,
  cefr_level     text not null default 'A1',
  created_at     timestamptz not null default now()
);

-- ── words (belong to a theme) ───────────────────────────────────────────────
create table if not exists vocab_words (
  id              uuid primary key default gen_random_uuid(),
  theme_id        uuid not null references vocab_themes(id) on delete cascade,
  order_index     integer not null default 0,
  word            text not null,                 -- english
  ipa             text,
  thai            text not null,                 -- คำแปล
  image_emoji     text,                          -- รูปแบบเบา (อิโมจิ) — ใช้ก่อน
  image_url       text,                          -- รูปจริง (ถ้ามี) — ใส่ทีหลังได้
  part_of_speech  text,                          -- n. / v. / adj. …
  example_en      text,
  example_th      text,
  created_at      timestamptz not null default now(),
  unique (theme_id, word)                        -- ให้ import ซ้ำแล้วอัปเดตได้
);

create index if not exists idx_vocab_words_theme
  on vocab_words (theme_id, order_index);

-- ── row-level security: อ่านได้ทุกคน (เนื้อหาเรียน), เขียนผ่าน service role/SQL ──
alter table vocab_themes enable row level security;
alter table vocab_words  enable row level security;

drop policy if exists "vocab_themes are readable" on vocab_themes;
create policy "vocab_themes are readable" on vocab_themes for select using (true);

drop policy if exists "vocab_words are readable" on vocab_words;
create policy "vocab_words are readable" on vocab_words for select using (true);
