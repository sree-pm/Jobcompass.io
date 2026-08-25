// Reed.co.uk API → custom MCP adapter
// Docs: https://www.reed.co.uk/developers/jobseeker
// Env: REED_API_KEY (Basic auth: base64(key + ":"))
export type ReedJob = { title: string; company: string; location: string; salary: string; url: string; description: string };

export async function searchReed(
  { query, location, distance = 25 }: { query: string; location?: string; distance?: number },
  env: { REED_API_KEY: string }
): Promise<ReedJob[]> {
  if (!env.REED_API_KEY) throw new Error("REED_API_KEY missing");
  const params = new URLSearchParams({ keywords: query, locationName: location || "London", distanceFromLocation: String(distance), resultsToTake: "20" });
  const url = `https://www.reed.co.uk/api/1.0/search?${params}`;
  const r = await fetch(url, { headers: { Authorization: `Basic ${btoa(env.REED_API_KEY + ":")}` } });
  if (!r.ok) throw new Error(`Reed ${r.status}: ${await r.text().then(s => s.slice(0, 500))}`);
  const data: any = await r.json();
  return (data.results || []).map((j: any) => ({
    title: j.jobTitle,
    company: j.employerName || "Unknown",
    location: j.locationName || location || "UK",
    salary: j.minimumSalary && j.maximumSalary ? `£${j.minimumSalary.toLocaleString("en-GB")} – £${j.maximumSalary.toLocaleString("en-GB")}` : j.minimumSalary ? `£${j.minimumSalary.toLocaleString("en-GB")}` : "",
    url: j.jobUrl,
    description: j.jobDescription || "",
  }));
}
