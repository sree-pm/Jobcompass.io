import assert from "node:assert";
import { calculateSemanticFit } from "../src/lib/matcher.ts";

console.log("Running Semantic Matcher & Gap Analysis Test Suite...\n");

// Sample Resume
const sampleResume = {
  basics: { name: "Alex Morgan", location: "London, UK" },
  sections: {
    experience: {
      items: [
        {
          company: "Monzo Bank",
          title: "Senior Backend Engineer",
          description: [
            "Architected high-throughput TypeScript microservices cutting latency by 35% (£250k annual saving).",
            "Managed AWS and PostgreSQL infrastructure across 12 distributed services."
          ]
        }
      ]
    },
    skills: { items: ["TypeScript", "AWS", "PostgreSQL", "Docker", "REST API", "Microservices"] }
  }
};

// Test 1: Strong Match JD
{
  const targetJd = "We are seeking a Senior TypeScript Engineer in London with AWS, PostgreSQL, and microservices experience. Salary £85,000 GBP.";
  const constraints = "DID: Architected high-throughput microservices cutting latency by 35% (£250k saved)\nDID NOT: Did not manage frontend React code";

  const fit = calculateSemanticFit(sampleResume, targetJd, constraints);

  assert.ok(fit.scores.atsScore >= 75, "ATS score should be high for matching skills");
  assert.ok(fit.scores.readabilityScore >= 80, "Readability should be high due to quantified metrics");
  assert.ok(fit.scores.constraintsScore >= 80, "Constraints score should be high with no violations");
  assert.ok(fit.gap.matches.length > 0, "Matches should contain identified technical keywords");
  console.log("✓ Strong Match JD test passed");
}

// Test 2: Constraints Boundary Violation Detection
{
  const frontendJd = "Looking for a Frontend Lead to manage React components and mobile React Native architecture.";
  const constraints = "DID: Backend services\nDID NOT: Did not manage frontend React code, no React Native";

  const fit = calculateSemanticFit(sampleResume, frontendJd, constraints);

  assert.ok(fit.scores.constraintsScore < 100, "Constraints score should decrease if JD requires forbidden items");
  assert.ok(fit.gap.gaps.some(g => g.includes("DID NOT") || g.includes("Missing")), "Gap analysis should flag mismatch");
  console.log("✓ Constraints Violation Detection test passed");
}

// Test 3: Confidence Capping when Constraints are Missing
{
  const targetJd = "Senior Engineer role.";
  const fit = calculateSemanticFit(sampleResume, targetJd, ""); // empty constraints
  assert.strictEqual(fit.scores.confidenceScore <= 70, true, "Confidence score should be capped at 70 if constraints doc is missing");
  console.log("✓ Confidence Capping test passed");
}

console.log("\nAll Semantic Matcher & Gap Analysis tests passed successfully! 🎯🎉");
