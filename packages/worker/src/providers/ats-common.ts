// Shared types + helpers for free ATS board providers (Greenhouse / Lever / Ashby).
// No API keys needed — all endpoints are public job-board APIs.

export type JobLike = { title: string; company: string; location: string; salary: string; url: string; description: string; created: string };

// Normalise a URL for dedupe: parse, drop hash, sort query params, lowercase, strip trailing slash.
export function normaliseUrl(u: string): string {
  try {
    const parsed = new URL(u);
    parsed.hash = "";
    parsed.searchParams.sort();
    return parsed.toString().toLowerCase().replace(/\/$/, "");
  } catch {
    return u.trim().toLowerCase().replace(/\/+$/, "");
  }
}
