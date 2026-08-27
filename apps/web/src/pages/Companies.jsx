import React, { useEffect, useState } from "react";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
export default function Companies(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8789"}/companies?limit=50`).then(r=>r.json()).then(d=> setRows(d.companies||d||[])).catch(()=>{}); },[]);
  return (
    <MarketingLayout>
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Companies — Companies House enriched</h1>
        <p style={{ color:T.muted }}>Table `companies` — trust 80 active else 20 `company-enricher.ts:56`, SIC→industry, website via Brave, enriched_at cache. Unique per name, enriched once globally.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginTop:16 }}>
          {rows.map(c=> (
            <div key={c.id||c.name} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ fontWeight:700 }}>{c.name}</div>
              <div style={{ fontSize:11, color:T.muted, fontFamily: T.mono, marginTop:4 }}>{c.company_number||"—"} · {c.status||"unknown"} · {c.industry||"industry n/a"}</div>
              <div style={{ marginTop:6, display:"flex", gap:6 }}>{c.trust_score!=null&& <span style={{ fontSize:11, background: c.trust_score>=70?T.greenLight:T.surface, border:`1px solid ${c.trust_score>=70?T.greenMid:T.border}`, padding:"2px 6px", borderRadius:999 }}>trust {c.trust_score}</span>} {c.website&&<a href={c.website} target="_blank" rel="noreferrer" style={{ fontSize:11, color:T.blue }}>website</a>}</div>
              <div style={{ fontSize:11, color:T.hint, marginTop:6 }}>{c.registered_office||""}</div>
            </div>
          ))}
          {!rows.length && <div style={{ color:T.muted, fontSize:12 }}>No companies yet — pipeline populates after ATS ingest + enrichCompany.</div>}
        </div>
      </section>
    </MarketingLayout>
  );
}
