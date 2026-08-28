import React, { useState } from "react";
import { T } from "../common/Theme.js";
export function HireCalculator(){
  const [salary,setSalary]=useState(60000);
  const agency = Math.round(salary*0.2);
  const boards = 2750; const sourcing=4000;
  return (
    <div style={{ background:T.bandBg, color:"white", borderRadius:16, padding:24, maxWidth:1100, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:16 }}><div style={{ fontSize:11, letterSpacing:"0.08em", color:T.lime, fontWeight:800 }}>SEE WHAT A HIRE REALLY COSTS</div><h3 style={{ fontSize:22, fontWeight:800, margin:"6px 0 0" }}>Jobright-style calculator — UK-ified</h3></div>
      <div style={{ display:"flex", gap:12, alignItems:"center", justifyContent:"center", flexWrap:"wrap", marginBottom:16 }}>
        <label style={{ fontSize:12, color:T.hint }}>Salary <input type="range" min={30000} max={120000} step={5000} value={salary} onChange={e=>setSalary(Number(e.target.value))} /> <span style={{ color:T.lime, fontWeight:800 }}>£{salary.toLocaleString("en-GB")}</span></label>
        <span style={{ fontSize:11, color:T.muted }}>1 hire · sliders live</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
        {[
          ["Headhunter 20%", `£${agency.toLocaleString("en-GB")}`, T.red],
          ["Job boards", `£${boards.toLocaleString("en-GB")} ~`, T.muted],
          ["Sourcing tool", `£${sourcing.toLocaleString("en-GB")} ~`, T.muted],
          ["JobCompass", "£10", T.lime],
        ].map(([k,v,c])=> (
          <div key={k} style={{ background: k==="JobCompass"? T.bandCard : T.bandBg, border:`1px solid ${k==="JobCompass"?T.lime:T.border}`, borderRadius:12, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:11, color:T.muted }}>{k}</div><div style={{ fontSize:22, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:T.hint }}>Same hire. A fraction of the cost — you skip the sorting, fakes and chasing. <span style={{ color:T.lime }}>Credits never expire — use in 1 day or 12 months</span></div>
      <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:T.muted }}>LoopCV €9.99 → €3.33/day · JobCopilot $28 → $0.93/day · JobCompass £10 = 100 apps → £0.33/day over 30 days (and you keep them)</div>
    </div>
  );
}
