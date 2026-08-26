// Unit tests for JobCompass platform agents (A1–A5 offline logic)
// Run: node apps/api/test/platformAgents.test.js
// Tests the pure logic (heuristics, URL normalisation, SIC mapping) without network.

import assert from "node:assert";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(__dirname, "..", "..", "..", "packages", "worker", "src");
const aiRoot = join(__dirname, "..", "..", "..", "packages", "ai", "src");

// Minimal globals the modules expect
globalThis.crypto ??= (await import("node:crypto")).webcrypto;

let passed = 0;
function ok(name, fn) {
  try {
    fn();
    console.log(` ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(` ✗ ${name}: ${e.message}`);
    process.exitCode = 1;
  }
}

// ── 1) normaliseUrl (ats-common) ───────────────────────────────────
const { normaliseUrl } = await import(pathToFileURL(join(workerRoot, "providers", "ats-common.ts")).href).catch(() => ({ normaliseUrl: null }));

ok("normaliseUrl lowercases + strips hash + trailing slash", () => {
  assert.ok(normaliseUrl, "module loaded");
  const a = normaliseUrl("https://Example.com/Jobs/123#apply");
  const b = normaliseUrl("https://example.com/jobs/123/");
  assert.strictEqual(a, b);
  assert.ok(!a.includes("#"));
});

ok("normaliseUrl sorts query params (order-independent dedupe)", () => {
  const a = normaliseUrl("https://boards.greenhouse.io/jobs/123?utm=abc&ref=x");
  const b = normaliseUrl("https://boards.greenhouse.io/jobs/123?ref=x&utm=abc");
  assert.strictEqual(a, b);
});

ok("normaliseUrl fallback for invalid URLs", () => {
  const r = normaliseUrl("  NotAUrl/ ");
  assert.ok(typeof r === "string" && r.length > 0);
});

// ── 2) SIC → industry map ──────────────────────────────────────────
const sic = await import(pathToFileURL(join(workerRoot, "enrichers", "sic-industry-map.ts")).href);

ok("sicToIndustry maps full 5-digit SIC codes", () => {
  assert.strictEqual(sic.sicToIndustry(["62012"]), "Technology & IT");
  assert.strictEqual(sic.sicToIndustry(["64190"]), "Financial Services");
  assert.strictEqual(sic.sicToIndustry(["86101"]), "Healthcare");
  assert.strictEqual(sic.sicToIndustry(["41202"]), "Construction");
  assert.strictEqual(sic.sicToIndustry(["85421"]), "Education");
});

ok("sicToIndustry falls back to Other for unknown/empty", () => {
  assert.strictEqual(sic.sicToIndustry([]), "Other");
  assert.strictEqual(sic.sicToIndustry(["abc"]), "Other");
  // 99 IS a valid SIC division (International Organisations)
  assert.strictEqual(sic.sicToIndustry(["99999"]), "International Organisations");
});

// ── 3) Job classifier heuristics ───────────────────────────────────
const cls = await import(pathToFileURL(join(workerRoot, "agents", "job-classifier.ts")).href);

ok("heuristic: seniority detection", () => {
  assert.strictEqual(cls.classifyJobHeuristic({ id: "1", title: "Senior Software Engineer" }).seniority, "senior");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "2", title: "Graduate Data Analyst" }).seniority, "junior");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "3", title: "Director of Engineering" }).seniority, "director");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "4", title: "Staff Engineer" }).seniority, "lead");
});

ok("heuristic: work mode from description", () => {
  assert.strictEqual(cls.classifyJobHeuristic({ id: "1", title: "Dev", job_description: "We are fully remote and work from home" }).work_mode, "remote");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "2", title: "Dev", job_description: "Hybrid working, 2 days in the office" }).work_mode, "hybrid");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "3", title: "Dev", job_description: "Office based in Manchester" }).work_mode, "onsite");
});

ok("heuristic: UK region from location", () => {
  assert.strictEqual(cls.classifyJobHeuristic({ id: "1", title: "Dev", location: "Manchester" }).uk_region, "North West");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "2", title: "Dev", location: "London" }).uk_region, "London");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "3", title: "Dev", location: "Edinburgh" }).uk_region, "Scotland");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "4", title: "Dev", location: "Cardiff" }).uk_region, "Wales");
});

ok("heuristic: contract type", () => {
  assert.strictEqual(cls.classifyJobHeuristic({ id: "1", title: "Software Engineer (12 month FTC)" }).contract_type, "contract");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "2", title: "Summer Intern" }).contract_type, "internship");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "3", title: "Software Engineer" }).contract_type, "permanent");
});

ok("heuristic: salary bands", () => {
  assert.strictEqual(cls.classifyJobHeuristic({ id: "1", title: "Dev", salary: "£70,000 - £85,000" }).salary_band, "£60k–£90k");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "2", title: "Dev", salary: "£30,000" }).salary_band, "£25k–£40k");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "3", title: "Dev", salary: "£95,000" }).salary_band, "£90k+");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "4", title: "Dev" }).salary_band, "Unspecified");
});

ok("heuristic: industry from title", () => {
  assert.strictEqual(cls.classifyJobHeuristic({ id: "1", title: "Registered Nurse" }).industry, "Healthcare");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "2", title: "Backend Developer" }).industry, "Technology & IT");
  assert.strictEqual(cls.classifyJobHeuristic({ id: "3", title: "Solicitor" }).industry, "Professional Services");
});

// ── 4) Verifier dead-phrase list exists ────────────────────────────
const verifier = await import(pathToFileURL(join(workerRoot, "agents", "career-verifier.ts")).href);
ok("career-verifier exports verifyJob", () => {
  assert.strictEqual(typeof verifier.verifyJob, "function");
});

// ── 5) Matchmaker + pipeline exports ───────────────────────────────
const mm = await import(pathToFileURL(join(workerRoot, "agents", "matchmaker.ts")).href);
ok("matchmaker exports embedNewJobs + matchJobsForCandidate", () => {
  assert.strictEqual(typeof mm.embedNewJobs, "function");
  assert.strictEqual(typeof mm.matchJobsForCandidate, "function");
});

const pipeline = await import(pathToFileURL(join(workerRoot, "pipeline.ts")).href);
ok("pipeline exports runPlatformPipeline", () => {
  assert.strictEqual(typeof pipeline.runPlatformPipeline, "function");
});

const enricher = await import(pathToFileURL(join(workerRoot, "enrichers", "company-enricher.ts")).href);
ok("company-enricher exports enrichCompany", () => {
  assert.strictEqual(typeof enricher.enrichCompany, "function");
});

// ── 6) AI router task table ────────────────────────────────────────
const ai = await import(pathToFileURL(join(aiRoot, "index.ts")).href);
ok("AI router exports routeChat/routeJson/workersAiEmbed", () => {
  assert.strictEqual(typeof ai.routeChat, "function");
  assert.strictEqual(typeof ai.routeJson, "function");
  assert.strictEqual(typeof ai.workersAiEmbed, "function");
});

console.log(`\n${passed} platform-agent checks passed.`);
if (process.exitCode) console.log("SOME CHECKS FAILED");
