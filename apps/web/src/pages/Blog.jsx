import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
const POSTS=[
  { slug:"british-cv-vs-resume", title:"British CV vs Resume — what UK ATS expects", excerpt:"Personal Profile not Objective, Core Competencies, A4 no photo/DOB, £ metrics. US Letter tools clip UK printing — we render @page size:A4.", body:"UK recruiters scan for 'Personal Profile' (3 sentences, opens with JD title), 'Core Competencies' and 'Professional Experience'. US 'Objective' and Letter size fail UK parsing. JobCompass enforces A4 16/18mm Calibri 10pt pdf.ts:66, British spelling checkBritishSpelling fieldRegistry.js:194, and blocks Equality Act traits." },
  { slug:"ats-keywords-uk", title:"ATS keywords UK — the 2× rule that gets interviews", excerpt:"Every keyword appearing 2× in JD must appear 2× in CV. We enforce it in tailor + verifier, not just score it.", body:"JobScan scores; we fix. tailor.ts:36 enforces keyword 2×, verifier.ts:40 checks coverage and emits correctiveOperations. Misses get auto-fix ≤10 ops re-validated against registry. Study: tailored lifts interviews ~115%." },
  { slug:"did-did-not-ground-truth", title:"DID / DID NOT — stop hallucinating your CV", excerpt:"Confidence cap 70 without DID. Verifier re-diffs every locked field — generic filler rejected.", body:"ConstraintsBuilder DID/DID NOT is ground truth. verifier.ts:116 caps confidence 70 if len<50, matcher.ts:73 same. Hallucinated skill vs DID = error + revert. Every bullet must be Verb+what+£/%/number or [Verify]." },
  { slug:"companies-house-trust", title:"Companies House trust — not all UK jobs are real", excerpt:"SIC→industry, active 80 else 20, Brave website, hiring_confidence 0-100. Enriched once globally, shared.", body:"company-enricher.ts:16 enriches once per name, caches enriched_at. SIC codes map via sic-industry-map, trust 80 active else 20, website via Brave 2K/mo free. career-verifier.ts fetches source_url, scores title/salary/company/dead-phrase + LLM 50/50 blend." },
];
export default function Blog(){
  React.useEffect(()=>{ document.title="Blog — JobCompass UK CV advice"; },[]);
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Blog — UK CV advice that beats US tools</h1>
        <p style={{ color:T.muted }}>SEO traps built to outrank generic US-centric tools. Each post ties to a code proof.</p>
        <div style={{ display:"grid", gap:12, marginTop:16 }}>
          {POSTS.map(p=> (
            <article key={p.slug} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:18 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.06em", color:T.hint }}>/blog/{p.slug}</div>
              <div style={{ fontWeight:800, fontSize:16, marginTop:4 }}>{p.title}</div>
              <div style={{ fontSize:13, color:T.text, marginTop:6, lineHeight:1.6 }}>{p.excerpt}</div>
              <div style={{ fontSize:12, color:T.muted, marginTop:8, lineHeight:1.6, background: T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:10 }}>{p.body}</div>
            </article>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
