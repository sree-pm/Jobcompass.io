// Platform pipeline — orchestrates A1→A4 on the SHARED jobs library.
// ─────────────────────────────────────────────────────────────────────
// (a) fetch jobs from configured free ATS providers (Greenhouse/Lever/Ashby)
// (b) dedupe by normalised URL (in-batch + against the jobs table)
// (c) INSERT new rows into jobs
// (d) ensure company rows exist (INSERT OR IGNORE companies)
// (e) enrich each unique company (cached internally) + link jobs.company_id
// (f) classify new jobs (A4)
// (g) verify each new job (A3)
// (h) return { found, inserted, classified, verified }
// Never throws — each provider is isolated in try/catch; top-level guard
// catches everything else.
// ─────────────────────────────────────────────────────────────────────
import { searchGreenhouse } from "./providers/greenhouse.js";
import { searchLever } from "./providers/lever.js";
import { searchAshby } from "./providers/ashby.js";
import { normaliseUrl, type JobLike } from "./providers/ats-common.js";
import { enrichCompany } from "./enrichers/company-enricher.js";
import { classifyJobs } from "./agents/job-classifier.js";
import { verifyJob } from "./agents/career-verifier.js";

export type PipelineSummary = {
  found: number;
  inserted: number;
  classified: number;
  verified: number;
  errors: string[];
};

type TaggedJob = JobLike & { source: string };

function splitCsv(v: string | undefined): string[] {
  return (v || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

export async function runPlatformPipeline(
  env: any,
  opts?: { candidateId?: string }
): Promise<PipelineSummary> {
  const summary: PipelineSummary = { found: 0, inserted: 0, classified: 0, verified: 0, errors: [] };
  try {
    const db: D1Database = env.DB;
    if (!db) {
      summary.errors.push("env.DB missing — cannot run pipeline");
      return summary;
    }

    // ── (a) fetch from configured providers ─────────────────────────
    const all: TaggedJob[] = [];

    // Greenhouse — comma-separated board tokens, optional "token:CompanyName"
    const boards = splitCsv(env.GREENHOUSE_BOARDS);
    if (boards.length) {
      const settled = await Promise.allSettled(
        boards.map(async entry => {
          const [tok, name] = entry.split(":");
          const jobs = await searchGreenhouse({ board: tok.trim(), company: name?.trim() || undefined });
          return jobs.map(j => ({ ...j, source: "greenhouse" }));
        })
      );
      for (let i = 0; i < settled.length; i++) {
        const res = settled[i];
        if (res.status === "fulfilled") all.push(...res.value);
        else {
          console.error(`pipeline: greenhouse(${boards[i]}) failed:`, res.reason?.message);
          summary.errors.push(`greenhouse:${boards[i]}: ${res.reason?.message}`);
        }
      }
    }

    // Lever — comma-separated company slugs
    for (const company of splitCsv(env.LEVER_COMPANIES)) {
      try {
        const jobs = await searchLever({ company });
        all.push(...jobs.map(j => ({ ...j, source: "lever" })));
      } catch (e: any) {
        console.error(`pipeline: lever(${company}) failed:`, e?.message);
        summary.errors.push(`lever:${company}: ${e?.message}`);
      }
    }

    // Ashby — comma-separated org slugs
    for (const org of splitCsv(env.ASHBY_ORGS)) {
      try {
        const jobs = await searchAshby({ org });
        all.push(...jobs.map(j => ({ ...j, source: "ashby" })));
      } catch (e: any) {
        console.error(`pipeline: ashby(${org}) failed:`, e?.message);
        summary.errors.push(`ashby:${org}: ${e?.message}`);
      }
    }

    summary.found = all.length;

    // ── (b)+(c) dedupe + insert ─────────────────────────────────────
    const seenUrls = new Set<string>();
    const newJobs: any[] = []; // rows as inserted, for classify/verify steps

    for (const j of all) {
      const url = normaliseUrl(j.url || "");
      const key = url || `${j.company}:${j.title}`.toLowerCase();
      if (seenUrls.has(key)) continue; // in-batch dupe
      seenUrls.add(key);

      // DB dupe — normalised source_url already in the shared library
      try {
        const existing: any = url
          ? await db.prepare("SELECT id FROM jobs WHERE source_url = ?").bind(url).first()
          : await db.prepare("SELECT id FROM jobs WHERE company_name = ? AND title = ?").bind(j.company, j.title).first();
        if (existing) {
          await db.prepare("UPDATE jobs SET last_seen = datetime('now') WHERE id = ?").bind(existing.id).run();
          continue;
        }
      } catch (e: any) {
        console.error(`pipeline: dupe check failed for ${j.title}:`, e?.message);
        continue;
      }

      try {
        const id = crypto.randomUUID();
        await db.prepare(
          "INSERT INTO jobs (id, company_name, title, location, salary, source, source_url, job_description) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(id, j.company, j.title, j.location || "", j.salary || "", j.source, url || j.url || "", j.description || "").run();
        summary.inserted++;
        newJobs.push({
          id,
          company_name: j.company,
          title: j.title,
          location: j.location || "",
          salary: j.salary || "",
          source: j.source,
          source_url: url || j.url || "",
          job_description: j.description || "",
        });
      } catch (e: any) {
        console.error(`pipeline: insert failed for ${j.company}/${j.title}:`, e?.message);
        summary.errors.push(`insert:${j.company}/${j.title}: ${e?.message}`);
      }
    }

    if (!newJobs.length) return summary;

    // ── (d)+(e) companies: ensure row, enrich, link ─────────────────
    const uniqueCompanies = [...new Set(newJobs.map(j => j.company_name))];
    const companyIdByName = new Map<string, string>();
    for (const name of uniqueCompanies) {
      try {
        // INSERT OR IGNORE requires the PK up front — generate, reuse if it won
        const id = crypto.randomUUID();
        await db.prepare("INSERT OR IGNORE INTO companies (id, name) VALUES (?, ?)").bind(id, name).run();
        const row: any = await db.prepare("SELECT id FROM companies WHERE name = ?").bind(name).first();
        const companyId = row?.id || id;
        companyIdByName.set(name, companyId);

        // enrich (cached internally — one network pass per company)
        try {
          await enrichCompany(db, companyId, name, env);
        } catch (e: any) {
          console.error(`pipeline: enrichCompany(${name}) failed:`, e?.message);
          summary.errors.push(`enrich:${name}: ${e?.message}`);
        }
      } catch (e: any) {
        console.error(`pipeline: company row for ${name} failed:`, e?.message);
        summary.errors.push(`company:${name}: ${e?.message}`);
      }
    }

    // link jobs to their companies
    for (const j of newJobs) {
      const companyId = companyIdByName.get(j.company_name);
      if (!companyId) continue;
      try {
        await db.prepare("UPDATE jobs SET company_id = ? WHERE id = ?").bind(companyId, j.id).run();
        j.company_id = companyId;
      } catch (e: any) {
        console.error(`pipeline: link company for job ${j.id} failed:`, e?.message);
      }
    }

    // ── (f) classify new jobs (A4) ──────────────────────────────────
    try {
      const classified = await classifyJobs(db, newJobs, env);
      summary.classified = typeof classified === "number" ? classified : newJobs.length;
    } catch (e: any) {
      console.error("pipeline: classifyJobs failed:", e?.message);
      summary.errors.push(`classify: ${e?.message}`);
    }

    // ── (g) verify each new job (A3) ────────────────────────────────
    for (const j of newJobs) {
      try {
        await verifyJob(db, j, env);
        summary.verified++;
      } catch (e: any) {
        console.error(`pipeline: verifyJob(${j.id}) failed:`, e?.message);
        summary.errors.push(`verify:${j.id}: ${e?.message}`);
      }
    }

    return summary;
  } catch (e: any) {
    // Never throw out of the pipeline — log and return what we have.
    console.error("runPlatformPipeline: unexpected error:", e?.message);
    summary.errors.push(`pipeline: ${e?.message}`);
    return summary;
  }
}
