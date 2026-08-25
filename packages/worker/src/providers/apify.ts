// Apify ATS feed — covers Greenhouse/Lever/Workday career pages (27k boards)
// Tool: starbright_overlap/ats-job-feed via https://mcp.apify.com/?tools=starbright_overlap/ats-job-feed
// Env: APIFY_TOKEN
export type ApifyJob = { title: string; company: string; location: string; url: string; description: string };

export async function searchApifyAts(
  { query, location }: { query: string; location?: string },
  env: { APIFY_TOKEN: string }
): Promise<ApifyJob[]> {
  if (!env.APIFY_TOKEN) throw new Error("APIFY_TOKEN missing");
  // Call Apify actor via REST — actor: starbright_overlap/ats-job-feed
  // We use the MCP endpoint if available; fallback to direct actor run
  const actor = "starbright_overlap~ats-job-feed";
  const input = { query, location: location || "United Kingdom", maxItems: 20 };
  const runUrl = `https://api.apify.com/v2/acts/${actor}/runs`;
  const r = await fetch(runUrl, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.APIFY_TOKEN}` }, body: JSON.stringify(input) });
  if (!r.ok) throw new Error(`Apify run ${r.status}: ${await r.text().then(s => s.slice(0, 500))}`);
  const run: any = await r.json();
  const datasetId = run.data?.defaultDatasetId;
  if (!datasetId) return [];
  // poll dataset
  await new Promise(res => setTimeout(res, 4000));
  const ds = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?limit=20`, { headers: { "Authorization": `Bearer ${env.APIFY_TOKEN}` } }).then(x => x.json() as any);
  return (Array.isArray(ds) ? ds : []).map((j: any) => ({
    title: j.title || j.jobTitle || "Unknown",
    company: j.company || j.companyName || "Unknown",
    location: j.location || location || "UK",
    url: j.url || j.jobUrl || "",
    description: j.description || j.text || "",
  }));
}
