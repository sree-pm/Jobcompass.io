// Field-level registry — bullet-level edit locks + provenance
// Every point/paragraph is an atomic field. Agent may ONLY patch editable:true fields.
// See docs/UK_CV_SPEC.md agent_instructions.allowed_fields / forbidden_fields

export const FIELD_LOCK_REASONS = {
  identity: "Identity fields — never editable by agent",
  education: "Education/certifications — factual, locked",
  uk_forbidden: "Equality Act / GDPR — photo, DOB, NI etc.",
  user_locked: "Candidate locked this field",
};

export const UK_FORBIDDEN_PATHS = [
  "/basics/name",
  "/basics/email",
  "/basics/phone",
  "/basics/location",
  "/picture",
  "/metadata/page/format",
];

export const UK_FORBIDDEN_PREFIXES = [
  "/sections/education",
  "/sections/certifications",
  "/basics",
  "/picture",
];

// Default registry builder — call with ResumeData to produce per-resume field map
export function buildFieldRegistry(resume) {
  const fields = [];

  // helpers
  const push = (f) => fields.push({ editable: true, provenance: "did", lockReason: null, ...f });

  // basics — all locked
  for (const k of ["name", "email", "phone", "location", "website"]) {
    push({ id: `basics.${k}`, path: `/basics/${k}`, editable: false, lockReason: FIELD_LOCK_REASONS.identity, section: "basics" });
  }
  // picture locked
  push({ id: "picture", path: "/picture", editable: false, lockReason: FIELD_LOCK_REASONS.uk_forbidden, section: "basics" });

  // summary — Personal Profile — ALWAYS editable (core tailoring surface)
  push({ id: "summary.content", path: "/summary/content", editable: true, section: "summary", label: "Personal Profile", maxChars: 600 });

  // experience — each bullet is a field
  const exp = resume?.sections?.experience?.items || [];
  exp.forEach((item, i) => {
    const base = `/sections/experience/items/${i}`;
    // role / company / dates locked (factual)
    push({ id: `exp.${i}.company`, path: `${base}/company`, editable: false, lockReason: FIELD_LOCK_REASONS.education, section: "experience" });
    push({ id: `exp.${i}.title`, path: `${base}/title`, editable: false, lockReason: FIELD_LOCK_REASONS.education, section: "experience" });
    push({ id: `exp.${i}.date`, path: `${base}/date`, editable: false, lockReason: FIELD_LOCK_REASONS.education, section: "experience" });
    // description bullets — handle both string and array
    if (Array.isArray(item.description)) {
      item.description.forEach((_, bi) => {
        push({
          id: `exp.${i}.bullet.${bi}`,
          path: `${base}/description/${bi}`,
          editable: true,
          section: "experience",
          label: `${item.company || `Role ${i+1}`} — bullet ${bi+1}`,
          bullet: true,
          requiresMetric: true,
          parentIndex: i,
          bulletIndex: bi,
        });
      });
    } else if (typeof item.description === "string") {
      // split by newline/bullet for atomic editing — single field if not splittable
      push({ id: `exp.${i}.description`, path: `${base}/description`, editable: true, section: "experience", label: `${item.company || `Role ${i+1}`} — description` });
    }
    // nested roles (Reactive Resume supports items[].roles[])
    (item.roles || []).forEach((role, ri) => {
      if (Array.isArray(role.description)) {
        role.description.forEach((_, bi) => {
          push({
            id: `exp.${i}.role.${ri}.bullet.${bi}`,
            path: `${base}/roles/${ri}/description/${bi}`,
            editable: true,
            section: "experience",
            bullet: true,
            requiresMetric: true,
          });
        });
      }
    });
  });

  // skills — editable (keyword tailoring)
  push({ id: "skills.items", path: "/sections/skills/items", editable: true, section: "skills", label: "Core Competencies" });
  const skills = resume?.sections?.skills?.items || [];
  skills.forEach((_, i) => {
    push({ id: `skills.${i}`, path: `/sections/skills/items/${i}`, editable: true, section: "skills" });
  });

  // projects — each description editable
  const projects = resume?.sections?.projects?.items || [];
  projects.forEach((_, i) => {
    push({ id: `projects.${i}.description`, path: `/sections/projects/items/${i}/description`, editable: true, section: "projects", bullet: false });
  });

  // education / certifications — locked
  (resume?.sections?.education?.items || []).forEach((_, i) => {
    push({ id: `education.${i}`, path: `/sections/education/items/${i}`, editable: false, lockReason: FIELD_LOCK_REASONS.education, section: "education" });
  });
  (resume?.sections?.certifications?.items || []).forEach((_, i) => {
    push({ id: `certs.${i}`, path: `/sections/certifications/items/${i}`, editable: false, lockReason: FIELD_LOCK_REASONS.education, section: "certifications" });
  });

  // custom sections — cover letter editable, others per type
  (resume?.customSections || []).forEach((cs, i) => {
    const isCoverLetter = cs.type === "cover-letter" || cs.id === "cover-letter";
    push({
      id: `custom.${i}`,
      path: `/customSections/${i}`,
      editable: isCoverLetter,
      section: "custom",
      label: cs.name || cs.type || `Custom ${i}`,
      lockReason: isCoverLetter ? null : FIELD_LOCK_REASONS.user_locked,
    });
  });

  // page format locked
  push({ id: "metadata.page.format", path: "/metadata/page/format", editable: false, lockReason: "Locked to A4", section: "metadata" });

  return fields;
}

export function getEditablePaths(registry) {
  return registry.filter(f => f.editable).map(f => f.path);
}

export function getLockedPaths(registry) {
  return registry.filter(f => !f.editable).map(f => f.path);
}

export function isPathEditable(path, registry) {
  // exact or prefix match for array items
  const locked = registry.filter(f => !f.editable).some(f => path === f.path || path.startsWith(f.path + "/"));
  if (locked) return false;
  const editable = registry.some(f => f.editable && (path === f.path || path.startsWith(f.path + "/") || f.path.startsWith(path + "/")));
  // if path is inside an editable array field, allow
  if (editable) return true;
  // fallback: check forbidden prefixes
  if (UK_FORBIDDEN_PREFIXES.some(p => path.startsWith(p))) return false;
  return false;
}

export function applyUserLocks(registry, locks) {
  // locks: { [fieldId]: boolean } — true = lock, false = unlock (if not identity-forbidden)
  return registry.map(f => {
    if (locks[f.id] === undefined) return f;
    if (locks[f.id] === true) return { ...f, editable: false, lockReason: FIELD_LOCK_REASONS.user_locked };
    // unlock only if not identity/uk_forbidden
    if (f.lockReason === FIELD_LOCK_REASONS.identity || f.lockReason === FIELD_LOCK_REASONS.uk_forbidden || f.lockReason === FIELD_LOCK_REASONS.education) return f;
    return { ...f, editable: true, lockReason: null };
  });
}

export function validatePatchOperations(operations, registry, { strictBritish = true } = {}) {
  const errors = [];
  for (const op of operations) {
    const path = op.path || "";
    if (!path.startsWith("/")) {
      errors.push(`Invalid path (must start with /): ${path}`);
      continue;
    }
    // check editable
    if (!isPathEditable(path, registry)) {
      errors.push(`Forbidden field (locked): ${path}`);
      continue;
    }
    // value checks
    if (op.value !== undefined && typeof op.value === "string") {
      if (strictBritish) {
        const british = checkBritishSpelling(op.value);
        if (british.length) errors.push(`British spelling required in ${path}: ${british.join(", ")}`);
      }
      if (/\b(photo|dob|date of birth|marital|nationality|ni number)\b/i.test(op.value)) {
        errors.push(`Protected characteristic in ${path} — blocked by Equality Act / GDPR`);
      }
      const ban = ["team player", "hard worker", "passionate about", "i believe i would be a great fit", "i am writing to apply"];
      for (const phrase of ban) {
        if (op.value.toLowerCase().includes(phrase)) {
          errors.push(`Banned phrase in ${path}: "${phrase}"`);
        }
      }
    }
  }
  return errors;
}

export const US_TO_GB = {
  optimize: "optimise", optimized: "optimised", optimization: "optimisation",
  organization: "organisation", organizational: "organisational",
  prioritize: "prioritise", prioritized: "prioritised",
  behavior: "behaviour", behavioral: "behavioural",
  customize: "customise", customized: "customised", customization: "customisation",
  analyze: "analyse", analyzed: "analysed", analyzing: "analysing",
  utilized: "utilised", utilize: "utilise", utilizing: "utilising",
  license: "licence", licensed: "licenced",
  program: "programme", programs: "programmes",
  center: "centre", centered: "centred",
  color: "colour", colored: "coloured",
  favor: "favour", favorable: "favourable",
  honor: "honour", honored: "honoured",
  labor: "labour",
  modeling: "modelling", modeled: "modelled",
  traveling: "travelling", traveled: "travelled",
  catalog: "catalogue",
  defense: "defence",
  offense: "offence",
  enroll: "enrol", enrollment: "enrolment",
  fulfill: "fulfil", fulfillment: "fulfilment",
  skillful: "skilful",
};

export function checkBritishSpelling(text) {
  const found = [];
  for (const [us, gb] of Object.entries(US_TO_GB)) {
    const re = new RegExp(`\\b${us}\\b`, 'i');
    if (re.test(text)) found.push(`${us} → ${gb}`);
  }
  return found;
}

// Build constraints doc helper (unchanged API)
export function buildConstraintsDoc({ didList = [], didNotList = [], rightToWork = "" }) {
  return `CAREER CONSTRAINTS — UK CANDIDATE\nDID:\n${didList.map(s => `• ${s}`).join("\n")}\n\nDID NOT:\n${didNotList.map(s => `• ${s}`).join("\n")}\n\nRIGHT TO WORK: ${rightToWork || "[not set]"}\nUK RULES: A4, British spelling, £ metrics, no photo/DOB.`;
}
