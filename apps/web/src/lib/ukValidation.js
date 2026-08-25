export function validateUkCvText(text) {
  const issues = [];
  const lower = text.toLowerCase();
  if (/\b(dob|date of birth|marital|nationality|ni number|photo)\b/.test(lower)) {
    issues.push("Remove protected characteristics (DOB, photo, marital, NI) — Equality Act 2010 / GDPR");
  }
  const usWords = ["optimize", "organization", "prioritize", "behavior", "customize", "analyze", "utilize"];
  const found = usWords.filter(w => lower.includes(w));
  if (found.length) issues.push(`Use British spelling: ${found.join(", ")} → optimise, organisation…`);
  if (text.split("\n").length > 80) issues.push("Likely exceeds 2 pages A4 — trim to 2 pages max for UK");
  if (/\\\$\d/.test(text) || /\$\d/.test(text)) issues.push("Use GBP (£) not USD ($) for UK roles");
  if (/\b\d+\s*years? experience\b/i.test(text) && /\bpassionate\b/i.test(text)) issues.push("Remove generic 'passionate' — use specific evidence");
  return issues;
}

export function formatGbp(value) {
  if (!value) return "";
  const n = Number(String(value).replace(/[^0-9]/g, ""));
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

export function formatUkDate(iso) {
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

export function bulletHasMetric(bullet) {
  // Match £ amounts, percentages, or numbers followed by metric-related context
  // Exclude bare years (4-digit numbers 19xx-20xx without context)
  if (/£\d/.test(bullet) || /\d+%/.test(bullet)) return true;
  // Numbers with metric context (e.g. "12 teams", "3x improvement", "150+ clients")
  if (/\b\d+[\.,]?\d*\s*(x|\+|teams?|clients?|users?|projects?|applications?|stakeholders?|reports?)\b/i.test(bullet)) return true;
  // Numbers that aren't just years
  const numbers = bullet.match(/\b\d+[\.,]?\d*\b/g) || [];
  return numbers.some(n => !/^(19|20)\d{2}$/.test(n));
}

// Check a bullet meets UK bullet rule: verb + what + metric
export function validateBullet(bullet) {
  const issues = [];
  if (!/^(Led|Built|Shipped|Owned|Delivered|Reduced|Increased|Migrated|Launched|Drove|Managed|Designed|Implemented|Optimised|Optimized)/i.test(bullet.trim())) {
    issues.push("Start with strong past-tense verb (Led, Shipped, Delivered…)");
  }
  if (!bulletHasMetric(bullet)) issues.push("Add metric: £, %, or number (e.g. £1.2M, 18%, 12 A/B tests)");
  if (/\b(team player|hard worker|passionate)\b/i.test(bullet)) issues.push("Remove generic phrase");
  return issues;
}
