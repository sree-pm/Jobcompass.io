// Adzuna UK API → custom MCP adapter
// Docs: https://developer.adzuna.com/docs/search
// Env: ADZUNA_APP_ID, ADZUNA_APP_KEY
export type AdzunaJob = { title: string; company: string; location: string; salary: string; url: string; description: string; created: string };

export async function searchAdzuna(
  { query, location, salaryMin, page = 1 }: { query: string; location?: string; salaryMin?: number; page?: number },
  env: { ADZUNA_APP_ID: string; ADZUNA_APP_KEY: string }
): Promise<AdzunaJob[]> {
  if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) throw new Error("Adzuna credentials missing");
  const params = new URLSearchParams({
    app_id: env.ADZUNA_APP_ID,
    app_key: env.ADZUNA_APP_KEY,
    results_per_page: "20",
    what: query,
    where: location || "London",
    sort_by: "date",
    max_days_old: "7",
  });
  if (salaryMin) params.set("salary_min", String(salaryMin));
  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/${page}?${params}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Adzuna ${r.status}: ${await r.text().then(s => s.slice(0, 500))}`);
  const data: any = await r.json();
  return (data.results || []).map((j: any) => ({
    title: j.title,
    company: j.company?.display_name || "Unknown",
    location: j.location?.display_name || location || "UK",
    salary: j.salary_min && j.salary_max ? `£${Math.round(j.salary_min).toLocaleString("en-GB")} – £${Math.round(j.salary_max).toLocaleString("en-GB")}` : "",
    url: j.redirect_url,
    description: j.description || "",
    created: j.created,
  }));
}
