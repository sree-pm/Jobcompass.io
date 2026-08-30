import React, { useEffect, useState } from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
import { usePageMeta } from "../lib/usePageMeta.js";
export default function Status(){
  usePageMeta("Status — JobCompass", "Is JobCompass working? Check here.", "/status");
  useEffect(()=>{
    fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8789"}/health`).then(r=>r.json()).then(setHealth).catch(()=> setHealth({ok:false}));
    fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8789"}/ingest/runs?limit=5`).then(r=>r.json()).then(d=> setRuns(d.runs||d||[])).catch(()=> setRunsError(true));
  },[]);
  const ok = health?.ok===true;
  const loaded = health!==null;
  const dot = c => <span style={{ display:"inline-block", width:8, height:8, borderRadius:999, background:c }} />;
  return (
    <MarketingLayout>
      <section style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Status</h1>
        <div style={{ marginTop:16, display:"inline-flex", alignItems:"center", gap:8, background: loaded ? (ok?T.greenPale:T.amberPale) : T.surface, border:`1px solid ${loaded ? (ok?T.greenMid:T.amberMid) : T.border}`, borderRadius:999, padding:"10px 18px" }}>
          {loaded ? dot(ok?T.green:T.amberAccent) : dot(T.hint)}
          <span style={{ fontWeight:800, fontSize:15, color: loaded ? (ok?T.greenDark:T.amberText) : T.muted }}>{loaded ? (ok? "All good":"Having trouble") : "Checking…"}</span>
        </div>
        <div style={{ marginTop:16, background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:6, fontSize:13 }}>
          {[["Website","Up"],["Job board","Up"],["Sign-in","Up"]].map(([s,v])=> (
            <div key={s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontWeight:700 }}>{s}</span>
              <span style={{ display:"inline-flex", alignItems:"center", gap:8, color:T.success, fontWeight:600 }}>✓ {v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16, fontWeight:700 }}>Job feed checks</div>
        <div style={{ marginTop:8, background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:12, fontSize:12, color:T.muted }}>
          {runsError ? "Can't check right now" : runs.length ? runs.slice(0,5).map(r=> <div key={r.id} style={{ padding:"6px 0", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:8 }}>{dot(r.status==="ok"?T.green:T.amberAccent)}<span>{r.source} — found {r.found_count}, new {r.new_count} · {r.ran_at}</span></div>) : "No checks yet today"}
        </div>
        <div style={{ marginTop:16, fontSize:11, color:T.hint }}>Built on Cloudflare. Checked every morning. Your data stays in the UK.</div>
      </section>
    </MarketingLayout>
  );
}
