// Lever public postings API → ATS adapter (no API key)
// Docs: https://hire.lever.co/developer/documentation
// Endpoint: https://api.lever.co/v0/postings/{COMPANY}?mode=json&limit=25
import type { JobLike } from "./ats-common.js";

export async function searchLever({ company }: { company: string }): Promise<JobLike[]> {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json&limit=25`;
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`Lever ${r.status}: ${await r.text().then(s => s.slice(0, 500))}`);
  const data: any = await r.json();
  return (Array.isArray(data) ? data : []).map((j: any) => ({
    title: j.text,
    company: company,
    location: j.categories?.location || "",
    salary: "",
    url: j.hostedUrl,
    description: j.categories?.commitment || "",
    created: typeof j.createdAt === "number" ? new Date(j.createdAt).toISOString() : (j.createdAt || ""),
  }));
}
