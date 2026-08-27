// Job Library routes — browse the shared, enriched, verified job library (A1–A4 output)
// GET /jobs/library      — filterable browse (industry, region, work_mode, seniority, q, min_confidence)
// GET /jobs/matches      — A5 Matchmaker: personalised ranking for a candidate
// POST /jobs/refresh     — trigger platform pipeline run (manual ingest→enrich→classify→verify)
import { Hono } from "hono";
import type { Env } from "../lib/types.js";
import { matchJobsForCandidate } from "../../../../packages/worker/src/agents/matchmaker.js";
import { runPlatformPipeline } from "../../../../packages/worker/src/pipeline.js";

const app = new Hono<{ Bindings: Env }>();

// GET /jobs/library — must be BEFORE param route so Hono matches literal first
app.get("/library", async (c) => {
  const q = (c.req.query("q") || "").trim();
  const industry = c.req.query("industry");
  const region = c.req.query("region");
  const workMode = c.req.query("work_mode");
  const seniority = c.req.query("seniority");
  const minConfidence = Number(c.req.query("min_confidence") || 0);
  const limit = Math.min(Number(c.req.query("limit") || 50), 200);

  const clauses: string[] = [];
  const binds: any[] = [];
  if (industry) { clauses.push("industry = ?"); binds.push(industry); }
  if (region) { clauses.push("uk_region = ?"); binds.push(region); }
  if (workMode) { clauses.push("work_mode = ?"); binds.push(workMode); }
  if (seniority) { clauses.push("seniority = ?"); binds.push(seniority); }
  if (minConfidence > 0) { clauses.push("(hiring_confidence >= ? OR hiring_confidence IS NULL)"); binds.push(minConfidence); }
  if (q) {
    clauses.push("(title LIKE ? OR company_name LIKE ?)");
    binds.push(`%${q}%`, `%${q}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, company_name, title, location, salary, source, source_url, industry, seniority, contract_type, work_mode, salary_band, uk_region, tags, hiring_confidence, job_verified, first_seen
       FROM jobs ${where}
       ORDER BY (hiring_confidence IS NULL) ASC, hiring_confidence DESC, first_seen DESC
       LIMIT ?`
    ).bind(...binds, limit).all();
    const jobs = (results as any[]).map(j => ({ ...j, tags: j.tags ? JSON.parse(j.tags) : [] }));
    return c.json({ jobs, count: jobs.length });
  } catch (e: any) {
    return c.json({ error: "library query failed: " + e.message }, 500);
  }
});

// GET /jobs/matches?candidateId=xxx — personalised matches (A5)
app.get("/matches", async (c) => {
  const candidateId = c.req.query("candidateId");
  if (!candidateId) return c.json({ error: "candidateId required" }, 400);
  try {
    const out = await matchJobsForCandidate(c.env.DB, candidateId, c.env as any);
    return c.json(out);
  } catch (e: any) {
    return c.json({ error: "matching failed: " + e.message }, 500);
  }
});

// POST /jobs/refresh — run the platform pipeline on demand
app.post("/refresh", async (c) => {
  try {
    const summary = await runPlatformPipeline(c.env as any);
    return c.json(summary);
  } catch (e: any) {
    return c.json({ error: "pipeline failed: " + e.message }, 500);
  }
});

// GET /jobs — alias to library for marketing (public, unauth)
app.get("/", async (c) => {
  const q = (c.req.query("q") || "").trim();
  const industry = c.req.query("industry");
  const region = c.req.query("region");
  const workMode = c.req.query("work_mode");
  const seniority = c.req.query("seniority");
  const minConfidence = Number(c.req.query("min_confidence") || 0);
  const limit = Math.min(Number(c.req.query("limit") || 50), 200);
  const clauses: string[] = [];
  const binds: any[] = [];
  if (industry) { clauses.push("industry = ?"); binds.push(industry); }
  if (region) { clauses.push("uk_region = ?"); binds.push(region); }
  if (workMode) { clauses.push("work_mode = ?"); binds.push(workMode); }
  if (seniority) { clauses.push("seniority = ?"); binds.push(seniority); }
  if (minConfidence > 0) { clauses.push("(hiring_confidence >= ? OR hiring_confidence IS NULL)"); binds.push(minConfidence); }
  if (q) { clauses.push("(title LIKE ? OR company_name LIKE ?)"); binds.push(`%${q}%`, `%${q}%`); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  try {
    const { results } = await c.env.DB.prepare(`SELECT id, company_name, title, location, salary, source, source_url, industry, seniority, contract_type, work_mode, salary_band, uk_region, tags, hiring_confidence, job_verified, first_seen FROM jobs ${where} ORDER BY (hiring_confidence IS NULL) ASC, hiring_confidence DESC, first_seen DESC LIMIT ?`).bind(...binds, limit).all();
    const jobs = (results as any[]).map(j => ({ ...j, tags: j.tags ? JSON.parse(j.tags) : [] }));
    return c.json({ jobs, count: jobs.length });
  } catch (e: any) { return c.json({ error: "library query failed: " + e.message }, 500); }
});

// GET /jobs/:id — single job detail (public, SEO) — last, after literals
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const row: any = await c.env.DB.prepare("SELECT * FROM jobs WHERE id = ?").bind(id).first();
    if (!row) return c.json({ error: "job not found" }, 404);
    if (row.tags) try { row.tags = JSON.parse(row.tags); } catch {}
    return c.json(row);
  } catch (e: any) { return c.json({ error: "job fetch failed: " + e.message }, 500); }
});

export default app;
