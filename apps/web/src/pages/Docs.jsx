import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
export default function Docs(){
  const Card=({title,code,desc})=> <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}><div style={{ fontWeight:700, fontSize:13 }}>{title}</div><div style={{ fontSize:11, fontFamily:T.mono, color:T.muted, marginTop:4 }}>{code}</div><div style={{ fontSize:12, color:T.muted, marginTop:6, lineHeight:1.5 }}>{desc}</div></div>;
  return (
    <MarketingLayout>
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Docs</h1>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginTop:16 }}>
          <Card title="Agent Flow" code="docs/AGENT_FLOW.md:1" desc="12 stages registry→apply. Tailor DeepSeek + verifier Haiku, validate, quickVerify, corrective ≤10, HITL gate, PDF A4, apply dispatch." />
          <Card title="UK CV Spec" code="docs/UK_CV_SPEC.md:1" desc="A4, GBP, British spelling, Equality Act, DID/DID NOT, 3-sentence summary, 300-340w cover letter." />
          <Card title="Design System" code="docs/DESIGN_SYSTEM.md:1 · Theme.js:1" desc="Single token source T.* Stripe × Linear, guard in CI, 6/8/12/16 radii, 56px nav, 280px kanban." />
          <Card title="E2E Walkthrough" code="docs/E2E_WALKTHROUGH.html:1" desc="5 flows: onboarding → pipeline → tailor → verifier → PDF → apply." />
          <Card title="AI Router" code="packages/ai/src/index.ts:217" desc="routeChat task→provider, AI_GATEWAY_URL caching, fallback legacy→openai→workersai." />
          <Card title="DB Schema" code="apps/api/drizzle/schema.sql:1" desc="D1 8 tables + credit_transactions unique reference_id, jobs source_url unique, companies name unique." />
        </div>
        <div style={{ marginTop:20, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontWeight:700 }}>Quick start</div>
          <pre style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:12, fontSize:11, overflow:"auto", marginTop:8 }}>{`pnpm install
pnpm dev:api   # http://localhost:8789 — D1 local + /init
pnpm dev       # http://localhost:5173
wrangler deploy --config apps/api/wrangler.toml
wrangler deploy --config apps/web/wrangler.toml`}</pre>
        </div>
      </section>
    </MarketingLayout>
  );
}
