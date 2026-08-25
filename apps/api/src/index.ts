import { Hono } from "hono";
import { cors } from "hono/cors";
import { initDb } from "./lib/db.js";
import resumes from "./routes/resumes.js";
import applications from "./routes/applications.js";
import ingest from "./routes/ingest.js";
import billing from "./routes/billing.js";
import auth from "./routes/auth.js";
import { rateLimiter } from "./lib/rateLimit.js";
import { CandidateInputSchema, SaveConstraintsSchema } from "./lib/validation.js";
import type { Env, CandidateRow, ConstraintDocRow } from "./lib/types.js";
import { ingestForCandidate } from "../../../packages/worker/src/ingest.js";
import { verifyJwt } from "./routes/auth.js";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

// Auth middleware — skip health/init, accept either x-api-key OR JWT (verifyJwt)
app.use("/*", async (c, next) => {
  const path = new URL(c.req.url).pathname;
  if (["OPTIONS"].includes(c.req.method) || ["/health", "/api/health", "/init", "/billing/webhook", "/auth/request-code", "/auth/verify-code"].includes(path)) {
    await next();
    return;
  }
  const apiKey = c.env.API_KEY;
  const jwtSecret = (c.env.JWT_SECRET as string) || apiKey || "dev-jwt-secret-change-me";

  // Fail-closed in production; fail-open only in local dev when no API_KEY is configured
  if (!apiKey) {
    const env = c.env.ENVIRONMENT || "production";
    if (env !== "development") {
      console.error("API_KEY not configured in production — blocking request");
      return c.json({ error: "Server misconfigured — API_KEY required" }, 500);
    }
    // In dev with no API_KEY, accept valid JWT if present, otherwise fail-open
    const authHeaderJwt = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");
    if (authHeaderJwt) {
      const payload = await verifyJwt(authHeaderJwt, jwtSecret);
      if (payload) {
        (c as any).set("jwtPayload", payload);
        await next();
        return;
      }
    }
    await next();
    return;
  }

  const providedApiKey = c.req.header("x-api-key");
  const authHeader = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  // 1) x-api-key dev path — legacy, do not break
  if (providedApiKey && providedApiKey === apiKey) {
    await next();
    return;
  }
  // 2) Bearer token that equals API_KEY (legacy dev path)
  if (authHeader && authHeader === apiKey) {
    await next();
    return;
  }
  // 3) JWT verification via Authorization Bearer
  if (authHeader) {
    const payload = await verifyJwt(authHeader, jwtSecret);
    if (payload) {
      (c as any).set("jwtPayload", payload);
      await next();
      return;
    }
  }
  // 4) Also allow JWT via x-api-key header (edge case)
  if (providedApiKey) {
    const payload = await verifyJwt(providedApiKey, jwtSecret);
    if (payload) {
      (c as any).set("jwtPayload", payload);
      await next();
      return;
    }
  }

  return c.json({ error: "Unauthorized — provide x-api-key header or valid Bearer token" }, 401);
});

// health
app.get("/health", (c) => c.json({ ok: true, service: "agentic-cv-api", version: "1.0.0" }));
app.get("/api/health", (c) => c.json({ ok: true }));

// init db (idempotent)
app.get("/init", async (c) => {
  await initDb(c.env.DB);
  return c.json({ ok: true });
});

// candidates
app.post("/candidates", async (c) => {
  await initDb(c.env.DB);
  const b = await c.req.json();
  const parsed = CandidateInputSchema.safeParse(b);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  }
  const data = parsed.data;
  const id = data.id || crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO candidates (id, email, full_name, target_role, industry, location, salary_min, salary_max, currency, notice_period, right_to_work, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET full_name = ?, target_role = ?, location = ?, phone = ?, updated_at = datetime('now')"
  ).bind(
    id, data.email, data.fullName, data.targetRole || null, data.industry || null, data.location || null, data.salaryMin || null, data.salaryMax || null, data.currency || "GBP", data.noticePeriod || null, data.rightToWork || null, data.phone || null,
    data.fullName, data.targetRole || null, data.location || null, data.phone || null
  ).run();
  const row = await c.env.DB.prepare("SELECT * FROM candidates WHERE email = ?").bind(data.email).first<CandidateRow>();
  return c.json(row, 201);
});

app.get("/candidates/:id", async (c) => {
  const row: any = await c.env.DB.prepare("SELECT * FROM candidates WHERE id = ?").bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json(row);
});

app.put("/candidates/:id", async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json();
  const fields: string[] = [];
  const vals: any[] = [];
  for (const [k, col] of [["fullName", "full_name"], ["targetRole", "target_role"], ["location", "location"], ["rightToWork", "right_to_work"], ["phone", "phone"], ["noticePeriod", "notice_period"], ["industry", "industry"]] as const) {
    if ((b as any)[k] !== undefined) { fields.push(`${col} = ?`); vals.push((b as any)[k]); }
  }
  for (const k of ["salary_min", "salary_max"] as const) {
    if ((b as any)[k] !== undefined) { fields.push(`${k} = ?`); vals.push((b as any)[k]); }
  }
  if (!fields.length) return c.json({ error: "no fields to update" }, 400);
  fields.push("updated_at = datetime('now')");
  vals.push(id);
  await c.env.DB.prepare(`UPDATE candidates SET ${fields.join(", ")} WHERE id = ?`).bind(...vals).run();
  const row = await c.env.DB.prepare("SELECT * FROM candidates WHERE id = ?").bind(id).first();
  return c.json(row);
});

app.put("/candidates/:id/constraints", async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json();
  const parsed = SaveConstraintsSchema.safeParse(b);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  }
  const data = parsed.data;
  const content = data.content || "";
  const docId = crypto.randomUUID();
  await c.env.DB.prepare("INSERT INTO constraints_docs (id, candidate_id, content, did_list, did_not_list) VALUES (?, ?, ?, ?, ?) ON CONFLICT(candidate_id) DO UPDATE SET content = ?, did_list = ?, did_not_list = ?, updated_at = datetime('now')")
    .bind(docId, id, content, JSON.stringify(data.didList || []), JSON.stringify(data.didNotList || []), content, JSON.stringify(data.didList || []), JSON.stringify(data.didNotList || [])).run().catch(async () => {
      // fallback if no unique constraint on candidate_id — just insert
      await c.env.DB.prepare("DELETE FROM constraints_docs WHERE candidate_id = ?").bind(id).run();
      await c.env.DB.prepare("INSERT INTO constraints_docs (id, candidate_id, content, did_list, did_not_list) VALUES (?, ?, ?, ?, ?)").bind(docId, id, content, JSON.stringify(data.didList || []), JSON.stringify(data.didNotList || [])).run();
    });
  return c.json({ ok: true, id: docId });
});

app.get("/candidates/:id/constraints", async (c) => {
  const row: any = await c.env.DB.prepare("SELECT * FROM constraints_docs WHERE candidate_id = ? ORDER BY updated_at DESC LIMIT 1").bind(c.req.param("id")).first();
  if (!row) return c.json({ content: "", didList: [], didNotList: [] });
  return c.json({ ...row, didList: row.did_list ? JSON.parse(row.did_list) : [], didNotList: row.did_not_list ? JSON.parse(row.did_not_list) : [] });
});

// mount sub-routers
app.use("/resumes/:id/tailor", rateLimiter({ windowSeconds: 60, maxRequests: 20 }));
app.use("/ingest/extract", rateLimiter({ windowSeconds: 60, maxRequests: 20 }));
app.route("/resumes", resumes);
app.route("/applications", applications);
app.route("/ingest", ingest);
app.route("/billing", billing);
app.route("/auth", auth);

// MCP endpoint (stub for Claude / MCP clients) — exposes tools list
app.post("/mcp", async (c) => {
  const body: any = await c.req.json().catch(() => ({}));
  if (body.method === "tools/list") {
    return c.json({
      tools: [
        { name: "list_resumes", description: "List resumes for candidate" },
        { name: "apply_resume_patch", description: "Apply JSON Patch to resume (guarded by field locks)" },
        { name: "tailor_resume", description: "Tailor resume for JD (two-pass: tailor + verifier)" },
        { name: "list_applications", description: "List applications" },
      ],
    });
  }
  return c.json({ error: "unsupported mcp method" }, 400);
});

// Cron handler — 06:00 GMT ingest
export async function scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
  console.log("cron ingest tick", event.cron);
  const BATCH = 50;
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const { results } = await env.DB.prepare("SELECT id, target_role, location FROM candidates LIMIT ? OFFSET ?").bind(BATCH, offset).all();
    const rows = results as any[];
    for (const cand of rows) {
      if (!cand.target_role) continue;
      await env.INGEST_QUEUE.send({ candidateId: cand.id, query: cand.target_role, location: cand.location || "London, UK", sources: ["adzuna", "reed", "apify"] });
    }
    hasMore = rows.length === BATCH;
    offset += BATCH;
  }
}

// Queue consumer — fetches jobs from Adzuna/Reed/Apify and inserts applications
export async function queue(batch: MessageBatch<any>, env: Env, ctx: ExecutionContext) {
  for (const msg of batch.messages) {
    const { candidateId, query, location, salaryMin } = msg.body;
    try {
      await ingestForCandidate(candidateId, query, location, salaryMin, env);
    } catch (e: any) {
      console.error("queue error", e);
    }
    msg.ack();
  }
}

export default {
  fetch: app.fetch,
  scheduled,
  queue,
};
