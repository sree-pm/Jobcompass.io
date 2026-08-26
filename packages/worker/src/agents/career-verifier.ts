// A3 Career Page Verifier — confirms the job is live on its source page and
// scores hiring-confidence (is this company genuinely hiring?).
// Contract (used by pipeline.ts): verifyJob(db, job, env)
// Combines rule-based page signals with an optional LLM judgement (50/50 blend).
import { routeChat, extractJson } from "../../../ai/src/index.js";

export type VerificationResult = {
  confidence: number;
  signals: string[];
  stale: boolean;
};

type JobToVerify = {
  id: string;
  company_name: string;
  title: string;
  source_url?: string;
  job_description?: string;
};

const DEAD_PHRASES = [
  "no longer accepting",
  "no longer available",
  "application closed",
  "applications are closed",
  "this role has been filled",
  "position filled",
  "job expired",
  "this job has expired",
  "sorry, this job",
  "role is no longer open",
  "not accepting applications",
];

function tokensOf(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function hasAi(env: any): boolean {
  return Boolean(env?.OPENAI_API_KEY || env?.ANTHROPIC_API_KEY || env?.DEEPSEEK_API_KEY || env?.AI_API_KEY || env?.AI || env?.ACCOUNT_ID);
}

export async function verifyJob(
  db: D1Database,
  job: JobToVerify,
  env: any
): Promise<VerificationResult> {
  let score = 0;
  const signals: string[] = [];
  let stale = false;

  const titleTokens = tokensOf(job.title);
  const desc = job.job_description || "";

  // ── (a)+(b) Fetch the source page and score signals ────────────
  if (job.source_url) {
    let pageText = "";
    let fetched = false;
    try {
      const res = await fetch(job.source_url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        pageText = await res.text().catch(() => "");
        fetched = true;
      } else {
        stale = true; // 4xx/5xx → listing likely gone
      }
    } catch (e: any) {
      stale = true; // timeout / network error → treat as unverifiable/stale
    }

    if (fetched && pageText) {
      const pageLower = pageText.toLowerCase();

      // Title match: >=60% of title tokens present in page
      const matched = titleTokens.filter(t => pageLower.includes(t)).length;
      const titleRatio = titleTokens.length ? matched / titleTokens.length : 0;
      if (titleRatio >= 0.6) {
        score += 25;
        signals.push("title-present");
      }

      // Salary on page
      if (/£\s?\d{2,3}[,.]?\d{0,3}k?|\b\d{2,3}k\b/.test(pageText)) {
        score += 15;
        signals.push("salary-present");
      }

      // Company name present
      const companyTokens = tokensOf(job.company_name);
      const companyHit = companyTokens.some(t => pageLower.includes(t));
      if (companyHit) {
        score += 15;
        signals.push("company-present");
      }

      // Dead/expired phrases
      const deadHit = DEAD_PHRASES.some(p => pageLower.includes(p));
      if (deadHit) {
        score -= 40;
        stale = true;
        signals.push("dead-phrase");
      } else {
        score += 25;
        signals.push("no-dead-phrase");
      }
    } else {
      signals.push(stale ? "fetch-failed" : "no-page");
    }
  } else {
    signals.push("no-source-url");
  }

  // Description length signal (independent of page fetch)
  if (desc.length > 500) {
    score += 10;
    signals.push("rich-description");
  }

  // Clamp rule score to 0-100
  let ruleScore = Math.max(0, Math.min(100, score + 25)); // baseline so a bare job isn't 0

  // ── (c) Optional LLM judgement, blended 50/50 ──────────────────
  let confidence = ruleScore;
  if (hasAi(env)) {
    try {
      const prompt = `Rate 0-100 how likely this is a genuine, currently-active UK job listing (not a scam, not expired). Reply ONLY with JSON {"confidence": <number>, "reason": "<short text>"}.

Title: ${job.title}
Company: ${job.company_name}
Description (first 500 chars): ${desc.slice(0, 500)}`;
      const text = await routeChat("verify_job", [{ role: "user", content: prompt }], env, { maxTokens: 150, temperature: 0 });
      const parsed = extractJson<{ confidence?: number; reason?: string }>(text, {});
      if (typeof parsed?.confidence === "number") {
        const modelScore = Math.max(0, Math.min(100, parsed.confidence));
        confidence = Math.round((ruleScore + modelScore) / 2);
        signals.push("llm-blended");
      }
    } catch (e: any) {
      console.error(`verifyJob: LLM scoring failed for ${job.id}:`, e?.message);
      // keep ruleScore
    }
  }

  confidence = Math.max(0, Math.min(100, confidence));

  // ── (d) Persist ─────────────────────────────────────────────────
  try {
    await db
      .prepare(
        "UPDATE jobs SET hiring_confidence = ?, job_verified = 1, verified_at = datetime('now') WHERE id = ?"
      )
      .bind(confidence, job.id)
      .run();
  } catch (e: any) {
    console.error(`verifyJob: persist failed for ${job.id}:`, e?.message);
  }

  return { confidence, signals, stale };
}
