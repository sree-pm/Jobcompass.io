# Agentic CV — UK First (Cloudflare-native)

Daily job finding + per-job CV tailoring for UK candidates. Bullet-level field locks + two-pass agentic patch (tailor + verifier) + A4 GBP PDFs. Candidate checks diff, approves, clicks source URL, applies.

## Architecture (Cloudflare stack — fully agnostic AI)

```
[Adzuna UK / Reed / Apify 27k ATS] ─┐
                                     ├─► Cloudflare Worker API (Hono) ─► D1 (candidates, resumes, locks, apps) ─► R2 (A4 PDFs)
[Dashboard — Vite React on Pages] ───┘         │                        └─► Queue (ingest) + Cron 06:00 GMT
                                              ├─► @agentic-cv/ai (OpenAI-compatible) — tailor + verifier agents
                                              └─► /mcp tools (list_resumes, apply_resume_patch, tailor_resume)
```

* **API Worker** `apps/api` — Hono on Workers, D1 + R2 + KV + Queue + Cron. No Postgres. See `apps/api/wrangler.toml:1`.
* **Field registry** `packages/schema/fieldRegistry.js:1` — every bullet/paragraph is an atomic field with `editable:true/false`, `requiresMetric`, `lockReason`. Agent may ONLY `PATCH` editable paths; validated by `validatePatchOperations:71` (British spelling, banned phrases, Equality Act).
* **AI** `packages/ai/src/index.ts:1` — OpenAI-compatible provider (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` via `wrangler secret put`). Swap OpenAI / OpenRouter / Groq / Together / local vLLM without code change.
* **Agents** `apps/api/src/agents/tailor.ts:1` (editable fields only, £ metrics, 3-sentence summary) + `apps/api/src/agents/verifier.ts:1` (hallucination, locked-field, metric, ATS-heading, GBP checks + `confidenceScore` + `correctiveOperations` auto-fix).
* **Ingest** `packages/worker/src/providers/{adzuna,reed,apify}.ts` + `packages/worker/src/ingest.ts:1` — dedupe by URL, GBP/location filters, writes `applications` + `ingest_runs`.
* **Dashboard** `apps/web` — Vite React (JobCompass v2.2 artifact `apps/web/src/App.jsx:1`) + `FieldLocks.jsx:1` (🔒/✏️ toggles) + `TailorPanel.jsx:1` (diff + verifier report) wired via `lib/cloudflareApi.js:1`. Deploy to Pages (`apps/web/wrangler.toml:1`).

## Quick Start (local — no Cloudflare account needed for first run)

> **Default:** `pnpm dev:api` (Wrangler + D1 local, no Docker). `docker compose up` (`compose.yml`) is **optional legacy** — local Reactive Resume reference only; production is Cloudflare Workers (D1/R2/KV/Queue/Cron).

```bash
pnpm install
# 1. API Worker with D1 local — default (no Docker)
pnpm dev:api        # http://localhost:8787  (creates D1, runs migrations on /init)
curl http://localhost:8787/init
curl http://localhost:8787/health

# 2. Web
pnpm dev            # http://localhost:5173

# 3. Tests
node packages/schema/fieldRegistry.test.js
```

## Cloudflare Deploy

```bash
# create resources once
wrangler d1 create agentic-cv-uk
wrangler r2 bucket create agentic-cv-pdfs
wrangler kv namespace create CACHE
wrangler queues create ingest-queue

# update ids in apps/api/wrangler.toml, then
wrangler d1 execute agentic-cv-uk --file=apps/api/drizzle/schema.sql

# secrets (never in toml)
wrangler secret put AI_API_KEY --config apps/api/wrangler.toml
wrangler secret put AI_BASE_URL --config apps/api/wrangler.toml  # e.g. https://openrouter.ai/api/v1
wrangler secret put AI_MODEL --config apps/api/wrangler.toml     # e.g. openai/gpt-4o-mini
wrangler secret put ADZUNA_APP_ID
wrangler secret put ADZUNA_APP_KEY
wrangler secret put REED_API_KEY
wrangler secret put APIFY_TOKEN

pnpm deploy:api
pnpm build && wrangler deploy --config apps/web/wrangler.toml
```

## UK Spec

See `docs/UK_CV_SPEC.md` — 2 pages max A4, British spelling, no photo/DOB (Equality Act 2010), GBP salary, right-to-work, GDPR retention. Enforced in `packages/schema/fieldRegistry.js` + `apps/web/src/lib/ukValidation.js:1`.

## Field Locks (your edit on/off idea — bullet-level)

Each bullet is a separate field. Candidate toggles 🔒/✏️ in dashboard; stored `field_locks` (D1). Agent receives only `editable:true` paths. Second-pass verifier re-reads full CV to find mismatches/hallucinations and emits corrective patch. Confidence capped at 70 if `constraintsDoc` missing (JobCompass pattern).

## Pricing UK

1 credit = 1 application = £0.10, packs £10/100, £25/250, £50/500, prepaid never expire.

## Next

- Wire Apify Browser Rendering for true PDF binary (currently A4 HTML stored to R2; client print-to-PDF).
- Add Cloudflare Access / API key auth to `candidates` routes.
- Stripe Checkout GBP for credit packs.
