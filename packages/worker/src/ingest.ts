// Unified ingest — dedupe + insert applications + track runs
import { searchAdzuna } from "./providers/adzuna.js";
import { searchReed } from "./providers/reed.js";
import { searchApifyAts } from "./providers/apify.js";

export type IngestEnv = {
  DB: D1Database;
  ADZUNA_APP_ID?: string; ADZUNA_APP_KEY?: string;
  REED_API_KEY?: string; APIFY_TOKEN?: string;
};

export async function ingestForCandidate(
  candidateId: string,
  query: string,
  location: string,
  salaryMin: number | undefined,
  env: IngestEnv
) {
  const all: any[] = [];
  const runs: { source: string; found: number; error?: string }[] = [];

  // Adzuna
  if (env.ADZUNA_APP_ID && env.ADZUNA_APP_KEY) {
    try {
      const jobs = await searchAdzuna({ query, location, salaryMin }, env as any);
      all.push(...jobs.map(j => ({ ...j, source: "adzuna" })));
      runs.push({ source: "adzuna", found: jobs.length });
    } catch (e: any) { runs.push({ source: "adzuna", found: 0, error: e.message }); }
  }
  // Reed
  if (env.REED_API_KEY) {
    try {
      const jobs = await searchReed({ query, location }, env as any);
      all.push(...jobs.map(j => ({ ...j, source: "reed" })));
      runs.push({ source: "reed", found: jobs.length });
    } catch (e: any) { runs.push({ source: "reed", found: 0, error: e.message }); }
  }
  // Apify
  if (env.APIFY_TOKEN) {
    try {
      const jobs = await searchApifyAts({ query, location }, env as any);
      all.push(...jobs.map(j => ({ ...j, source: "apify" })));
      runs.push({ source: "apify", found: jobs.length });
    } catch (e: any) { runs.push({ source: "apify", found: 0, error: e.message }); }
  }

  function normaliseUrl(u: string): string {
    try {
      const parsed = new URL(u.trim());
      parsed.hash = "";
      parsed.searchParams.sort();
      return parsed.toString().toLowerCase().replace(/\/$/, "");
    } catch {
      return u.trim().toLowerCase().replace(/\/$/, "");
    }
  }

  // Dedupe by normalised URL
  const seen = new Set<string>();
  let inserted = 0;
  for (const j of all) {
    const normUrl = j.url ? normaliseUrl(j.url) : "";
    const key = normUrl || `${j.company}:${j.title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    // check existing — use normalised URL to avoid case/trailing-slash/param-order duplicates
    const existing: any = normUrl
      ? await env.DB.prepare("SELECT id FROM applications WHERE candidate_id = ? AND source_url = ?").bind(candidateId, normUrl).first()
      : await env.DB.prepare("SELECT id FROM applications WHERE candidate_id = ? AND company = ? AND role = ?").bind(candidateId, j.company, j.title).first();
    if (existing) continue;
    try {
      const id = crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO applications (id, candidate_id, company, role, location, salary, source, source_url, job_description, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'saved')"
      ).bind(id, candidateId, j.company, j.title, j.location || location, j.salary || "", j.source, normUrl || j.url || "", j.description || "", JSON.stringify(["UK", location])).run();
      inserted++;
    } catch (e: any) {
      console.error(`ingest insert failed for ${j.company}/${j.title}:`, e.message);
    }
  }

  // log runs
  for (const r of runs) {
    await env.DB.prepare("INSERT INTO ingest_runs (id, candidate_id, source, query, found_count, new_count, status, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), candidateId, r.source, query, r.found, inserted, r.error ? "error" : "ok", r.error || null).run();
  }

  return { found: all.length, inserted, runs };
}
