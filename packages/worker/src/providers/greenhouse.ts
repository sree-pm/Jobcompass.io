// Greenhouse public Boards API → ATS adapter (no API key)
// Docs: https://developers.greenhouse.io/harvest.html#job-board
// Endpoint: https://boards-api.greenhouse.io/v1/boards/{BOARD_TOKEN}/jobs?content=true
import type { JobLike } from "./ats-common.js";

export async function searchGreenhouse({ board, company }: { board: string; company?: string }): Promise<JobLike[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`;
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`Greenhouse ${r.status}: ${await r.text().then(s => s.slice(0, 500))}`);
  const data: any = await r.json();
  return (data.jobs || []).map((j: any) => ({
    title: j.title,
    company: company || data.name || board,
    location: j.location?.name || "",
    salary: "",
    url: j.absolute_url,
    description: j.content || "",
    created: j.updated_at || "",
  }));
}

// Fetch several boards and filter jobs client-side: every whitespace token of the query must appear in the title.
export async function searchGreenhouseBoards(boards: string[], query: string): Promise<JobLike[]> {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = await Promise.allSettled(boards.map(b => searchGreenhouse({ board: b })));
  const jobs: JobLike[] = [];
  for (const res of results) {
    if (res.status === "fulfilled") jobs.push(...res.value);
  }
  if (tokens.length === 0) return jobs;
  return jobs.filter(j => tokens.every(t => j.title.toLowerCase().includes(t)));
}
