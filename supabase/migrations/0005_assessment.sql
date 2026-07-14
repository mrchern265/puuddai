-- Placement / progress assessment results (pre-test baseline + post-test to measure improvement)
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS assessment_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind            text NOT NULL CHECK (kind IN ('pre', 'post')),
  total_score     int  NOT NULL,
  listening_score int  NOT NULL DEFAULT 0,
  vocab_score     int  NOT NULL DEFAULT 0,
  grammar_score   int  NOT NULL DEFAULT 0,
  cefr_level      text NOT NULL DEFAULT 'A0',
  taken_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assessment own read" ON assessment_results;
CREATE POLICY "assessment own read" ON assessment_results
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessment own insert" ON assessment_results;
CREATE POLICY "assessment own insert" ON assessment_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assessment_user ON assessment_results (user_id, taken_at DESC);
