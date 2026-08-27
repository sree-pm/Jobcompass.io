import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
import * as api from "../lib/cloudflareApi.js";

export default function Jobs(){
  const [jobs,setJobs]=useState([]); const [q,setQ]=useState(""); const [loading,setLoading]=useState(true);
  useEffect(()=>{ fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8789"}/jobs?limit=30&q=${encodeURIComponent(q)}`,{headers:{}}).then(r=>r.json()).then(d=>{setJobs(d.jobs||d||[]); setLoading(false);}).catch(async()=>{
    // fallback via api helper if public route needs auth
    try{ const r=await api.req(`/jobs?limit=30`); setJobs(r.jobs||r||[]);}catch{}; setLoading(false);
  }); },[q]);
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 1100, margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:28, fontWeight:800 }}>Job library — shared intelligence</h1>
        <p style={{ color:T.muted }}>Every role is enriched once via Companies House, classified by industry and region, and scored for hiring confidence before you see it. Shared across all users.</p>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title or company" style={{ width:"100%", maxWidth:420, marginTop:12, padding:"10px 12px", border:`1px solid ${T.border}`, borderRadius:8 }} />
        {loading? <div style={{ marginTop:16, color:T.muted }}>Loading…</div> : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12, marginTop:16 }}>
            {jobs.slice(0,30).map(j=> (
              <Link key={j.id||j.jobId} to={`/jobs/${j.id||j.jobId}`} style={{ textDecoration:"none", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:14, color:T.text }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{j.title||j.role}</div>
                <div style={{ fontSize:12, color:T.muted }}>{j.company_name||j.company} · {j.location}</div>
                <div style={{ marginTop:6, display:"flex", gap:6, flexWrap:"wrap" }}>
                  {j.hiring_confidence!=null&& <span style={{ fontSize:10, background: j.hiring_confidence>=70?T.greenLight:T.surface, border:`1px solid ${j.hiring_confidence>=70?T.greenMid:T.border}`, padding:"2px 6px", borderRadius:999 }}>{j.hiring_confidence} confidence</span>}
                  {j.uk_region&&<span style={{ fontSize:10, background:T.surface, border:`1px solid ${T.border}`, padding:"2px 6px", borderRadius:999 }}>{j.uk_region}</span>}
                  {j.industry&&<span style={{ fontSize:10, background:T.surface, border:`1px solid ${T.border}`, padding:"2px 6px", borderRadius:999 }}>{j.industry}</span>}
                </div>
                <div style={{ fontSize:11, color:T.hint, marginTop:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{j.salary||"GBP"}</div>
              </Link>
            ))}
            {!jobs.length && <div style={{ color:T.muted, fontSize:12, background:T.surface, border:`1px dashed ${T.border}`, borderRadius:10, padding:16, textAlign:"center" }}>No openings found — new roles land daily at 06:00 GMT. Try a broader search.</div>}
          </div>
        )}
      </section>
    </MarketingLayout>
  );
}
