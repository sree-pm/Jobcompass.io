-- Run with: wrangler d1 execute agentic-cv-uk --file=./apps/api/drizzle/schema.sql
-- Or via initDb() on first request (dev)
-- ⚠️  IMPORTANT: This SQL MUST match MIGRATION_SQL in src/lib/db.ts.
-- If you edit the schema, update BOTH files.

-- candidates (one per user; auth via Cloudflare Access / API key)
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  target_role TEXT,
  industry TEXT,
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'GBP',
  notice_period TEXT,
  right_to_work TEXT,
  phone TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Master CV',
  data TEXT NOT NULL,
  is_master INTEGER DEFAULT 1,
  parent_id TEXT REFERENCES resumes(id),
  application_id TEXT,
  version INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS field_locks (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL,
  path TEXT NOT NULL,
  locked INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(candidate_id, field_id)
);

CREATE TABLE IF NOT EXISTS constraints_docs (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  did_list TEXT,
  did_not_list TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(candidate_id)
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  resume_id TEXT REFERENCES resumes(id),
  tailored_resume_id TEXT REFERENCES resumes(id),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  salary TEXT,
  source TEXT,
  source_url TEXT,
  job_description TEXT,
  status TEXT DEFAULT 'saved',
  tags TEXT,
  tailored_pdf_key TEXT,
  cover_letter_key TEXT,
  scores TEXT,
  verifier_report TEXT,
  applied_date TEXT,
  added_date TEXT DEFAULT (datetime('now')),
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id TEXT PRIMARY KEY,
  candidate_id TEXT REFERENCES candidates(id),
  source TEXT NOT NULL,
  query TEXT,
  found_count INTEGER DEFAULT 0,
  new_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ok',
  error TEXT,
  ran_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_resumes_candidate ON resumes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_field_locks_candidate ON field_locks(candidate_id);

CREATE TABLE IF NOT EXISTS credit_balances (
  candidate_id TEXT PRIMARY KEY REFERENCES candidates(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_candidate ON credit_transactions(candidate_id);
