# UK Market Spec — Agentic CV + Job Finding

## 1. UK CV Standard (ATS-friendly, ICO/GDPR compliant)

**Format**
- Length: 1 page (<3 yrs exp), 2 pages max (>3 yrs). Enforce in `metadata.page.format="a4"` `packages/pdf` — never letter.
- Sections (exact headings for ATS): `Personal Profile`, `Core Competencies`, `Professional Experience`, `Education`, `Certifications` — maps to `sections.*` in `packages/schema/src/resume/data.ts`
- Font: Calibri/Arial 10-11pt, single column. No tables/images/text boxes/headers/footers — ATS (Workday/Greenhouse/Taleo UK) strips them.
- Dates: `MM/YYYY – MM/YYYY` or `Present`, e.g. `03/2021 – Present`. UK date in cover letter: `23 August 2026`.
- British spelling enforced: `optimise, organisation, prioritise, behaviour` — agent rule blocks US spell.

**Personal Details (Top)**
- `basics.name, basics.email, basics.phone (+44), basics.location (City, Region only — not full address), basics.website` (LinkedIn/portfolio)
- **MUST NOT** include: photo, DOB, age, marital status, gender, nationality, NI number — illegal to request under Equality Act 2010 + GDPR. Agent `forbidden_fields` blocks.
- Optional UK field: `rightToWork: "British Citizen | Settled Status | Skilled Worker visa (expiry MM/YYYY)"` — store in `customFields[]` or extend schema.

**Bullet Rule (Agent-enforced)**
- Every bullet: `[Strong past-tense verb] + [what you did] + [quantified result]`
- Example: `Led migration of checkout to Stripe, reducing failed payments by 18% (£1.2M recovered ARR)`
- Include £ metrics for UK roles, % where possible. No `team player / hard worker / passionate` generics.

**UK Tone**
- Cover letter: understated, team-oriented, confident but not boastful. Ban: `I believe I would be a great fit`. Close with specific CTA: `Available for interview w/c 1 September — happy to discuss how X maps to Y`.

## 2. Agent Instructions — UK Dos/Donts Template (stored per-candidate)

```json
{
  "agent_instructions": {
    "locale": "en-GB",
    "currency": "GBP",
    "page": { "format": "a4", "maxPages": 2 },
    "allowed_fields": [
      "summary.content",
      "sections.experience.items[].description",
      "sections.skills.items",
      "sections.projects.items[].description",
      "customSections[?(@.type=='cover-letter')]"
    ],
    "forbidden_fields": [
      "basics.name", "basics.email", "basics.phone", "basics.location",
      "sections.education", "sections.certifications",
      "picture"
    ],
    "rules": [
      "Use British spelling (optimise, organisation). Never US spelling.",
      "Never invent experience not in DID list or constraintsDoc. Label inference as [Inference].",
      "Never add photo, DOB, marital status, gender, NI number.",
      "Every keyword appearing 2+ times in JD must appear 2+ times in CV.",
      "Every bullet must contain a metric (£, %, number). If no metric exists, flag [Verify].",
      "ATS headings must be exactly: Personal Profile, Core Competencies, Professional Experience, Education, Certifications",
      "Summary: 3 sentences, opens with exact target job title from JD.",
      "Cover letter: 300-340 words, no 'I am writing to apply', mention company name twice."
    ],
    "uk_checks": [
      "Right-to-work status preserved, never altered",
      "Salary expectations in GBP only, format £45,000 – £55,000",
      "Location: City/Remote/Hybrid — use UK regions (London, Manchester, Midlands, Scotland)"
    ]
  }
}
```

Stored in `metadata.notes` or new `metadata.agentInstructions JSONB` — validated before every `PATCH /resumes/{id}` (`packages/api` middleware). Confidence Score capped at 70 if `constraintsDoc` missing (as in `JobCompass_v2.2.jsx`).

## 3. UK Job Sources → MCP Mapping

| Source | UK Coverage | MCP / API | Priority |
|--------|-------------|-----------|----------|
| **Indeed UK** | Largest volume | `https://mcp.indeed.com/claude/mcp` — query `q=Software Engineer&l=London, UK&radius=25` | P0 — wire first |
| **Adzuna UK** | Strong UK, official API | REST `https://developer.adzuna.com` → wrap as custom MCP server (30-day free) | P0 — best UK filter (salary GBP, contract type) |
| **Reed.co.uk** | UK-only, 200k+ live | No official MCP — build custom MCP via Reed API `https://www.reed.co.uk/developers` | P1 |
| **Totaljobs / CV-Library / Jobsite** | UK volume | Scraping via Apify ATS feed `https://mcp.apify.com/?tools=starbright_overlap/ats-job-feed` covers Greenhouse/Lever/Workday UK career pages (27k+ boards) | P1 |
| **LinkedIn UK** | Premium | No public MCP — use Apify actor or manual paste (JD HTML → extract via your `extractJobFromFile` logic) | P1 — high intent |

**Daily Ingest Cron (UK filters):**
```
location: ["London","Manchester","Birmingham","Edinburgh","Remote UK"]
salary: GBP, e.g. 30000-80000
employmentType: permanent, contract, fixed-term
rightToWork filter: don't surface "UK sponsorship unavailable" unless candidate has visa flag
```

Store: `POST /applications {company, role, location, salary:"£55,000", source:"reed", sourceUrl, jobDescription, tags:["UK","London"], status:"saved", resumeId:masterId}`

## 4. Architecture — UK Headless

```
[UK MCPs] -> Ingest Worker (Node cron, 06:00 GMT) -> Reactive Resume (Docker: Postgres + Hono + pdf/server)
                                              -> Duplicate + PATCH tailored CV (JSON Patch, A4, en-GB)
                                              -> POST /applications/{id}/ai/draft-message (cover letter)
                                              -> Dashboard (Next.js, reuses JobCompass UI: Pipeline, Jobs table, Companies)
                                                          -> Candidate checks PDF (A4) + clicks sourceUrl -> PUT status:"applied"
```

**Reactive Overrides for UK:**
- `packages/schema/src/resume/data.ts` — add `rightToWork` to `basics.customFields` or extend type; lock `picture.hidden=true` default
- `packages/pdf/src/templates/*` — default to A4, British date locale, no photo rendering
- `packages/api/src/features/applications/ai.ts` — replace `tailorResume` prompt with UK rubric (British spelling, 2-page, £ metrics)
- `apps/server/.env` — `APP_URL=https://uk.yourdomain.com`, `DATABASE_URL`, `AUTH_SECRET`, `S3_*` for PDFs, `REDIS_URL` if using agent workspace

**GDPR (ICO):**
- Lawful basis: legitimate interest + consent at onboarding (explicit tick: "Store my CV to tailor daily applications")
- Retention: auto-archive `Rejected` >90 days (your `compressJob` logic), `DELETE /resumes/{id}` hard delete, data export via `GET /resumes/{id}` JSON
- No protected characteristics in CV — enforce in agent guard.

## 5. Pricing UK

- 1 credit = 1 complete application (search + tailoring + cover letter + A4 PDF) = **£0.10**
- Packs: `£10=100`, `£25=250`, `£50=500` — prepaid, never expire, no auto-renewal (matches your £0.02-0.04 COGS, 60-84% margin)
- Stripe Checkout GBP, VAT inclusive, invoice for UK Ltd.

## 6. Build Order (UK-first)

1. `docker compose up -d` Reactive with A4 defaults
2. Add `agent_instructions` validation middleware
3. Wire Indeed UK + Adzuna MCP ingest with GBP/location filters
4. Port JobCompass `Onboarding/Constraints` + `Dashboard/Pipeline/Companies` to Next.js dashboard reading `GET /applications`
5. UK ATS test: run 10 CVs through Workday/Greenhouse parsers, iterate prompts

See `compose.yml` and `apps/dashboard` scaffold next.
