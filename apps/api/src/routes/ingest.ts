import { Hono } from "hono";
import { getAIConfig, chatComplete } from "../../../../packages/ai/src/index.js";
import { IngestSearchSchema, IngestExtractSchema } from "../lib/validation.js";

type Env = { DB: D1Database; CACHE: KVNamespace; INGEST_QUEUE: Queue; AI_BASE_URL: string; AI_API_KEY: string; AI_MODEL: string };
const app = new Hono<{ Bindings: Env }>();

// Provider adapters — OpenAI-compatible ingest extractors
// In prod these call Indeed/Adzuna/Reed/Apify MCPs; here we use AI to extract + dedupe JD, with HTTP fetch for URL ingestion.

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    // Block private/internal IPs
    const host = u.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0.0.0.0') return false;
    if (host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('172.') || host === '169.254.169.254') return false;
    if (host.endsWith('.local') || host.endsWith('.internal')) return false;
    return true;
  } catch { return false; }
}

async function fetchJobPage(url: string): Promise<string> {
  if (!isAllowedUrl(url)) return "";
  try {
    const r = await fetch(url, { headers: { "User-Agent": "AgenticCV/1.0" }, redirect: "follow" });
    if (!r.ok) return "";
    const html = await r.text();
    // crude text extraction
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 12000);
  } catch { return ""; }
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

// POST /ingest/search — trigger ingest for candidate
app.post("/search", async (c) => {
  const b = await c.req.json();
  const parsed = IngestSearchSchema.safeParse(b);
  if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  const { candidateId, query, location, sources } = parsed.data;
  // enqueue — Cloudflare Queue consumer will run actual fetches
  await c.env.INGEST_QUEUE.send({ candidateId, query, location, sources: sources || ["adzuna", "reed", "apify"] });
  return c.json({ queued: true });
});

// POST /ingest/extract — extract JD from pasted URL or text
app.post("/extract", async (c) => {
  const b = await c.req.json();
  const parsed = IngestExtractSchema.safeParse(b);
  if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  const { text: bText, url } = parsed.data;
  let text = bText || "";
  if (url && !text) text = await fetchJobPage(url);
  if (!text) return c.json({ error: "text or url required" }, 400);

  // Use AI to normalise JD
  let normalised = text;
  try {
    const ai = getAIConfig(c.env as any);
    normalised = await chatComplete([
      { role: "system", content: "Extract the job description as clean plain text. Remove navigation, cookies, footers. Keep role, company, location, salary, requirements, responsibilities." },
      { role: "user", content: text.slice(0, 10000) },
    ], ai, { maxTokens: 2500, temperature: 0.1 });
  } catch {}

  return c.json({ text: normalised, url: url || null });
});

// POST /ingest/search-live — trigger immediate live UK job search via Adzuna
app.post("/search-live", async (c) => {
  const b: any = await c.req.json();
  const candidateId = b.candidateId;
  const query = b.query || "Software Engineer";
  const location = b.location || "London";
  if (!candidateId) return c.json({ error: "candidateId required" }, 400);

  const adzunaAppId = (c.env as any).ADZUNA_APP_ID;
  const adzunaKey = (c.env as any).ADZUNA_APP_KEY;

  let liveJobs: Array<{ company: string; role: string; location: string; salary: string; source: string; sourceUrl: string; jobDescription: string }> = [];

  if (adzunaAppId && adzunaKey) {
    try {
      const searchUrl = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${adzunaAppId}&app_key=${adzunaKey}&results_per_page=10&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}&content-type=application/json`;
      const res = await fetch(searchUrl);
      if (res.ok) {
        const data: any = await res.json();
        liveJobs = (data.results || []).map((r: any) => ({
          company: r.company?.display_name || "Unknown Company",
          role: r.title || query,
          location: r.location?.display_name || location,
          salary: r.salary_min && r.salary_max
            ? `£${Math.round(r.salary_min).toLocaleString()} – £${Math.round(r.salary_max).toLocaleString()}`
            : r.salary_is_predicted === "1" ? `~£${Math.round(r.salary_min || 0).toLocaleString()} (est.)` : "Salary not listed",
          source: "adzuna",
          sourceUrl: r.redirect_url || "",
          jobDescription: r.description || "",
        }));
      }
    } catch (e: any) {
      console.error("Adzuna API error:", e.message);
    }
  }

  // Fallback demo jobs if no API keys or API failure
  if (liveJobs.length === 0) {
    liveJobs = [
      {
        company: "Demo Company Ltd",
        role: `${query} (Demo)`,
        location: location,
        salary: "Salary not listed",
        source: "demo",
        sourceUrl: "",
        jobDescription: `This is a demo listing. Configure ADZUNA_APP_ID and ADZUNA_APP_KEY secrets to search real UK jobs. Search query: ${query} in ${location}.`,
      },
    ];
  }

  let insertedCount = 0;
  const seenLive = new Set<string>();
  for (const j of liveJobs) {
    const normUrl = j.sourceUrl ? normaliseUrl(j.sourceUrl) : "";
    const dedupKey = normUrl || `${j.company}:${j.role}`.toLowerCase();
    if (seenLive.has(dedupKey)) continue;
    seenLive.add(dedupKey);
    const existing: any = normUrl
      ? await c.env.DB.prepare("SELECT id FROM applications WHERE candidate_id = ? AND source_url = ?").bind(candidateId, normUrl).first()
      : await c.env.DB.prepare("SELECT id FROM applications WHERE candidate_id = ? AND company = ? AND role = ?").bind(candidateId, j.company, j.role).first();
    if (existing) continue;
    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO applications (id, candidate_id, company, role, location, salary, source, source_url, job_description, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'saved')"
    ).bind(id, candidateId, j.company, j.role, j.location, j.salary, j.source, normUrl || j.sourceUrl, j.jobDescription, JSON.stringify(["UK", "Live"])).run();
    insertedCount++;
  }

  return c.json({ found: liveJobs.length, inserted: insertedCount, jobs: liveJobs });
});

// Admin: list recent runs
app.get("/runs", async (c) => {
  const candidateId = c.req.query("candidateId");
  const q = candidateId
    ? "SELECT * FROM ingest_runs WHERE candidate_id = ? ORDER BY ran_at DESC LIMIT 20"
    : "SELECT * FROM ingest_runs ORDER BY ran_at DESC LIMIT 20";
  const args = candidateId ? [candidateId] : [];
  const { results } = await (c.env.DB.prepare(q).bind(...args as any)).all();
  return c.json(results);
});

export default app;
