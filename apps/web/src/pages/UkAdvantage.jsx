import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
import { usePageMeta } from "../lib/usePageMeta.js";
export default function UkAdvantage(){
  usePageMeta("UK advantage — JobCompass", "A4 not Letter, GBP only, British spelling enforced and Equality Act compliance — UK correctness at the registry level, not an afterthought.", "/uk-advantage");
  React.useEffect(()=>{ document.title="UK advantage — JobCompass"; },[]);
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:32, fontWeight:800 }}>UK advantage — not a US port</h1>
        <p style={{ color:T.muted, lineHeight:1.6 }}>US tools get A4, spelling, salary and compliance wrong. We enforce UK correctness at the registry level — not as an afterthought.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginTop:20 }}>
          {[
            ["A4, not Letter", "We render at A4 with 16/18mm margins in Calibri 10pt. US Letter templates clip when UK recruiters print."],
            ["GBP only", "Salary is always £45,000–£55,000. Dollar signs are rejected and matcher extracts £k bands correctly."],
            ["British spelling", "Optimise, organisation, prioritise — word-boundary checked. US spelling is flagged per bullet before you see it."],
            ["Equality Act", "Photo, date of birth, marital status and NI number are blocked. Locked fields are re-checked after the AI edits."],
            ["Companies House", "Every employer is looked up at Companies House. Active companies score 80, dissolved 20, with SIC → industry mapping."],
            ["SIC → industry", "Official SIC codes map every employer to Technology, Finance, Healthcare and more, so roles land in the right industry for you."],
            ["Banned phrases", "Team player and hard worker are removed. Cover letters are 300–340 words, understated, mentioning the company twice."],
            ["Right to work", "Right-to-work and notice period are part of your ground truth. Without them confidence is capped at 70."],
            ].map(([t,d])=> (
            <div key={t} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>{t}</div><div style={{ color:T.muted, marginTop:6, lineHeight:1.5, fontSize:12 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
