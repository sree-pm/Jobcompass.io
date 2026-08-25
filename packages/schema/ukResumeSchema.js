// UK ResumeData + agent_instructions schema
// Extends Reactive Resume ResumeData (packages/schema/src/resume/data.ts) with UK constraints.
// Used for client-side validation before PATCH /resumes/{id} and before PDF generation.

export const UK_ALLOWED_FIELDS = [
  "summary.content",
  "sections.experience.items[].description",
  "sections.experience.items[].roles[].description",
  "sections.skills.items",
  "sections.projects.items[].description",
  "customSections[?(@.type=='cover-letter')].items[].content",
];

export const UK_FORBIDDEN_FIELDS = [
  "basics.name",
  "basics.email",
  "basics.phone",
  "basics.location",
  "sections.education",
  "sections.certifications",
  "picture",
  "metadata.page.format", // locked to a4
];

export const UK_RULES = {
  maxPages: 2,
  pageFormat: "a4",
  locale: "en-GB",
  currency: "GBP",
  dateFormat: "MM/YYYY",
  requireBritishSpelling: true,
  requireMetricPerBullet: true,
  banPhrases: [
    "team player",
    "hard worker",
    "passionate about",
    "i believe i would be a great fit",
    "i am writing to apply"
  ],
  atsHeadings: [
    "Personal Profile",
    "Core Competencies",
    "Professional Experience",
    "Education",
    "Certifications"
  ],
  forbiddenPersonal: ["photo", "dob", "date of birth", "marital", "nationality", "ni number"],
};

// British vs US spelling map for validation
export const US_TO_GB = {
  "optimize": "optimise", "optimized": "optimised", "optimization": "optimisation",
  "organization": "organisation", "organizational": "organisational",
  "prioritize": "prioritise", "prioritized": "prioritised",
  "behavior": "behaviour", "behavioral": "behavioural",
  "customize": "customise", "customized": "customised",
  "analyze": "analyse", "analyzed": "analysed",
  "utilize": "utilise", "utilized": "utilised",
  "license": "licence", "licensed": "licenced",
  "program": "programme", "programs": "programmes",
  "center": "centre", "centered": "centred",
  "color": "colour", "favor": "favour",
  "honor": "honour", "labor": "labour",
  "modeling": "modelling", "traveling": "travelling",
  "catalog": "catalogue", "defense": "defence",
  "enroll": "enrol", "enrollment": "enrolment",
  "fulfill": "fulfil", "skillful": "skilful",
};

export function validateBritishSpelling(text) {
  const found = [];
  for (const [us, gb] of Object.entries(US_TO_GB)) {
    const re = new RegExp(`\\b${us}\\b`, 'i');
    if (re.test(text)) found.push(`${us} → ${gb}`);
  }
  return found;
}

export function validateUkPatch(operations) {
  const errors = [];
  const forbiddenPaths = [
    "/basics/name", "/basics/email", "/basics/phone", "/basics/location",
    "/sections/education", "/sections/certifications",
    "/picture", "/metadata/page/format",
  ];
  for (const op of operations) {
    const path = op.path || "";
    // Block if path matches or is nested under a forbidden path
    const blocked = forbiddenPaths.some(fp => path === fp || path.startsWith(fp + "/"));
    if (blocked) {
      errors.push(`Forbidden field: ${path} (blocked by UK agent_instructions)`);
    }
    if (op.value && typeof op.value === "string") {
      const spelling = validateBritishSpelling(op.value);
      if (spelling.length) errors.push(`Use British spelling in ${path}: ${spelling.join(", ")}`);
    }
  }
  return errors;
}

export function buildUkConstraintsDoc({ didList, didNotList }) {
  // Helper to build constraintsDoc from structured input, compatible with JobCompass template
  return `CAREER CONSTRAINTS — UK CANDIDATE\nDID:\n${didList.map(s => `• ${s}`).join("\n")}\n\nDID NOT:\n${didNotList.map(s => `• ${s}`).join("\n")}\n\nUK RIGHT TO WORK: Must be preserved verbatim. No photo/DOB. Salary in GBP only.`;
}

export const defaultUkProfile = {
  currency: "GBP",
  rightToWork: "", // e.g. "British Citizen", "Settled Status", "Skilled Worker visa until 06/2027"
  noticePeriod: "",
  preferredLocations: ["London", "Manchester", "Remote UK"],
};
