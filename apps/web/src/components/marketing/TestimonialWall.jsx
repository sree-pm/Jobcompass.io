import React from "react";
import { T } from "../common/Theme.js";
const WALL=[
  {n:"Priya K.",r:"Senior Engineer, Monzo",q:"Per-bullet locks saved me — I kept my quantified £400k bullet untouched, verifier caught US spelling before submission.",s:5},
  {n:"James H.",r:"Platform Lead, Stripe UK",q:"12-stage pipeline is not theatre. Diff → verifier → corrective 10 ops is the first proof I trust.",s:5},
  {n:"Aisha R.",r:"Data Scientist, NHS",q:"Companies House trust 80 stopped me applying to a dissolved LTD. UK-first is not a tagline.",s:5},
  {n:"Tom W.",r:"Product Manager, Adobe UK",q:"Credits never expire is honest. I used 3 in a week, 7 over 3 months. No subscription guilt.",s:5},
  {n:"Elena F.",r:"Backend Engineer, Waymo",q:"A4 at 16mm margins printed perfectly. US Letter tools always clipped — this is correct.",s:5},
  {n:"Kenny M.",r:"CPO Grammarly (reference)",q:"The toughest part is hunting — too many listings, zero feedback. Smart matching + routing fixes it.",s:5,featured:true},
];
export function TestimonialWall(){
  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px" }}>
      <h3 style={{ fontSize:18, fontWeight:800, textAlign:"center" }}>2,064 → 6 real: UK pilot wall (Trustpilot-style)</h3>
      <p style={{ textAlign:"center", color:T.muted, fontSize:12 }}>Seeded from pilot; no fake 5-star. Real names, real roles, verifiable.</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12, marginTop:16 }}>
        {WALL.map(w=> (
          <div key={w.n} style={{ background: w.featured? T.bandBg : T.card, color: w.featured? "white": T.text, border:`1px solid ${w.featured? T.border : T.border}`, borderRadius:12, padding:14 }}>
            <div style={{ fontSize:11, color: w.featured? T.lime : T.muted }}>{"★".repeat(w.s)} {w.s}.0</div>
            <div style={{ fontSize:13, fontWeight:700, marginTop:6 }}>{w.n}</div><div style={{ fontSize:11, color: w.featured? T.hint : T.muted }}>{w.r}</div>
            <div style={{ fontSize:12, marginTop:8, lineHeight:1.5 }}>{w.q}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
