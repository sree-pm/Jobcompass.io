import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
import { usePageMeta } from "../lib/usePageMeta.js";
const CAPS=[
  { title:"The 12 steps", desc:"What happens between your CV and the send button." },
  { title:"UK rules", desc:"One page, A4, British spelling, no photo." },
  { title:"One design", desc:"Every page looks the same, on purpose." },
  { title:"A walk-through", desc:"Five quick tours, signup to send." },
  { title:"Two helpers", desc:"One writes, one checks." },
  { title:"Your data", desc:"Yours to see, download and delete." },
];
const STEPS=[
  "1. Type your email — we send a code",
  "2. Paste your CV or start fresh",
  "3. Tell us what you did (and didn't) do",
  "4. Pick a job — we tailor your CV",
  "5. Check it, approve it, send it",
];
export default function Docs(){
  usePageMeta("Docs — JobCompass", "How JobCompass works, in five steps. Then the detail, in plain English.", "/docs");
  const Card=({title,desc})=> <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}><div style={{ fontWeight:700, fontSize:13 }}>{title}</div><div style={{ fontSize:12, color:T.muted, marginTop:6, lineHeight:1.5 }}>{desc}</div></div>;
  return (
    <MarketingLayout>
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Docs</h1>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginTop:16 }}>
          {CAPS.map(c=> <Card key={c.title} title={c.title} desc={c.desc} />)}
        </div>
        <div style={{ marginTop:20, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontWeight:700 }}>Get started</div>
          <ol style={{ margin:"10px 0 0", paddingLeft:20, fontSize:13, color:T.text, lineHeight:1.9 }}>
            {STEPS.map(s=> <li key={s}>{s}</li>)}
          </ol>
        </div>
      </section>
    </MarketingLayout>
  );
}
