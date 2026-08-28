import React from "react";
import { T } from "../common/Theme.js";
const TOOLS=[
  ["ATS Keywords Checker","Paste JD + CV — see 2× coverage before paying"],
  ["Salary Band £k","Extract £ bands from JD text — £25k–£40k mapping"],
  ["Cover Letter 300w","British understatement, company twice, 300–340w preview"],
  ["Right-to-work Quiz","3 questions — tells confidence cap 70 reason"],
  ["A4 Print Simulator","A4 16/18mm Calibri 10pt — see clip vs US Letter"],
];
export function FreeTools(){
  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px" }}>
      <h3 style={{ fontSize:18, fontWeight:800, textAlign:"center" }}>Free UK tools — no signup (LoopCV moat, UK-ified)</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, marginTop:16 }}>
        {TOOLS.map(([t,d])=> (
          <div key={t} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:14, textAlign:"center" }}>
            <div style={{ fontWeight:700, fontSize:13 }}>{t}</div><div style={{ fontSize:11, color:T.muted, marginTop:6 }}>{d}</div>
            <div style={{ marginTop:10, fontSize:11, fontWeight:700, color:T.blue }}>Open tool →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
