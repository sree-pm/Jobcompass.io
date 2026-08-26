// A4 Job Classifier — industry, seniority, contract type, work mode,
// salary band, UK region, tags. Batched LLM (10/call) with rule-based
// heuristic fallback when no AI is available. Never throws out of the loop.
import { routeJson, extractJson } from "../../../ai/src/index.js";

export type JobToClassify = {
  id: string;
  title: string;
  location?: string;
  job_description?: string;
  salary?: string;
};

export type Classification = {
  id: string;
  industry?: string;
  seniority?: string;
  contract_type?: string;
  work_mode?: string;
  salary_band?: string;
  uk_region?: string;
  tags?: string[];
};

export const UK_REGIONS = [
  "London", "South East", "South West", "East of England", "West Midlands",
  "East Midlands", "North West", "North East", "Yorkshire & Humber",
  "Wales", "Scotland", "Northern Ireland", "Remote-UK",
];

const BATCH_SIZE = 10;

function hasAi(env: any): boolean {
  return Boolean(env?.OPENAI_API_KEY || env?.ANTHROPIC_API_KEY || env?.DEEPSEEK_API_KEY || env?.AI_API_KEY || env?.AI || env?.ACCOUNT_ID);
}

// ── Rule-based fallback ────────────────────────────────────────────
export function classifyJobHeuristic(job: JobToClassify): Classification {
  const title = (job.title || "").toLowerCase();
  const desc = (job.job_description || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();

  // seniority
  let seniority = "mid";
  if (/intern|graduate|trainee|entry[- ]level|apprentic|junior/.test(title)) seniority = "junior";
  else if (/head of|director|vp|vice president|chief|c-level/.test(title)) seniority = "director";
  else if (/staff|principal/.test(title)) seniority = "lead";
  else if (/senior|sr\.|lead/.test(title)) seniority = "senior";

  // work mode
  let work_mode = "onsite";
  if (/fully remote|remote[- ]first|work from home|wfh/.test(desc + " " + title + " " + loc)) work_mode = "remote";
  else if (/hybrid/.test(desc + " " + title + " " + loc)) work_mode = "hybrid";

  // contract type
  let contract_type = "permanent";
  if (/contract|ftc|fixed[- ]term/.test(title)) contract_type = "contract";
  else if (/intern|apprentic|placement/.test(title)) contract_type = "internship";
  else if (/temporary|temp\b|seasonal/.test(title)) contract_type = "temp";

  // UK region from location
  let uk_region = "Remote-UK";
  const regionKeywords: [RegExp, string][] = [
    [/london/, "London"],
    [/south east|surrey|kent|sussex|hampshire|reading|guildford/, "South East"],
    [/south west|bristol|bath|devon|cornwall|gloucester|exeter|plymouth/, "South West"],
    [/east of england|cambridge|norwich|essex|suffolk|norfolk|chelmsford|luton/, "East of England"],
    [/west midlands|birmingham|coventry|wolverhampton|worcester/, "West Midlands"],
    [/east midlands|nottingham|leicester|derby|northampton/, "East Midlands"],
    [/north west|manchester|liverpool|chester|lancaster|bolton|warrington/, "North West"],
    [/north east|newcastle|durham|sunderland|middlesbrough/, "North East"],
    [/yorkshire|leeds|sheffield|york|bradford|hull/, "Yorkshire & Humber"],
    [/cardiff|swansea|wales|newport/, "Wales"],
    [/edinburgh|glasgow|aberdeen|scotland|dundee|inverness/, "Scotland"],
    [/belfast|northern ireland|derry/, "Northern Ireland"],
  ];
  if (work_mode === "remote" && !loc) uk_region = "Remote-UK";
  else {
    for (const [re, region] of regionKeywords) {
      if (re.test(loc)) { uk_region = region; break; }
    }
  }

  // industry from title keywords
  let industry = "Other";
  const industryKeywords: [RegExp, string][] = [
    [/software|engineer|developer|devops|data|ml|ai |machine learning|frontend|backend|full[- ]stack|sre|qa\b|cloud|platform|security/i, "Technology & IT"],
    [/nurse|clinical|doctor|medical|health|pharma|care assistant|gp\b/i, "Healthcare"],
    [/accountant|finance|audit|risk|compliance|actuar|treasur/i, "Financial Services"],
    [/teacher|lecturer|tutor|head teacher|academic/i, "Education"],
    [/solicitor|lawyer|legal|paralegal|barrister/i, "Professional Services"],
    [/marketing|brand|content|seo|social media|communications|pr\b/i, "Media & Creative"],
    [/sales|account executive|business development|bd\b/i, "Retail & Sales"],
    [/electrician|plumber|site manager|construction|civil|quantity surveyor|builder/i, "Construction"],
    [/chef|barista|waiter|housekeep|hospitality|hotel|restaurant/i, "Hospitality"],
    [/driver|logistics|warehouse|delivery|supply chain|forklift/i, "Transport & Logistics"],
    [/civil serv|policy|government|council|public sector|nhs admin/i, "Public Sector"],
  ];
  for (const [re, ind] of industryKeywords) {
    if (re.test(title + " " + desc.slice(0, 300))) { industry = ind; break; }
  }

  // salary band
  let salary_band = "Unspecified";
  const text = `${job.salary || ""} ${desc.slice(0, 400)}`;
  const nums = text.match(/£?\s*(\d{2,3})[,.]?(\d{3})?k?/g);
  if (nums) {
    const values = nums
      .map(n => parseInt(n.replace(/[£,\s]/g, "").replace(/k$/i, "000"), 10))
      .filter(v => !isNaN(v) && v > 5000);
    if (values.length) {
      const max = Math.max(...values);
      if (max < 25000) salary_band = "Under £25k";
      else if (max < 40000) salary_band = "£25k–£40k";
      else if (max < 60000) salary_band = "£40k–£60k";
      else if (max < 90000) salary_band = "£60k–£90k";
      else salary_band = "£90k+";
    }
  }

  // tags
  const tags: string[] = [];
  if (work_mode === "remote") tags.push("remote");
  if (work_mode === "hybrid") tags.push("hybrid");
  if (/visa sponsorship|sponsor/i.test(desc)) tags.push("visa-sponsorship");
  if (/benefits|pension|bonus/i.test(desc)) tags.push("benefits");

  return { id: job.id, industry, seniority, contract_type, work_mode, salary_band, uk_region, tags };
}

// ── Main entry — batched LLM classification with heuristic fallback ─
export async function classifyJobs(
  db: D1Database,
  jobs: JobToClassify[],
  env: any
): Promise<number> {
  let classified = 0;
  const useAi = hasAi(env);

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    let results: Classification[] = [];

    // 1) Try LLM batch
    if (useAi) {
      try {
        const prompt = `Classify each job below. Reply with a JSON array matching the input order.
Each element must have keys: id, industry, seniority (one of: junior|mid|senior|lead|director), contract_type (one of: permanent|contract|temp|internship), work_mode (one of: hybrid|remote|onsite), salary_band (one of: Unspecified|Under £25k|£25k–£40k|£40k–£60k|£60k–£90k|£90k+), uk_region (one of: ${UK_REGIONS.join("|")}), tags (array of up to 4 short lowercase tags).
UK jobs only. Use the job description to infer work_mode and industry.

JOBS:
${batch.map(j => `- id="${j.id}" | title: ${j.title} | location: ${j.location || "unknown"} | description: ${(j.job_description || "").slice(0, 400)}`).join("\n")}`;

        const parsed = await routeJson<Classification[]>("classify", [{ role: "user", content: prompt }], env, [], { maxTokens: 2500, temperature: 0.1 });
        if (Array.isArray(parsed) && parsed.length) results = parsed;
      } catch (e: any) {
        console.error(`classifyJobs: LLM batch ${i} failed, using heuristics:`, e?.message);
        results = [];
      }
    }

    // 2) Fill gaps with heuristics (also full fallback when no AI)
    const byId = new Map(results.map(r => [r?.id, r]));
    for (const job of batch) {
      let cls = byId.get(job.id);
      if (!cls || typeof cls !== "object") cls = classifyJobHeuristic(job);
      // patch any missing keys with heuristic values
      const h = classifyJobHeuristic(job);
      const merged: Classification = {
        id: job.id,
        industry: cls.industry || h.industry,
        seniority: cls.seniority || h.seniority,
        contract_type: cls.contract_type || h.contract_type,
        work_mode: cls.work_mode || h.work_mode,
        salary_band: cls.salary_band || h.salary_band,
        uk_region: cls.uk_region || h.uk_region,
        tags: Array.isArray(cls.tags) && cls.tags.length ? cls.tags.slice(0, 4) : h.tags,
      };
      try {
        await db
          .prepare(
            "UPDATE jobs SET industry = ?, seniority = ?, contract_type = ?, work_mode = ?, salary_band = ?, uk_region = ?, tags = ? WHERE id = ?"
          )
          .bind(merged.industry, merged.seniority, merged.contract_type, merged.work_mode, merged.salary_band, merged.uk_region, JSON.stringify(merged.tags), job.id)
          .run();
        classified++;
      } catch (e: any) {
        console.error(`classifyJobs: update failed for ${job.id}:`, e?.message);
      }
    }
  }

  return classified;
}
