import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
import { usePageMeta } from "../lib/usePageMeta.js";
const ENTRIES=[
  ["2026-08-27","Marketing site + reliability fixes","JobCompass v2.3 — 15 public pages, new 'you approve everything' pages, 10p per job."],
  ["2026-08-26","Fewer errors","Jobs load faster and fail less. Bigger queue, better retries."],
  ["2026-08-26","Web","New jobcompass-web domain."],
  ["2026-08-26","One design","Every page now shares the same styles. No exceptions."],
  ["2026-08-26","Email","Sign-in codes and Stripe receipts now come from jobcompass.io."],
  ["2026-08-26","8 steps behind the scenes","One shared job library — every employer checked, sorted and scored for you."],
];
export default function Changelog(){
  usePageMeta("Changelog — JobCompass", "Every JobCompass release — what changed and when, newest first.", "/changelog");
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Changelog</h1>
        <div style={{ marginTop:16, borderLeft:`2px solid ${T.border}`, paddingLeft:16, display:"grid", gap:12 }}>
          {ENTRIES.map(([d,t,desc])=> (
            <div key={d+t} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ fontSize:11, fontFamily:T.mono, color:T.hint }}>{d}</div>
              <div style={{ fontWeight:700, fontSize:13 }}>{t}</div>
              <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
