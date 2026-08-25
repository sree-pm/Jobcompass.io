export interface MatchAnalysis {
  scores: {
    atsScore: number;
    readabilityScore: number;
    matchScore: number;
    confidenceScore: number;
    experienceScore: number;
    constraintsScore: number;
  };
  gap: {
    matches: string[];
    gaps: string[];
    keywordsMissing: string[];
  };
}

/**
 * Deterministic Semantic Fit & Gap Analysis Engine
 * Evaluates candidate CV and constraints against target Job Description.
 */
export function calculateSemanticFit(
  resume: any,
  jobDescription: string,
  constraintsDoc?: string
): MatchAnalysis {
  const jdLower = (jobDescription || "").toLowerCase();
  const cvText = JSON.stringify(resume || {}).toLowerCase();
  const constraintsLower = (constraintsDoc || "").toLowerCase();

  // Extract key technical and business keywords from JD
  const keywordCandidates = [
    "typescript", "javascript", "react", "node", "python", "go", "java", "sql", "postgresql",
    "aws", "cloudflare", "gcp", "docker", "kubernetes", "graphql", "rest", "api",
    "distributed systems", "ci/cd", "microservices", "agile", "leadership", "mentoring",
    "architecture", "scaling", "security", "performance", "a/b testing", "product management",
    "data engineering", "machine learning", "devops", "fintech", "saas"
  ];

  const jdKeywords = keywordCandidates.filter(k => jdLower.includes(k));
  const cvKeywords = keywordCandidates.filter(k => cvText.includes(k));

  const matchedKeywords = jdKeywords.filter(k => cvKeywords.includes(k));
  const missingKeywords = jdKeywords.filter(k => !cvKeywords.includes(k));

  // 1. ATS Keyword Score (0 - 100)
  const atsRatio = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) : 0.8;
  const atsScore = Math.min(100, Math.max(40, Math.round(atsRatio * 100)));

  // 2. Constraints Score (0 - 100)
  // Check if JD mentions anything specifically in the DID NOT list
  let constraintsViolations = 0;
  const didNotParts = constraintsLower.split(/did not[:\s\-]*/i);
  const didNotSection = didNotParts.length > 1 ? didNotParts.slice(1).join(" ") : "";
  for (const kw of keywordCandidates) {
    if (didNotSection.includes(kw) && jdLower.includes(kw)) {
      constraintsViolations++;
    }
  }
  const constraintsScore = constraintsViolations > 0 ? Math.max(30, 100 - (constraintsViolations * 25)) : 100;

  // 3. Readability & Structure Score (0 - 100)
  const experienceItems = resume?.sections?.experience?.items || [];
  const hasStrongBullets = experienceItems.some((e: any) => 
    Array.isArray(e.description) && e.description.some((b: string) => /(%|£|\b\d+\b)/.test(b))
  );
  const readabilityScore = hasStrongBullets ? 92 : 75;

  // 4. Overall Match & Confidence Scores
  const experienceScore = Math.min(100, Math.round((atsScore * 0.6) + (readabilityScore * 0.4)));
  const matchScore = Math.round((atsScore * 0.5) + (experienceScore * 0.3) + (constraintsScore * 0.2));
  
  let confidenceScore = Math.round((matchScore * 0.8) + (readabilityScore * 0.2));
  if (!constraintsDoc || constraintsDoc.trim().length < 40) {
    confidenceScore = Math.min(confidenceScore, 70); // Cap at 70 if no constraints ground truth
  }

  // Key matches and gaps
  const matches: string[] = matchedKeywords.map(k => k.toUpperCase());
  if (hasStrongBullets) matches.push("Quantified £/% Metrics in Experience");
  if (cvText.includes("london") || cvText.includes("uk")) matches.push("UK Location & Right to Work Alignment");

  const gaps: string[] = missingKeywords.slice(0, 5).map(k => `Missing requirement: ${k}`);
  if (constraintsViolations > 0) {
    gaps.push("JD demands competencies listed in candidate DID NOT boundary");
  }

  return {
    scores: {
      atsScore,
      readabilityScore,
      matchScore,
      confidenceScore,
      experienceScore,
      constraintsScore,
    },
    gap: {
      matches: matches.length > 0 ? matches : ["Core Technical Foundations"],
      gaps,
      keywordsMissing: missingKeywords,
    },
  };
}
