// A2 Company Enricher — wraps Companies House + website finder, cached in D1.
// Contract (used by pipeline.ts): enrichCompany(db, companyId, name, env)
// Enriches once per company; subsequent calls are cache hits (SELECT first).
import { searchCompany } from "./companies-house.js";
import { sicToIndustry } from "./sic-industry-map.js";

export type EnrichResult = {
  companyId: string;
  enriched: boolean;
  cached: boolean;
  industry?: string;
  website?: string;
  status?: string;
};

export async function enrichCompany(
  db: D1Database,
  companyId: string,
  companyName: string,
  env: any
): Promise<EnrichResult> {
  // ── Cache hit: already enriched ─────────────────────────────────
  try {
    const existing: any = await db
      .prepare("SELECT id, enriched_at FROM companies WHERE id = ?")
      .bind(companyId)
      .first();
    if (existing?.enriched_at) {
      return { companyId, enriched: false, cached: true };
    }
  } catch {
    // fall through — enrich anyway
  }

  let companyNumber: string | null = null;
  let status: string | null = null;
  let sicCodes: string[] = [];
  let registeredOffice: string | null = null;
  let industry: string | null = null;
  let trustScore = 50;

  // ── (a) Companies House — FREE, 600 req/5min ────────────────────
  if (env.COMPANIES_HOUSE_API_KEY) {
    try {
      const hit = await searchCompany(companyName, env.COMPANIES_HOUSE_API_KEY);
      if (hit) {
        companyNumber = hit.company_number;
        status = hit.company_status || null;
        sicCodes = hit.sic_codes || [];
        registeredOffice = hit.registered_office_address
          ? [hit.registered_office_address.address_line_1, hit.registered_office_address.locality, hit.registered_office_address.postal_code]
              .filter(Boolean)
              .join(", ")
          : null;
        industry = sicToIndustry(sicCodes);
        trustScore = status && status.toLowerCase() === "active" ? 80 : 20;
      }
    } catch (e: any) {
      console.error(`enrichCompany: Companies House failed for ${companyName}:`, e?.message);
    }
  }

  // ── (b) Website lookup via Brave Search (free tier 2K/mo) ───────
  let website: string | null = null;
  if (env.BRAVE_API_KEY) {
    try {
      const q = encodeURIComponent(`${companyName} official website`);
      const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${q}&count=1`, {
        headers: { "X-Subscription-Token": env.BRAVE_API_KEY, Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data: any = await res.json();
        const first = data?.web?.results?.[0];
        if (first?.url) website = first.url;
      }
    } catch (e: any) {
      console.error(`enrichCompany: Brave website lookup failed for ${companyName}:`, e?.message);
    }
  }

  // ── (c) careers_url: left null — A3 discovers it during verification ──

  // ── (d) Persist ─────────────────────────────────────────────────
  try {
    await db
      .prepare(
        "UPDATE companies SET company_number = ?, status = ?, sic_codes = ?, industry = ?, website = ?, registered_office = ?, trust_score = ?, enriched_at = datetime('now') WHERE id = ?"
      )
      .bind(
        companyNumber,
        status,
        JSON.stringify(sicCodes),
        industry,
        website,
        registeredOffice,
        trustScore,
        companyId
      )
      .run();
  } catch (e: any) {
    console.error(`enrichCompany: persist failed for ${companyName}:`, e?.message);
  }

  return { companyId, enriched: true, cached: false, industry: industry || undefined, website: website || undefined, status: status || undefined };
}
