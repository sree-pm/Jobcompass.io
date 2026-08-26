// Companies House REST API adapter (free tier)
// Docs: https://developer-specs.company-information.service.gov.uk/api-docs/
// Auth: HTTP Basic — API key as username, empty password → base64(key + ":")
const BASE = "https://api.company-information.service.gov.uk";

export type CompanySummary = {
  company_number: string;
  title: string;
  company_status: string | null;
  sic_codes: string[];
  registered_office_address: Record<string, string> | null;
  date_of_creation: string | null;
};

function authHeader(key: string): string {
  return `Basic ${btoa(key + ":")}`;
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Score a candidate title against the query.
 * Exact > startsWith > includes; all compared lowercased/punctuation-stripped.
 */
function matchScore(query: string, title: string): number {
  const q = normalise(query);
  const t = normalise(title);
  if (!q || !t) return -1;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  if (q.includes(t)) return 40;
  // token overlap fallback: every query token present in title
  const qTokens = q.split(" ").filter(Boolean);
  if (qTokens.length && qTokens.every(tok => t.includes(tok))) return 30;
  return 0;
}

/**
 * Search Companies House by name and return the best-matching company,
 * enriched with its full profile (SIC codes, registered office, creation date).
 * Returns null when nothing matches or the API is unavailable.
 */
export async function searchCompany(name: string, key: string): Promise<CompanySummary | null> {
  const url = `${BASE}/search/companies?q=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    headers: { Authorization: authHeader(key) },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const body = await res.text().then(s => s.slice(0, 300)).catch(() => "");
    throw new Error(`Companies House search ${res.status}: ${body}`);
  }
  const data: any = await res.json();
  const items: any[] = Array.isArray(data?.items) ? data.items : [];
  if (items.length === 0) return null;

  let best: any = items[0];
  let bestScore = matchScore(name, best?.title || "");
  for (const item of items.slice(1)) {
    const score = matchScore(name, item?.title || "");
    if (score > bestScore) { best = item; bestScore = score; }
  }
  if (!best?.company_number) return null;

  // Search results omit SIC codes and creation date — pull the full profile.
  const details = await getCompanyDetails(best.company_number, key).catch(() => null);
  return {
    company_number: best.company_number,
    title: best.title,
    company_status: details?.company_status ?? best.company_status ?? null,
    sic_codes: details?.sic_codes ?? [],
    registered_office_address: details?.registered_office_address ?? best.address ?? null,
    date_of_creation: details?.date_of_creation ?? null,
  };
}

/**
 * GET /company/NUMBER — full company profile.
 */
export async function getCompanyDetails(companyNumber: string, key: string): Promise<any> {
  const res = await fetch(`${BASE}/company/${encodeURIComponent(companyNumber)}`, {
    headers: { Authorization: authHeader(key) },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const body = await res.text().then(s => s.slice(0, 300)).catch(() => "");
    throw new Error(`Companies House profile ${res.status}: ${body}`);
  }
  return res.json();
}
