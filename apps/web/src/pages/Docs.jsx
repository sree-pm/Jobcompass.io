import React, { useEffect } from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
const CAPS=[
  { title:"Agent Flow", desc:"The 12-stage evidence chain behind every application." },
  { title:"UK CV Spec", desc:"A4, GBP, British spelling, Equality Act rules." },
  { title:"Design System", desc:"One token source, every page consistent." },
  { title:"E2E Walkthrough", desc:"Five flows from signup to dispatch." },
  { title:"AI Router", desc:"Two models, one honest audit." },
  { title:"Data Model", desc:"Your data, your exports, deletable anytime." },
];
const STEPS=[
  "Create your account with an email PIN",
  "Paste your CV or start from scratch",
  "Add your DID/DID NOT ground truth",
  "Tailor a role and approve the diff",
  "Download the A4 PDF and apply",
];
export default function Docs(){
  useEffect(()=>{ document.title="Docs — JobCompass"; },[]);
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
