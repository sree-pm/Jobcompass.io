import { Hono } from "hono";
import { applyPatch } from "fast-json-patch";
import { buildFieldRegistry, validatePatchOperations, applyUserLocks } from "../../../../packages/schema/fieldRegistry.js";
import { routeChat } from "../../../../packages/ai/src/index.js";
import { tailorResume } from "../agents/tailor.js";
import { verifyTailoredCv, quickVerify } from "../agents/verifier.js";
import { CreateResumeSchema, PatchRequestSchema, TailorRequestSchema, FieldLocksSchema } from "../lib/validation.js";
import { deductCredits, getCreditBalance, addCredits } from "../lib/credits.js";
import { calculateSemanticFit } from "../lib/matcher.js";
import type { Env, ResumeRow } from "../lib/types.js";

const app = new Hono<{ Bindings: Env }>();

// GET /resumes?candidateId=xxx — list
app.get("/", async (c) => {
  const candidateId = c.req.query("candidateId");
  if (!candidateId) return c.json({ error: "candidateId required" }, 400);
  const { results } = await c.env.DB.prepare("SELECT * FROM resumes WHERE candidate_id = ? ORDER BY updated_at DESC").bind(candidateId).all();
  const rows = (results as any[]).map(r => ({ ...r, data: JSON.parse(r.data) }));
  return c.json(rows);
});

// POST /resumes — create master
app.post("/", async (c) => {
  const b = await c.req.json();
  const parsed = CreateResumeSchema.safeParse(b);
  if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  const { candidateId, title, data } = parsed.data;
  const id = crypto.randomUUID();
  await c.env.DB.prepare("INSERT INTO resumes (id, candidate_id, title, data, is_master) VALUES (?, ?, ?, ?, 1)").bind(id, candidateId, title || "Master CV", JSON.stringify(data)).run();
  return c.json({ id, title, data }, 201);
});

// GET /resumes/:id — with registry
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const row: any = await c.env.DB.prepare("SELECT * FROM resumes WHERE id = ?").bind(id).first();
  if (!row) return c.json({ error: "not found" }, 404);
  const data = JSON.parse(row.data);
  const registry = buildFieldRegistry(data);
  // overlay user locks
  const locksRes = await c.env.DB.prepare("SELECT field_id, locked FROM field_locks WHERE candidate_id = ?").bind(row.candidate_id).all();
  const locks: Record<string, boolean> = {};
  for (const r of (locksRes.results as any[])) locks[r.field_id] = !!r.locked;
  const regWithLocks = applyUserLocks(registry, locks);
  return c.json({ ...row, data, registry: regWithLocks });
});

// PATCH /resumes/:id — guarded JSON Patch (agent or user)
app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = PatchRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  const ops = parsed.data.operations;

  const row: any = await c.env.DB.prepare("SELECT * FROM resumes WHERE id = ?").bind(id).first();
  if (!row) return c.json({ error: "not found" }, 404);
  const data = JSON.parse(row.data);
  const registry = buildFieldRegistry(data);
  const locksRes = await c.env.DB.prepare("SELECT field_id, locked FROM field_locks WHERE candidate_id = ?").bind(row.candidate_id).all();
  const locks: Record<string, boolean> = {};
  for (const r of (locksRes.results as any[])) locks[r.field_id] = !!r.locked;
  const reg = applyUserLocks(registry, locks);

  const errors = validatePatchOperations(ops as any, reg);
  if (errors.length) return c.json({ error: "validation failed", details: errors }, 422);

  // quick verify
  const quickIssues = quickVerify(ops, reg);
  const hasError = quickIssues.some(i => i.severity === "error");
  if (hasError) return c.json({ error: "blocked by verifier", issues: quickIssues }, 422);

  // apply
  let patched: any;
  try {
    const result = applyPatch(JSON.parse(JSON.stringify(data)), ops as any, true, false);
    patched = result.newDocument;
  } catch (e: any) {
    return c.json({ error: "patch failed", details: e.message }, 422);
  }

  await c.env.DB.prepare("UPDATE resumes SET data = ?, updated_at = datetime('now'), version = version + 1 WHERE id = ?").bind(JSON.stringify(patched), id).run();
  return c.json({ id, data: patched, registry: reg, warnings: quickIssues.filter(i => i.severity !== "error") });
});

// POST /resumes/:id/tailor — agentic tailor + verifier two-pass
app.post("/:id/tailor", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = TailorRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  const { jobDescription, constraintsDoc, applicationId, fieldLocks, targetRole, company } = parsed.data;

  const row: any = await c.env.DB.prepare("SELECT * FROM resumes WHERE id = ?").bind(id).first();
  if (!row) return c.json({ error: "resume not found" }, 404);

  const balance = await getCreditBalance(c.env.DB, row.candidate_id);
  if (balance < 1) {
    return c.json({ error: "Insufficient credits. Please top up.", requiredCredits: 1, currentBalance: balance }, 402);
  }

  const data = JSON.parse(row.data);
  const registry = buildFieldRegistry(data);

  let constraints = constraintsDoc;
  if (!constraints) {
    const cd: any = await c.env.DB.prepare("SELECT content FROM constraints_docs WHERE candidate_id = ? ORDER BY updated_at DESC LIMIT 1").bind(row.candidate_id).first();
    constraints = cd?.content || "";
  }

  // Deduct only after pre-deduct validation would succeed — but we must run tailor first to know if ops are blocked.
  // So: deduct after tailor validation, with full refund branch on any post-deduct failure.
  let deducted = false;
  let newBalance = balance;
  let tailorOut: any = null;
  let patched: any = null;
  let verifyOut: any = null;
  let regWithLocks: any = null;

  try {
    // 1) Tailor (uses multi-provider router internally — see agents/tailor.ts)
    tailorOut = await tailorResume({ resume: data, jobDescription, constraintsDoc: constraints || "", fieldLocks, targetRole }, c.env as any);

    // validate ops against registry BEFORE charging
    regWithLocks = fieldLocks ? applyUserLocks(registry, fieldLocks) : registry;
    const errors = validatePatchOperations(tailorOut.operations as any, regWithLocks);
    if (errors.length) {
      // No charge — blocked ops never cost the user
      return c.json({ error: "tailor produced blocked ops", details: errors, tailorWarnings: tailorOut.warnings }, 422);
    }

    // Now charge — ops are clean
    await deductCredits(c.env.DB, row.candidate_id, 1, `Tailored dossier for ${company || "Role"}`, applicationId);
    deducted = true;
    newBalance = balance - 1;

    // apply to create patched version
    patched = applyPatch(JSON.parse(JSON.stringify(data)), tailorOut.operations as any, true, false).newDocument as any;

    // 2) Verifier (second agent, different prompt) — also via router
    verifyOut = await verifyTailoredCv({ originalResume: data, patchedResume: patched, operations: tailorOut.operations, jobDescription, constraintsDoc: constraints || "" }, c.env as any);
  } catch (e: any) {
    // Refund if we already deducted but then failed (applyPatch throw, verifier throw, AI provider failure after deduct, etc.)
    if (deducted) {
      try { await addCredits(c.env.DB, row.candidate_id, 1, "refund", `Refund — tailor failed: ${e?.message?.slice(0,120) || "unknown"}`, applicationId ? `refund:${applicationId}` : undefined); } catch {}
      newBalance = balance; // report original balance after refund
    }
    // Never leak provider URLs/keys — log internally, generic to user
    console.error("tailor failed", (e?.message || String(e)).slice(0,300));
    if (deducted) return c.json({ error: "Tailoring failed — your credit was refunded", refunded: true }, 500);
    return c.json({ error: "Tailoring temporarily unavailable — please retry" }, 500);
  }

  // From here `tailorOut`, `patched`, `verifyOut`, `regWithLocks` are guaranteed set and user has been charged 1 credit

  // if verifier has corrective ops and passed=false, apply correctives (auto-fix) if no errors
  let finalResume = patched;
  let finalOps = tailorOut.operations as any[];
  if (!verifyOut.passed && verifyOut.correctiveOperations.length) {
    const fixErrors = validatePatchOperations(verifyOut.correctiveOperations as any, regWithLocks);
    if (!fixErrors.length) {
      try {
        finalResume = applyPatch(JSON.parse(JSON.stringify(patched)), verifyOut.correctiveOperations as any, true, false).newDocument as any;
        finalOps = [...finalOps, ...verifyOut.correctiveOperations];
      } catch {}
    }
  }

  // persist tailored resume as new row linked to application
  const tailoredId = crypto.randomUUID();
  const title = `Tailored — ${company || "Role"} — ${new Date().toISOString().slice(0, 10)}`;
  await c.env.DB.prepare("INSERT INTO resumes (id, candidate_id, title, data, is_master, parent_id, application_id) VALUES (?, ?, ?, ?, 0, ?, ?)").bind(
    tailoredId, row.candidate_id, title, JSON.stringify(finalResume), id, applicationId || null
  ).run();

  const analysis = calculateSemanticFit(finalResume, jobDescription, constraints || "");

  if (applicationId) {
    const fullDossier = {
      verifier: verifyOut,
      coverLetter: tailorOut.coverLetter,
      screeningAnswers: tailorOut.screeningAnswers,
      analysis,
    };
    await c.env.DB.prepare("UPDATE applications SET tailored_resume_id = ?, verifier_report = ?, scores = ? WHERE id = ?").bind(
      tailoredId, JSON.stringify(fullDossier), JSON.stringify(analysis.scores), applicationId
    ).run();
  }

  return c.json({
    tailoredResumeId: tailoredId,
    operations: finalOps,
    originalOperations: tailorOut.operations,
    correctiveOperations: verifyOut.correctiveOperations,
    verifier: verifyOut,
    warnings: tailorOut.warnings,
    resume: finalResume,
    creditsRemaining: newBalance,
    dossier: applicationId ? {
      verifier: verifyOut,
      coverLetter: tailorOut.coverLetter,
      screeningAnswers: tailorOut.screeningAnswers,
      analysis,
    } : undefined,
    analysis,
  });
});

// Field locks
app.put("/:id/locks", async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json();
  const parsed = FieldLocksSchema.safeParse(b);
  if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  const body = parsed.data;
  const row: any = await c.env.DB.prepare("SELECT candidate_id FROM resumes WHERE id = ?").bind(id).first();
  if (!row) return c.json({ error: "not found" }, 404);
  for (const [fieldId, locked] of Object.entries(body.locks || {})) {
    const lockId = `${row.candidate_id}:${fieldId}`;
    // need path for registry — look up
    const reg = buildFieldRegistry(JSON.parse((await c.env.DB.prepare("SELECT data FROM resumes WHERE id = ?").bind(id).first() as any).data));
    const field = reg.find((f: any) => f.id === fieldId);
    const path = field?.path || fieldId;
    await c.env.DB.prepare("INSERT INTO field_locks (id, candidate_id, field_id, path, locked) VALUES (?, ?, ?, ?, ?) ON CONFLICT(candidate_id, field_id) DO UPDATE SET locked = ?, updated_at = datetime('now')")
      .bind(lockId, row.candidate_id, fieldId, path, locked ? 1 : 0, locked ? 1 : 0).run();
  }
  return c.json({ ok: true });
});

// POST /resumes/parse-cv — parse raw CV text into structured resume data using AI
app.post("/parse-cv", async (c) => {
  const b: any = await c.req.json();
  const cvText = b.cvText;
  const candidateProfile = b.candidateProfile || {};
  if (!cvText || cvText.trim().length < 50) {
    return c.json({ error: "CV text too short — at least 50 characters required" }, 400);
  }

  try {
    const prompt = `Parse this UK CV text into structured JSON. Extract exactly this schema:
{
  "basics": { "name": "", "email": "", "phone": "", "location": "", "rightToWork": "" },
  "summary": { "content": "" },
  "sections": {
    "experience": { "items": [{ "company": "", "title": "", "date": "", "description": ["bullet1", "bullet2"] }] },
    "skills": { "items": ["skill1", "skill2"] },
    "education": { "items": [{ "degree": "", "institution": "", "date": "" }] }
  }
}
Rules:
- Preserve all original facts exactly. Do NOT add or embellish.
- Use British English spelling.
- Keep £ and % metrics as-is.
- If a field is not found in the CV, use empty string or empty array.
`;
    const result = await routeChat("extract", [
      { role: "system", content: prompt },
      { role: "user", content: `<cv_text>${cvText.slice(0, 8000)}</cv_text>\n\nCandidate name: ${candidateProfile.fullName || ""}, email: ${candidateProfile.email || ""}` },
    ], c.env as any, { maxTokens: 3000, temperature: 0.1 });

    // Parse AI response
    let parsed;
    try {
      const cleaned = result.replace(/```json|```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : JSON.parse(cleaned);
    } catch {
      // Return a minimal structure with the raw text as summary
      parsed = {
        basics: { name: candidateProfile.fullName || "", email: candidateProfile.email || "", location: candidateProfile.location || "" },
        summary: { content: cvText.slice(0, 500) },
        sections: { experience: { items: [] }, skills: { items: [] }, education: { items: [] } },
      };
    }

    return c.json(parsed);
  } catch (e: any) {
    console.error("parse-cv failed", e?.message);
    return c.json({ error: "CV parsing temporarily unavailable" }, 500);
  }
});

export default app;
