import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
import { usePageMeta } from "../lib/usePageMeta.js";
const ENTRIES=[
  ["2026-08-27","Marketing site + reliability fixes","JobCompass v2.3 — 15 public pages, human-in-the-loop showcase, £0.10 per application."],
  ["2026-08-26","Production hardening","CORS allowlist, queue dead-letter queue, retries and batch tuning."],
  ["2026-08-26","Web","New jobcompass-web domain."],
  ["2026-08-26","Design system","All styles now served from design tokens with CI guard."],
  ["2026-08-26","Email","PIN codes and Stripe receipts via jobcompass.io."],
  ["2026-08-26","8-agent pipeline","Shared job library, enrichment, classification, verification and matching."],
];
export default function Changelog(){
  usePageMeta("Changelog — JobCompass", "Every JobCompass release — marketing site, pipeline, billing and design system changes, newest first.", "/changelog");
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
