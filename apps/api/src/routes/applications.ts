import { Hono } from "hono";
import { renderCvHtml, renderCoverLetterHtml, storePdf, generatePdfBuffer } from "../lib/pdf.js";
import { CreateApplicationSchema, UpdateApplicationSchema } from "../lib/validation.js";
import type { Env, ApplicationRow } from "../lib/types.js";
import { generateInterviewPrep } from "../lib/interview.js";

const app = new Hono<{ Bindings: Env }>();

// GET /applications?candidateId=xxx
app.get("/", async (c) => {
  const candidateId = c.req.query("candidateId");
  if (!candidateId) return c.json({ error: "candidateId required" }, 400);
  const { results } = await c.env.DB.prepare("SELECT * FROM applications WHERE candidate_id = ? ORDER BY added_date DESC LIMIT 100").bind(candidateId).all();
  const rows = (results as any[]).map(r => ({
    ...r,
    tags: r.tags ? JSON.parse(r.tags) : [],
    scores: r.scores ? JSON.parse(r.scores) : null,
    verifier_report: r.verifier_report ? JSON.parse(r.verifier_report) : null,
  }));
  return c.json(rows);
});

// POST /applications
app.post("/", async (c) => {
  const b = await c.req.json();
  const parsed = CreateApplicationSchema.safeParse(b);
  if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  const data = parsed.data;
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO applications (id, candidate_id, resume_id, company, role, location, salary, source, source_url, job_description, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    id, data.candidateId, data.resumeId || null, data.company, data.role, data.location || "", data.salary || "", data.source || "manual", data.sourceUrl || (data as any).url || "", data.jobDescription || (data as any).jd || "", JSON.stringify(data.tags || []), data.status || "saved"
  ).run();
  return c.json({ id, ...data }, 201);
});

// PUT /applications/:id — status, notes, etc.
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json();
  const parsed = UpdateApplicationSchema.safeParse(b);
  if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  const data = parsed.data;
  const fields: string[] = [];
  const vals: any[] = [];
  for (const k of ["status", "company", "role", "location", "salary"] as const) {
    if (data[k] !== undefined) { fields.push(`${k} = ?`); vals.push(data[k]); }
  }
  const sourceUrl = data.source_url ?? data.sourceUrl;
  if (sourceUrl !== undefined) { fields.push("source_url = ?"); vals.push(sourceUrl); }
  const jobDesc = data.job_description ?? data.jobDescription;
  if (jobDesc !== undefined) { fields.push("job_description = ?"); vals.push(jobDesc); }
  const appliedDate = data.applied_date ?? data.appliedDate;
  if (appliedDate !== undefined) { fields.push("applied_date = ?"); vals.push(appliedDate); }
  if (data.tags !== undefined) { fields.push("tags = ?"); vals.push(JSON.stringify(data.tags)); }
  if (data.scores !== undefined) { fields.push("scores = ?"); vals.push(JSON.stringify(data.scores)); }
  if (!fields.length) return c.json({ error: "no fields to update" }, 400);
  vals.push(id);
  await c.env.DB.prepare(`UPDATE applications SET ${fields.join(", ")} WHERE id = ?`).bind(...vals).run();
  const row: any = await c.env.DB.prepare("SELECT * FROM applications WHERE id = ?").bind(id).first();
  return c.json(row);
});

// POST /applications/:id/pdf — generate A4 PDF artifact + store to R2
app.post("/:id/pdf", async (c) => {
  const id = c.req.param("id");
  const appRow: any = await c.env.DB.prepare("SELECT * FROM applications WHERE id = ?").bind(id).first();
  if (!appRow) return c.json({ error: "not found" }, 404);
  const resumeId = appRow.tailored_resume_id || appRow.resume_id;
  if (!resumeId) return c.json({ error: "no resume linked" }, 400);
  const resume: any = await c.env.DB.prepare("SELECT data FROM resumes WHERE id = ?").bind(resumeId).first();
  if (!resume) return c.json({ error: "resume not found" }, 404);
  const data = JSON.parse(resume.data);
  const html = renderCvHtml(data);
  // Generate PDF buffer via Browser Rendering if available, else HTML fallback
  const { buffer, contentType, ext } = await generatePdfBuffer(html, c.env);
  const key = `pdfs/${id}/${Date.now()}.${ext}`;
  await storePdf(c.env.PDF_BUCKET, key, buffer as any, contentType);
  await c.env.DB.prepare("UPDATE applications SET tailored_pdf_key = ? WHERE id = ?").bind(key, id).run();
  // Return key + metadata; include htmlPreview when falling back to HTML for client-side print-to-PDF
  const res: any = { key, contentType, ext };
  if (ext === "html") res.htmlPreview = html;
  return c.json(res);
});

// POST /applications/:id/cover-letter — generate + store
app.post("/:id/cover-letter", async (c) => {
  const id = c.req.param("id");
  const b: any = await c.req.json().catch(() => ({}));
  const appRow: any = await c.env.DB.prepare("SELECT * FROM applications WHERE id = ?").bind(id).first();
  if (!appRow) return c.json({ error: "not found" }, 404);
  let letter = b.coverLetter;
  if (!letter) {
    // if verifier already produced one, use it; else ask AI (caller should have tailor output)
    return c.json({ error: "coverLetter required — pass tailor output" }, 400);
  }
  const key = `cover/${id}/${Date.now()}.html`;
  // need basics from resume
  const resume: any = await c.env.DB.prepare("SELECT data FROM resumes WHERE id = ?").bind(appRow.tailored_resume_id || appRow.resume_id).first();
  const basics = resume ? JSON.parse(resume.data).basics : {};
  const html = renderCoverLetterHtml(letter, basics, appRow.company, appRow.role);
  await storePdf(c.env.PDF_BUCKET, key, html, "text/html");
  await c.env.DB.prepare("UPDATE applications SET cover_letter_key = ? WHERE id = ?").bind(key, id).run();
  return c.json({ key });
});

// POST /applications/:id/interview-prep — generate STAR interview packet & follow-up email
app.post("/:id/interview-prep", async (c) => {
  const id = c.req.param("id");
  const appRow: any = await c.env.DB.prepare("SELECT * FROM applications WHERE id = ?").bind(id).first();
  if (!appRow) return c.json({ error: "Application not found" }, 404);

  const candRow: any = await c.env.DB.prepare("SELECT full_name FROM candidates WHERE id = ?").bind(appRow.candidate_id).first();
  const resumeId = appRow.tailored_resume_id || appRow.resume_id;
  const resumeRow: any = await c.env.DB.prepare("SELECT data FROM resumes WHERE id = ?").bind(resumeId).first();
  const resumeData = resumeRow ? JSON.parse(resumeRow.data) : {};

  const prep = generateInterviewPrep(appRow.company, appRow.role, candRow?.full_name || "Candidate", resumeData, appRow.job_description || "");
  return c.json(prep);
});

// DELETE /applications/:id
app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM applications WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

export default app;
