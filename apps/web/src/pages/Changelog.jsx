import React from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
const ENTRIES=[
  ["2026-08-27","Marketing site + DLQ/credit/Stripe/router/atomic fixes","JobCompass v2.3 — 15 public pages, HITL showcase, £0.10/app positioning."],
  ["2026-08-26","Prod hardening","CORS allowlist + queue DLQ + retries + batch tuning `a88fdf9`."],
  ["2026-08-26","Web rename","jobcompass-web `bfb579a`."],
  ["2026-08-26","Design 100% tokens","174 hardcoded values → T.*, guard + CI `e850b50`."],
  ["2026-08-26","Cloudflare Email","jobcompass.io PIN + receipt `555157f`."],
  ["2026-08-26","8-agent pipeline","A1-A5 + Vectorize + cron `870daa4`."],
];
export default function Changelog(){
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
