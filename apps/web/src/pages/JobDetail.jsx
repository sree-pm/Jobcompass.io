import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MarketingLayout } from "../components/marketing/MarketingLayout.jsx";
import { T } from "../components/common/Theme.js";
export default function JobDetail(){
  const { id }=useParams(); const [job,setJob]=useState(null);
  useEffect(()=>{ fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8789"}/jobs/${id}`).then(r=>r.json()).then(setJob).catch(()=>{}); },[id]);
  useEffect(()=>{ if(job&&job.title) document.title=`${job.title} — JobCompass`; },[job]);
  if(!job) return <MarketingLayout><div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>Loading this job…</div></MarketingLayout>;
  return (
    <MarketingLayout>
      <section style={{ maxWidth: 900, margin:"0 auto", padding:"40px 24px" }}>
        <Link to="/jobs" style={{ fontSize:12, color:T.blue, textDecoration:"none" }}>← Back to jobs</Link>
        <h1 style={{ fontSize:24, fontWeight:800, marginTop:8 }}>{job.title} at {job.company_name}</h1>
        <div style={{ fontSize:12, color:T.muted }}>{job.location} · {job.salary||"Pay on application"} · Found on {job.source} {job.hiring_confidence!=null&&`· employer check ${job.hiring_confidence}/100`} {job.job_verified? "· Checked":""}</div>
        <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>{[job.industry,job.seniority,job.contract_type,job.work_mode,job.salary_band,job.uk_region].filter(Boolean).map(x=> <span key={x} style={{ fontSize:11, background:T.surface, border:`1px solid ${T.border}`, padding:"4px 8px", borderRadius:999 }}>{x}</span>)}</div>
        <div style={{ marginTop:16, background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:16, whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.6 }}>{job.job_description||"The employer hasn't sent the full description yet."}</div>
        {job.source_url && <a href={job.source_url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", marginTop:12, background:T.blue, color:T.onColor, padding:"10px 16px", borderRadius:8, textDecoration:"none", fontWeight:700 }}>Open the job advert</a>}
        <div style={{ marginTop:16, fontSize:11, color:T.hint }}>Posted {job.first_seen ? new Date(job.first_seen).toLocaleDateString("en-GB") : ""} · {job.uk_region || job.location} {job.job_verified ? "· Checked at Companies House" : ""}</div>
      </section>
    </MarketingLayout>
  );
}
