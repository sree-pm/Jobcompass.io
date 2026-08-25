import assert from "node:assert";
import { generateInterviewPrep } from "../src/lib/interview.ts";
import { renderCvHtml } from "../src/lib/pdf.ts";

console.log("Running Interview Preparation & ATS PDF Test Suite...\n");

const sampleResume = {
  basics: { name: "Alex Morgan", email: "alex@example.co.uk", phone: "+44 7700 900077", location: "London, UK", rightToWork: "British Citizen" },
  summary: { content: "Senior Engineer with strong track record in UK FinTech systems." },
  sections: {
    experience: {
      items: [
        {
          company: "Monzo Bank",
          title: "Senior Backend Engineer",
          date: "01/2022 – Present",
          description: ["Delivered critical payments engine reducing failure rate by 24% (£400k saved)."]
        }
      ]
    },
    skills: { items: ["TypeScript", "Distributed Systems", "Cloudflare Workers", "SQL"] }
  }
};

// Test 1: Interview Preparation Generation
{
  const prep = generateInterviewPrep("Deliveroo UK", "Staff Platform Engineer", "Alex Morgan", sampleResume);

  assert.strictEqual(prep.company, "Deliveroo UK");
  assert.strictEqual(prep.role, "Staff Platform Engineer");
  assert.strictEqual(prep.starQuestions.length, 5, "Should generate 5 tailored STAR questions");

  for (const q of prep.starQuestions) {
    assert.ok(q.question, "Question text exists");
    assert.ok(q.category, "Category exists");
    assert.ok(q.modelAnswer.situation, "Situation outline exists");
    assert.ok(q.modelAnswer.action, "Action outline exists");
    assert.ok(q.modelAnswer.result, "Result outline exists");
  }

  assert.ok(prep.followUpEmail.subject.includes("Deliveroo UK"), "Follow up email subject references company");
  assert.ok(prep.followUpEmail.body.includes("Alex Morgan"), "Follow up email body signed by candidate");
  console.log("✓ Interview Preparation Generation tests passed");
}

// Test 2: ATS PDF HTML Generation
{
  const html = renderCvHtml(sampleResume);

  assert.ok(html.includes("Alex Morgan"), "Contains candidate name");
  assert.ok(html.includes("British Citizen"), "Contains Right to Work badge");
  assert.ok(html.includes("Personal Profile"), "Contains ATS Personal Profile header");
  assert.ok(html.includes("Professional Experience"), "Contains ATS Professional Experience header");
  assert.ok(html.includes("Calibri"), "Contains ATS font-family");
  assert.ok(!html.includes("<table"), "Zero tables for clean ATS parsing");
  console.log("✓ ATS PDF Typography & Layout tests passed");
}

console.log("\nAll Interview Preparation & ATS PDF tests passed successfully! 🚀🎉");
