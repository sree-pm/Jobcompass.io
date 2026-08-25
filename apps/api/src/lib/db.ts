// D1 schema + helpers — Cloudflare D1
// Tables: candidates, resumes, field_locks, constraints_docs, applications, ingest_runs
// ⚠️  IMPORTANT: This SQL MUST match drizzle/schema.sql — that file is used for `wrangler d1 execute` migrations.
// If you edit the schema, update BOTH files.

export const MIGRATION_SQL = `
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
  data TEXT NOT NULL, -- JSON ResumeData
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
  field_id TEXT NOT NULL, -- e.g. exp.0.bullet.2
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
  did_list TEXT, -- JSON array
  did_not_list TEXT, -- JSON array
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
  source TEXT, -- indeed, adzuna, reed, apify, manual
  source_url TEXT,
  job_description TEXT,
  status TEXT DEFAULT 'saved', -- saved, tailored, applied, awaiting_response, interview, offer, rejected
  tags TEXT, -- JSON array
  tailored_pdf_key TEXT, -- R2 key
  cover_letter_key TEXT, -- R2 key
  scores TEXT, -- JSON {ats, readability, match, confidence}
  verifier_report TEXT, -- JSON VerifyOutput
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
`;

// Typed helpers
export type Env = {
  DB: D1Database;
  PDF_BUCKET: R2Bucket;
  CACHE: KVNamespace;
  INGEST_QUEUE: Queue;
  AI_BASE_URL?: string;
  AI_API_KEY?: string;
  AI_MODEL?: string;
};

export async function initDb(db: D1Database) {
  for (const stmt of MIGRATION_SQL.split(";").map(s => s.trim()).filter(Boolean)) {
    await db.prepare(stmt).run();
  }
}

// Simple DAO wrappers
export async function getCandidate(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM candidates WHERE id = ?").bind(id).first();
}
export async function listApplications(db: D1Database, candidateId: string) {
  const { results } = await db.prepare("SELECT * FROM applications WHERE candidate_id = ? ORDER BY added_date DESC LIMIT 100").bind(candidateId).all();
  return results;
}
