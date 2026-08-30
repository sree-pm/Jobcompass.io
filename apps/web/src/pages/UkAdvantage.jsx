import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
import { usePageMeta } from "../lib/usePageMeta.js";
export default function UkAdvantage(){
  usePageMeta("UK advantage — JobCompass", "One page, A4, British spelling and UK equality rules — checked on every CV.", "/uk-advantage");
  React.useEffect(()=>{ document.title="UK advantage — JobCompass"; },[]);
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:32, fontWeight:800 }}>UK advantage — built for UK jobs</h1>
        <p style={{ color:T.muted, lineHeight:1.6 }}>US tools get A4, spelling and salaries wrong. We check every CV against UK rules — before you see it.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginTop:20 }}>
          {[
            ["A4, not Letter", "Your CV prints at A4 with the right margins. US Letter templates clip when UK recruiters print."],
            ["GBP only", "Salaries always show £45,000–£55,000. Dollar signs are thrown out."],
            ["British spelling", "Optimise, organisation, prioritise — checked word by word. US spelling is flagged before you see it."],
            ["Equality Act", "Photo, date of birth, marital status and NI number are blocked. Locked fields are re-checked after every edit."],
            ["Companies House", "Every employer is checked against the UK's official company register. Active company? Good sign. Closed company? You'll know before you apply."],
            ["Right industry", "Every company has an official code for its trade. We use it to sort jobs — Technology, Finance, Healthcare and more — so they land in the right place for you."],
            ["Banned phrases", "'Team player' and 'hard worker' are removed. Cover letters are 300–340 words and mention the company twice."],
            ["Right to work", "Your right to work and notice period are facts you give us. Without them, the score stays at 70."],
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
