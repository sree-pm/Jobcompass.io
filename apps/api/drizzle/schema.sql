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

-- ══ JobCompass v2: global job library + company enrichment (platform agents A1–A5) ══
-- Shared library: enriched once, used by every user.
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  company_number TEXT,
  status TEXT, -- active / dissolved / liquidation
  sic_codes TEXT, -- JSON array of SIC codes
  industry TEXT, -- mapped from SIC
  website TEXT,
  careers_url TEXT,
  registered_office TEXT,
  trust_score INTEGER DEFAULT 50, -- 0-100
  enriched_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  salary TEXT,
  source TEXT,
  source_url TEXT UNIQUE,
  job_description TEXT,
  -- A4 classifier outputs
  industry TEXT,
  seniority TEXT, -- junior / mid / senior / lead / director
  contract_type TEXT, -- permanent / contract / temp / internship
  work_mode TEXT, -- hybrid / remote / onsite
  salary_band TEXT,
  uk_region TEXT,
  tags TEXT, -- JSON array
  -- A3 verifier outputs
  hiring_confidence INTEGER, -- 0-100, genuinely-hiring score
  job_verified INTEGER DEFAULT 0,
  verified_at TEXT,
  -- A5 matchmaker
  embedding_id TEXT,
  first_seen TEXT DEFAULT (datetime('now')),
  last_seen TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_region ON jobs(uk_region);
CREATE INDEX IF NOT EXISTS idx_jobs_confidence ON jobs(hiring_confidence);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- link candidate applications back to the global library
-- NOTE: SQLite forbids REFERENCES on ALTER TABLE ADD COLUMN — keep it a plain column
ALTER TABLE applications ADD COLUMN job_id TEXT;
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
