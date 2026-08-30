import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
import { usePageMeta } from "../lib/usePageMeta.js";
export default function Security(){
  usePageMeta("Security — JobCompass", "Locks, two checks, honest scores and UK data — how JobCompass protects your CV.", "/security");
  React.useEffect(()=>{ document.title="Security — JobCompass"; },[]);
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:32, fontWeight:800 }}>Security — how we protect your CV</h1>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12, marginTop:20 }}>
          {[
            ["Locks", "Anything you lock never changes — on any CV"],
            ["Two checks", "One helper writes, a different one checks"],
            ["Honest scores", "Unsure? We show a lower number, not a hopeful one"],
            ["Fair billing", "Charged only when it works. Broken? Automatic refund"],
            ["Safe sign-in", "A 6-digit code by email. Works once, lasts 10 minutes"],
            ["Private by default", "No photo, no birthday, no NI number — UK rules"],
          ].map(([t,d])=> <div key={t} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}><div style={{ fontWeight:700, fontSize:13 }}>{t}</div><div style={{ fontSize:12, color:T.muted, marginTop:6, lineHeight:1.5 }}>{d}</div></div>)}
        </div>
        <div style={{ marginTop:20, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontWeight:700, fontSize:13 }}>GDPR</div>
          <div style={{ fontSize:12, color:T.muted, lineHeight:1.6, marginTop:6 }}>Your data stays in the UK and EU. Delete any CV anytime. We never auto-send anything.</div>
        </div>
        <div style={{ marginTop:16, background: T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontWeight:700 }}>Built on Cloudflare</div>
          <div style={{ fontSize:12, color:T.muted, marginTop:6 }}>The same network that protects big chunks of the internet.</div>
        </div>
      </section>
    </MarketingLayout>
  );
}
