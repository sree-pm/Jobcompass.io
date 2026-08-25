import assert from "node:assert";
import {
  CandidateInputSchema,
  TailorRequestSchema,
  CreateApplicationSchema,
  IngestExtractSchema,
  bulletHasMetric,
  validateUkText,
} from "../src/lib/validation.ts";

console.log("Running API Validation & Security Test Suite...\n");

// Test 1: CandidateInputSchema
{
  const valid = CandidateInputSchema.safeParse({
    email: "alex@example.co.uk",
    fullName: "Alex Morgan",
    salaryMin: 60000,
    salaryMax: 85000,
    currency: "GBP",
  });
  assert.strictEqual(valid.success, true, "Valid candidate should parse");

  const invalid = CandidateInputSchema.safeParse({
    email: "invalid-email",
    fullName: "",
  });
  assert.strictEqual(invalid.success, false, "Invalid candidate email/name should fail");
  console.log("✓ CandidateInputSchema tests passed");
}

// Test 2: TailorRequestSchema
{
  const valid = TailorRequestSchema.safeParse({
    jobDescription: "Senior Software Engineer with 5+ years of experience in distributed systems.",
    company: "Monzo",
  });
  assert.strictEqual(valid.success, true, "Valid tailor request should parse");

  const tooShort = TailorRequestSchema.safeParse({
    jobDescription: "dev",
  });
  assert.strictEqual(tooShort.success, false, "Short JD should fail validation");
  console.log("✓ TailorRequestSchema tests passed");
}

// Test 3: CreateApplicationSchema
{
  const valid = CreateApplicationSchema.safeParse({
    candidateId: "cand-123",
    company: "Stripe",
    role: "Lead Engineer",
    status: "saved",
  });
  assert.strictEqual(valid.success, true, "Valid application should parse");

  const invalidStatus = CreateApplicationSchema.safeParse({
    candidateId: "cand-123",
    company: "Stripe",
    role: "Lead Engineer",
    status: "unknown_status",
  });
  assert.strictEqual(invalidStatus.success, false, "Invalid application status should fail");
  console.log("✓ CreateApplicationSchema tests passed");
}

// Test 4: IngestExtractSchema
{
  const validUrl = IngestExtractSchema.safeParse({ url: "https://boards.greenhouse.io/monzo/jobs/123" });
  assert.strictEqual(validUrl.success, true, "Valid URL should pass");

  const validText = IngestExtractSchema.safeParse({ text: "Software engineer role details..." });
  assert.strictEqual(validText.success, true, "Valid text should pass");

  const empty = IngestExtractSchema.safeParse({});
  assert.strictEqual(empty.success, false, "Empty payload should fail refinement");
  console.log("✓ IngestExtractSchema tests passed");
}

// Test 5: bulletHasMetric
{
  assert.strictEqual(bulletHasMetric("Cut payment latency by 24% saving £1.2M ARR"), true, "Should recognize % and £");
  assert.strictEqual(bulletHasMetric("Managed 12 teams across 4 countries"), true, "Should recognize quantified team numbers");
  assert.strictEqual(bulletHasMetric("Joined the engineering department in 2022"), false, "Should exclude bare years");
  console.log("✓ bulletHasMetric tests passed");
}

// Test 6: validateUkText
{
  const protectedIssues = validateUkText("DOB: 12/05/1990, Married, British nationality");
  assert.ok(protectedIssues.some(i => i.includes("Equality Act")), "Should flag protected characteristics");

  const spellingIssues = validateUkText("We prioritize customer behavior and analyze data");
  assert.ok(spellingIssues.some(i => i.includes("British spelling")), "Should flag US spelling");
  console.log("✓ validateUkText tests passed");
}

console.log("\nAll API Validation & Security tests passed successfully! 🎉");
