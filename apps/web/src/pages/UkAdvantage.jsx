import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
export default function UkAdvantage(){
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:32, fontWeight:800 }}>UK advantage — not a US port</h1>
        <p style={{ color:T.muted, lineHeight:1.6 }}>US tools get A4, spelling, salary and compliance wrong. We enforce UK correctness at the registry level — not as an afterthought.</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:20 }}>
          {[
            ["A4, not Letter", "pdf.ts:66 @page size:A4, 16/18mm margins, Calibri 10pt. US Letter tools clip UK printing."],
            ["GBP only", "tailor.ts:35 salary '£45,000–£55,000'. Verifier errors if $ present. Matcher extracts £k."],
            ["British spelling", "fieldRegistry.js:194 checkBritishSpelling \\b word-boundary — optimise/organisation/prioritise/behaviour/analyse/customise. Verifier warning per op."],
            ["Equality Act", "fieldRegistry.js:70 photo/DOB/marital/nationality/NI number blocked. Locked field diff re-checked post-LLM."],
            ["Companies House", "companies-house.ts:46 Basic auth, matchScore, trust 80 active else 20, SIC→industry sic-industry-map.ts"],
            ["SIC → industry", "A4 classifier maps SIC codes to Technology/Finance/Healthcare etc. Free 600 req/5min."],
            ["Banned phrases", "team player/hard worker/passionate about removed. Cover letter understated 300-340w, mentions company twice."],
            ["Right to work", "candidates.right_to_work + notice_period + constraints DID/DID NOT ground truth, confidence cap 70 without it."],
            ].map(([t,d])=> (
            <div key={t} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>{t}</div><div style={{ color:T.muted, marginTop:6, lineHeight:1.5, fontFamily: T.mono, fontSize:11 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
