// Ashby public posting API → ATS adapter (no API key)
// Docs: https://developers.ashbyhq.com/reference/the-job-board-api
// Endpoint: https://api.ashbyhq.com/posting-api/job-board/{ORG}?includeCompensation=true
import type { JobLike } from "./ats-common.js";

export async function searchAshby({ org }: { org: string }): Promise<JobLike[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(org)}?includeCompensation=true`;
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`Ashby ${r.status}: ${await r.text().then(s => s.slice(0, 500))}`);
  const data: any = await r.json();
  return (data.jobs || []).map((j: any) => ({
    title: j.title,
    company: j.orgName || data.orgName || org,
    location: j.location || "",
    salary: "",
    url: j.jobUrl,
    description: j.descriptionHtml || "",
    created: j.postedAt || "",
  }));
}
