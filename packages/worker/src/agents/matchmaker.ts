// A5 Matchmaker — embed verified jobs into Vectorize + match candidates to jobs.
// ─────────────────────────────────────────────────────────────────────
// embedNewJobs:
//   Batch-embed verified-but-unembedded jobs (title + company + first 800 chars
//   of the JD), upsert into Vectorize with title/company/industry/region
//   metadata, then stamp embedding_id so they are not re-embedded.
// matchJobsForCandidate:
//   Embed the candidate profile, query Vectorize for nearest neighbours.
//   Falls back to SQL scoring (hiring_confidence ≥ 60, location match first,
//   newest first) when no Vectorize binding exists. Re-ranks the top 10 with an
//   LLM (creative task) when keys are present; otherwise returns base order.
// ─────────────────────────────────────────────────────────────────────
import { workersAiEmbed, routeJson } from "../../../ai/src/index.js";

export type JobMatch = {
  jobId: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  salary: string;
  confidence: number;
  fitScore: number | null; // 0-100 once re-ranked; null until then
  reason: string;
  applyUrl: string;
};

export type MatchResult = {
  matches: JobMatch[];
  source: "vectorize" | "sql";
  reranked: boolean;
};

// ── helpers ─────────────────────────────────────────────────────────
function jobToMatch(row: any): JobMatch {
  return {
    jobId: row.id,
    title: row.title || "",
    company: row.company_name || "",
    location: row.location || "",
    industry: row.industry || "",
    salary: row.salary || "",
    confidence: Number(row.hiring_confidence ?? 0),
    fitScore: null,
    reason: "",
    applyUrl: row.source_url || "",
  };
}

function hasLlmKeys(env: any): boolean {
  return !!(
    env.OPENAI_API_KEY ||
    env.ANTHROPIC_API_KEY ||
    env.DEEPSEEK_API_KEY ||
    env.AI_API_KEY ||
    env.AI ||          // Workers AI binding
    env.ACCOUNT_ID     // Workers AI REST fallback
  );
}

function clampScore(n: any): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

// ── embedNewJobs ────────────────────────────────────────────────────
export async function embedNewJobs(db: D1Database, env: any): Promise<number> {
  const { results } = await db
    .prepare(
      "SELECT id, title, company_name, job_description, industry, uk_region " +
        "FROM jobs WHERE embedding_id IS NULL AND job_verified = 1 LIMIT 50"
    )
    .all();
  const rows = results as any[];
  if (!rows.length) return 0;

  // text = title + " at " + company + first 800 chars of the description
  const texts = rows.map(
    r => `${r.title} at ${r.company_name} ${(r.job_description || "").slice(0, 800)}`
  );

  let vectors: number[][];
  try {
    vectors = await workersAiEmbed(texts, env);
  } catch (e: any) {
    console.error("embedNewJobs: embedding failed:", e?.message);
    return 0; // leave embedding_id NULL so the next run retries
  }
  if (!vectors.length) return 0;

  const n = Math.min(vectors.length, rows.length);

  if (env.VECTORIZE) {
    const upserts = [];
    for (let i = 0; i < n; i++) {
      upserts.push({
        id: rows[i].id,
        values: vectors[i],
        metadata: {
          title: rows[i].title || "",
          company: rows[i].company_name || "",
          industry: rows[i].industry || "",
          region: rows[i].uk_region || "",
        },
      });
    }
    try {
      await env.VECTORIZE.upsert(upserts);
    } catch (e: any) {
      console.error("embedNewJobs: vectorize upsert failed:", e?.message);
      return 0; // do not stamp embedding_id — retry next run
    }
  }

  // Stamp embedding_id for every successfully embedded job.
  for (let i = 0; i < n; i++) {
    await db
      .prepare("UPDATE jobs SET embedding_id = ? WHERE id = ?")
      .bind(rows[i].id, rows[i].id)
      .run();
  }
  return n;
}

// ── matchJobsForCandidate ───────────────────────────────────────────
export async function matchJobsForCandidate(
  db: D1Database,
  candidateId: string,
  env: any
): Promise<MatchResult> {
  const candidate: any = await db
    .prepare("SELECT * FROM candidates WHERE id = ?")
    .bind(candidateId)
    .first();
  if (!candidate) return { matches: [], source: "sql", reranked: false };

  // Build a short profile string from the candidate's targeting fields.
  const salaryRange =
    candidate.salary_min != null && candidate.salary_max != null
      ? `£${Number(candidate.salary_min).toLocaleString("en-GB")}–£${Number(candidate.salary_max).toLocaleString("en-GB")}`
      : "";
  const profileText = [candidate.target_role, candidate.industry, candidate.location, salaryRange]
    .filter(Boolean)
    .join(", ");

  let matches: JobMatch[] = [];
  let source: "vectorize" | "sql" = "sql";

  // ── Vector path ───────────────────────────────────────────────────
  if (env.VECTORIZE) {
    try {
      const [vec] = await workersAiEmbed([profileText], env);
      if (vec) {
        const res: any = await env.VECTORIZE.query(vec, { topK: 30, returnMetadata: true });
        const hits: any[] = res?.matches || [];
        const ids = hits.map((m: any) => m.id).filter(Boolean);
        if (ids.length) {
          const placeholders = ids.map(() => "?").join(",");
          const { results } = await db
            .prepare(`SELECT * FROM jobs WHERE id IN (${placeholders})`)
            .bind(...ids)
            .all();
          const byId = new Map((results as any[]).map((r: any) => [r.id, r]));
          matches = hits
            .filter((m: any) => byId.has(m.id))
            .map((m: any) => jobToMatch(byId.get(m.id)));
          source = "vectorize";
        }
      }
    } catch (e: any) {
      console.error("matchJobsForCandidate: vectorize path failed, falling back to SQL:", e?.message);
      matches = [];
    }
  }

  // ── SQL fallback path ─────────────────────────────────────────────
  if (!matches.length) {
    source = "sql";
    const loc = `%${candidate.location || ""}%`;
    const { results } = await db
      .prepare(
        "SELECT * FROM jobs WHERE hiring_confidence >= 60 " +
          "ORDER BY (CASE WHEN location LIKE ? THEN 0 ELSE 1 END), first_seen DESC LIMIT 30"
      )
      .bind(loc)
      .all();
    matches = (results as any[]).map(jobToMatch);
  }

  // ── Re-rank the top 10 with an LLM when keys are available ────────
  let reranked = false;
  if (matches.length && hasLlmKeys(env)) {
    const top = matches.slice(0, 10);
    const jobList = top
      .map(
        (m, i) =>
          `${i + 1}. [id=${m.jobId}] ${m.title} at ${m.company} — ${m.location} — ${m.industry || "n/a"} — ${m.salary || "salary n/a"}`
      )
      .join("\n");
    try {
      const ranked = await routeJson<{ jobId: string; score: number; reason: string }[]>(
        "creative",
        [
          {
            role: "user",
            content:
              `Candidate profile: ${profileText || "not specified"}.\n\n` +
              `Rank these jobs for the candidate by fit. Return a JSON array of objects ` +
              `{"jobId","score","reason"} where score is an integer 0-100 fit score and ` +
              `reason is one short sentence.\n\nJobs:\n${jobList}`,
          },
        ],
        env,
        []
      );
      if (Array.isArray(ranked) && ranked.length) {
        const scoreMap = new Map(ranked.map((r: any) => [r.jobId, r]));
        for (const m of top) {
          const r: any = scoreMap.get(m.jobId);
          if (r) {
            m.fitScore = clampScore(r.score);
            m.reason = typeof r.reason === "string" ? r.reason : "";
          }
        }
        const rest = matches.slice(10);
        const sortedTop = [...top].sort((a, b) => (b.fitScore ?? -1) - (a.fitScore ?? -1));
        matches = [...sortedTop, ...rest];
        reranked = true;
      }
    } catch (e: any) {
      console.error("matchJobsForCandidate: re-rank failed, keeping base order:", e?.message);
    }
  }

  return { matches, source, reranked };
}
