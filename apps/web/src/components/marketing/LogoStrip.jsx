import React from "react";
import { T } from "../common/Theme.js";
const LOGOS = ["Goldman Sachs","JPMorgan","Monzo","Stripe","Adobe","NVIDIA","Cisco","HP","Intel","Netflix","Waymo","Raytheon","Airbnb","Motorola"];
export function LogoStrip(){
  return (
    <div style={{ borderTop:`1px solid ${T.chalk || T.border}`, borderBottom:`1px solid ${T.chalk || T.border}`, background: T.eggshell, padding:"18px 0", overflow:"hidden" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", gap:16, opacity:.75 }}>
        <span style={{ fontSize:11, fontWeight:800, letterSpacing:"0.08em", color:T.gravel, textTransform:"uppercase", flexShrink:0 }}>Where hirees landed</span>
        <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
          <div style={{ display:"flex", gap:32, animation:"logoScroll 30s linear infinite", whiteSpace:"nowrap" }}>
            {[...LOGOS,...LOGOS].map((n,i)=> <span key={i} style={{ fontSize:12, fontWeight:700, color:T.gravel }}>{n}</span>)}
          </div>
        </div>
      </div>
      <style>{`@keyframes logoScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
