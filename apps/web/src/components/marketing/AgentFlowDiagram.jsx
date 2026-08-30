import React, { useState } from "react";
import { T } from "../common/Theme.js";

const STAGES = [
  { n: 1,  k: "register", label: "Register",     desc: "Read your CV and mark what's safe to change",        color: T.blue },
  { n: 2,  k: "draft",    label: "Draft",        desc: "First helper rewrites the bullet for this job",      color: T.indigo },
  { n: 3,  k: "check",     label: "Safety check", desc: "Instant scan — locked fields and UK rules",       color: T.purple },
  { n: 4,  k: "review1",   label: "First review", desc: "The change is safe to apply",                         color: T.amber },
  { n: 5,  k: "apply",     label: "Apply",         desc: "The new bullet is added to your CV",                  color: T.green },
  { n: 6,  k: "check2",    label: "Second review", desc: "A different helper reads it back and checks it",      color: T.red },
  { n: 7,  k: "fix",       label: "Small fixes",   desc: "Up to 10 tiny fixes get applied and re-checked",      color: T.indigoDeep },
  { n: 8,  k: "save",      label: "Save",          desc: "Your CV and tailored copy are kept safe",             color: T.blue },
  { n: 9,  k: "score",     label: "Match score",   desc: "Honest number for how well your CV fits this job",    color: T.purpleVivid },
  { n: 10, k: "approve",   label: "Your approval", desc: "You tick the box — nothing sends without you",      color: T.amberAccent },
  { n: 11, k: "print",     label: "Print",         desc: "A clean one-page A4 PDF, ready to send",              color: T.greenDark },
  { n: 12, k: "send",      label: "Send",          desc: "You press send on the company's site  we don't",   color: T.text },
];

export function AgentFlowDiagram({ interactive = false, onInject }) {
  const [active, setActive] = useState(null);
  const [injected, setInjected] = useState(false);
  return (
    <div>
      <div className="flow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
        {STAGES.map(s => (
          <div key={s.k} onMouseEnter={() => interactive && setActive(s.k)} onMouseLeave={() => setActive(null)}
            style={{ background: active === s.k ? T.blueLight : T.card, border: `1px solid ${active === s.k ? T.blueMid : T.border}`, borderRadius: 8, padding: "10px 8px", textAlign: "center", cursor: interactive ? "pointer" : "default", transition: "all 150ms", position: "relative" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.hint, letterSpacing: "0.06em" }}>{String(s.n).padStart(2,"0")}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{s.desc}</div>
            {s.n < 12 && <span style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", color: T.borderStrong, fontSize: 10 }}></span>}
          </div>
        ))}
      </div>
      {interactive && (
        <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => { setInjected(v=>!v); onInject?.(!injected); }} style={{ fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 8, border: `1px solid ${injected ? T.redMid : T.borderStrong}`, background: injected ? T.redLight : T.card, color: injected ? T.red : T.text, cursor: "pointer" }}>
            {injected ? " Injection blocked" : " Try a hidden trick: change my name"}
          </button>
          {injected && <span style={{ fontSize: 11, color: T.red, background: T.redPale, border: `1px solid ${T.redBorder}`, padding: "6px 10px", borderRadius: 999 }}>We blocked the change  your name is locked, so it stays as you wrote it.</span>}
          {active && <span style={{ fontSize: 11, color: T.muted, background: T.surface, border: `1px solid ${T.border}`, padding: "6px 10px", borderRadius: 999 }}>{STAGES.find(s=>s.k===active)?.label}: {STAGES.find(s=>s.k===active)?.desc}</span>}
        </div>
      )}
      <div style={{ marginTop: 12, fontSize: 11, color: T.hint, textAlign: "center" }}>register  tailor  check  tailor  review  save  print  send</div>
    </div>
  );
}
