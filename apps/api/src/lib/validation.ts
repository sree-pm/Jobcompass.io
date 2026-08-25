import { z } from "zod";
import { buildFieldRegistry, validatePatchOperations, applyUserLocks } from "../../../../packages/schema/fieldRegistry.js";

// --- Schema Definitions ---

export const CandidateInputSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  fullName: z.string().min(1).max(100),
  targetRole: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  currency: z.string().default("GBP"),
  noticePeriod: z.string().max(50).optional(),
  rightToWork: z.string().max(100).optional(),
  phone: z.string().optional(),
});

export const SaveConstraintsSchema = z.object({
  content: z.string().min(1),
  didList: z.array(z.string()).default([]),
  didNotList: z.array(z.string()).default([]),
});

export const CreateResumeSchema = z.object({
  candidateId: z.string().min(1),
  title: z.string().default("Master CV"),
  data: z.record(z.unknown()),
});

export const PatchOpSchema = z.object({
  op: z.enum(["add", "remove", "replace", "move", "copy", "test"]),
  path: z.string().min(1),
  value: z.unknown().optional(),
  from: z.string().optional(),
});

export const PatchRequestSchema = z.object({
  operations: z.array(PatchOpSchema).min(1).max(50),
  constraintsDoc: z.string().optional(),
  jobDescription: z.string().optional(),
  fieldLocks: z.record(z.boolean()).optional(),
});

export const TailorRequestSchema = z.object({
  jobDescription: z.string().min(10, "Job description is too short to tailor effectively"),
  constraintsDoc: z.string().optional(),
  applicationId: z.string().optional(),
  company: z.string().optional(),
  targetRole: z.string().optional(),
  fieldLocks: z.record(z.boolean()).optional(),
});

export const FieldLocksSchema = z.object({
  locks: z.record(z.boolean()),
});

export const CreateApplicationSchema = z.object({
  candidateId: z.string().min(1),
  resumeId: z.string().optional().nullable(),
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().default(""),
  salary: z.string().default(""),
  source: z.string().default("manual"),
  sourceUrl: z.string().default(""),
  jobDescription: z.string().default(""),
  tags: z.array(z.string()).default([]),
  status: z.enum(["saved", "tailored", "applied", "awaiting_response", "interview", "offer", "rejected"]).default("saved"),
});

export const UpdateApplicationSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  source_url: z.string().optional(),
  sourceUrl: z.string().optional(),
  job_description: z.string().optional(),
  jobDescription: z.string().optional(),
  status: z.enum(["saved", "tailored", "applied", "awaiting_response", "interview", "offer", "rejected"]).optional(),
  tags: z.array(z.string()).optional(),
  scores: z.record(z.unknown()).optional(),
  applied_date: z.string().optional(),
  appliedDate: z.string().optional(),
});

export const IngestSearchSchema = z.object({
  candidateId: z.string().min(1),
  query: z.string().min(1),
  location: z.string().default("London, UK"),
  sources: z.array(z.string()).default(["adzuna", "reed", "apify"]),
});

export const IngestExtractSchema = z.object({
  url: z.string().url().optional(),
  text: z.string().optional(),
}).refine(data => data.url || data.text, {
  message: "Either url or text must be provided",
});

// --- Validation Helpers ---

export function validatePatchWithRegistry(body: unknown, resume: unknown) {
  const parsed = PatchRequestSchema.safeParse(body);
  if (!parsed.success) return { ok: false as const, errors: parsed.error.issues.map(i => i.message) };

  const registry = buildFieldRegistry(resume as any);
  let reg = registry;
  if (parsed.data.fieldLocks) {
    reg = applyUserLocks(registry, parsed.data.fieldLocks);
  }

  const errors = validatePatchOperations(parsed.data.operations as any, reg);
  if (errors.length) return { ok: false as const, errors };

  return { ok: true as const, operations: parsed.data.operations, registry: reg };
}

// UK text validators (shared)
export function validateUkText(text: string): string[] {
  const issues: string[] = [];
  const lower = text.toLowerCase();
  if (/\b(dob|date of birth|marital status|nationality|ni number)\b/.test(lower)) {
    issues.push("Remove protected characteristics (Equality Act 2010 / GDPR)");
  }
  const us = ["optimize", "organization", "prioritize", "behavior", "customize", "analyze", "utilize"];
  const found = us.filter(w => lower.includes(w));
  if (found.length) issues.push(`Use British spelling: ${found.join(", ")} → optimise, organisation…`);
  if (text.split("\n").length > 80) issues.push("Likely exceeds 2 pages A4 — trim");
  return issues;
}

export function bulletHasMetric(bullet: string): boolean {
  if (/£\d/.test(bullet) || /\d+%/.test(bullet)) return true;
  if (/\b\d+[\.,]?\d*\s*(x|\+|teams?|clients?|users?|projects?|stakeholders?)\b/i.test(bullet)) return true;
  const numbers = bullet.match(/\b\d+[\.,]?\d*\b/g) || [];
  return numbers.some(n => !/^(19|20)\d{2}$/.test(n));
}
