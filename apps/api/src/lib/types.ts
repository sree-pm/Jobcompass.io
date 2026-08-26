// TypeScript interfaces for Cloudflare D1 entities, API payloads, and bindings

export interface Env {
  DB: D1Database;
  PDF_BUCKET: R2Bucket;
  CACHE: KVNamespace;
  INGEST_QUEUE: Queue;
  BROWSER?: any; // Cloudflare Browser Rendering binding — optional, enables real PDF generation via @cloudflare/puppeteer
  AI_BASE_URL: string;
  AI_API_KEY: string;
  AI_MODEL: string;
  API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  ADZUNA_APP_ID?: string;
  ADZUNA_APP_KEY?: string;
  REED_API_KEY?: string;
  JWT_SECRET?: string;
  ENVIRONMENT?: string;
  FRONTEND_URL?: string;
  // ── JobCompass platform pipeline (A1–A5) ──
  VECTORIZE?: any;              // VectorizeIndex binding — job embeddings for the Matchmaker
  AI?: any;                     // Workers AI binding — classify/verify/embed (free tier)
  EMAIL?: any;                  // Cloudflare Email Sending binding (jobcompass.io)
  ACCOUNT_ID?: string;          // Cloudflare account id (Workers AI REST fallback)
  AI_GATEWAY_URL?: string;      // AI Gateway prefix for caching/fallback/cost tracking
  OPENAI_API_KEY?: string;      // creative tasks (interview prep, cover letters)
  ANTHROPIC_API_KEY?: string;   // verifier (Claude 3.5 Haiku)
  DEEPSEEK_API_KEY?: string;    // tailor (DeepSeek V3)
  COMPANIES_HOUSE_API_KEY?: string; // FREE UK govt company data
  BRAVE_API_KEY?: string;       // website finder (2K queries/mo free)
  GREENHOUSE_BOARDS?: string;   // comma list "token:CompanyName,..."
  LEVER_COMPANIES?: string;     // comma list of Lever slugs
  ASHBY_ORGS?: string;          // comma list of Ashby org slugs
}

export interface CandidateRow {
  id: string;
  email: string;
  full_name: string;
  target_role: string | null;
  industry: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  notice_period: string | null;
  right_to_work: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConstraintDocRow {
  id: string;
  candidate_id: string;
  content: string;
  did_list: string | null; // JSON array string
  did_not_list: string | null; // JSON array string
  created_at: string;
  updated_at: string;
}

export interface ResumeRow {
  id: string;
  candidate_id: string;
  title: string;
  data: string; // JSON ResumeData string
  is_master: number; // 0 or 1
  parent_id: string | null;
  application_id: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface FieldLockRow {
  id: string;
  candidate_id: string;
  field_id: string;
  path: string;
  locked: number; // 0 or 1
  reason: string | null;
  updated_at: string;
}

export interface ApplicationRow {
  id: string;
  candidate_id: string;
  resume_id: string | null;
  tailored_resume_id: string | null;
  company: string;
  role: string;
  location: string | null;
  salary: string | null;
  source: string | null;
  source_url: string | null;
  job_description: string | null;
  status: "saved" | "tailored" | "applied" | "awaiting_response" | "interview" | "offer" | "rejected";
  tags: string | null; // JSON string array
  tailored_pdf_key: string | null;
  cover_letter_key: string | null;
  scores: string | null; // JSON scores object
  verifier_report: string | null; // JSON VerifyOutput
  applied_date: string | null;
  added_date: string;
  archived_at: string | null;
}

export interface IngestRunRow {
  id: string;
  candidate_id: string | null;
  source: string;
  query: string | null;
  found_count: number;
  new_count: number;
  status: string;
  error: string | null;
  ran_at: string;
}

export interface CreditBalanceRow {
  candidate_id: string;
  balance: number;
  updated_at: string;
}

export interface CreditTransactionRow {
  id: string;
  candidate_id: string;
  amount: number;
  type: "purchase" | "consume" | "refund" | "grant";
  description: string | null;
  reference_id: string | null;
  created_at: string;
}
