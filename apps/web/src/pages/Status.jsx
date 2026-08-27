import React, { useEffect, useState } from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
export default function Status(){
  const [health,setHealth]=useState(null); const [runs,setRuns]=useState([]);
  useEffect(()=>{
    fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8789"}/health`).then(r=>r.json()).then(setHealth).catch(()=> setHealth({ok:false}));
    fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8789"}/ingest/runs?limit=10`).then(r=>r.json()).then(d=> setRuns(d.runs||d||[])).catch(()=>{});
  },[]);
  return (
    <MarketingLayout>
      <section style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Status</h1>
        <div style={{ marginTop:16, background: health?.ok?T.greenPale:T.redLight, border:`1px solid ${health?.ok?T.greenMid:T.redMid}`, borderRadius:10, padding:14 }}>
          <div style={{ fontWeight:700 }}>{health? (health.ok? "API healthy":"API unreachable"):"Loading…"} — {health?.service||"jobcompass-api"} {health?.version||""}</div>
          <details style={{ marginTop:6 }}><summary style={{ fontSize:11, color:T.muted, cursor:"pointer" }}>Show raw health</summary><pre style={{ fontSize:11, background:T.card, border:`1px solid ${T.border}`, borderRadius:6, padding:8, overflow:"auto", marginTop:6 }}>{JSON.stringify(health||{}, null, 2)}</pre></details>
        </div>
        <div style={{ marginTop:16, fontWeight:700 }}>Recent ingest runs</div>
        <div style={{ marginTop:8, background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:12, fontSize:12, color:T.muted }}>{runs.length? runs.map(r=> <div key={r.id} style={{ padding:"6px 0", borderBottom:`1px solid ${T.border}` }}>{r.source} — found {r.found_count} new {r.new_count} · {r.status} · {r.ran_at}</div>) : "No runs yet — new roles land daily at 06:00 GMT"}</div>
        <div style={{ marginTop:16, fontSize:11, color:T.hint }}>Built on Cloudflare — data stays in the UK, single region. Daily ingest at 06:00 UTC.</div>
      </section>
    </MarketingLayout>
  );
}
