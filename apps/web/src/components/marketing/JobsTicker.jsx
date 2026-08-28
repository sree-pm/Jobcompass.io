import React, { useEffect, useState } from "react";
import { T } from "../common/Theme.js";
export function JobsTicker(){
  const [jobs,setJobs]=useState([]);
  useEffect(()=>{
    fetch(`${import.meta.env.VITE_API_URL||"http://localhost:8789"}/jobs?limit=7`).then(r=>r.json()).then(d=>{
      const list=d.jobs||d||[];
      const fallback=[["Stripe","Senior Backend Engineer"],["Netflix","Staff Engineer"],["Tesla","Firmware Autopilot"],["Salesforce","Lead Full-Stack"],["Airbnb","Senior Data Scientist"]].map(([c,t])=>({company_name:c,title:t}));
      setJobs(list.length? list.slice(0,7): fallback.map((x,i)=>({...x, id:"f"+i})));
    }).catch(()=>{});
  },[]);
  return (
    <div style={{ borderTop:`1px solid ${T.chalk}`, borderBottom:`1px solid ${T.chalk}`, background:"white", overflow:"hidden", padding:"10px 0" }}>
      <div style={{ display:"flex", gap:32, animation:"ticker 40s linear infinite", whiteSpace:"nowrap", width:"max-content" }}>
        {[...jobs,...jobs].map((j,i)=> (
          <span key={i} style={{ fontSize:12, color:T.gravel, display:"inline-flex", gap:8, alignItems:"center" }}>
            <span style={{ fontWeight:800, color:T.text }}>{j.company_name||j.company}</span> {j.title} <span style={{ color:T.hint }}>just now</span> •
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
