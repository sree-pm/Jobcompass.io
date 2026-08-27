import React, { useState } from "react";
import { T } from "../common/Theme.js";

const STAGES = [
  { n: 1, k: "registry", label: "Registry", desc: "buildFieldRegistry()", color: T.blue },
  { n: 2, k: "tailor", label: "Tailor", desc: "DeepSeek V3 · JSON Patch", color: T.indigo },
  { n: 3, k: "validate", label: "Validate", desc: "validatePatchOperations", color: T.purple },
  { n: 4, k: "quickVerify", label: "QuickVerify", desc: "deterministic · no AI", color: T.amber },
  { n: 5, k: "patched", label: "Patched", desc: "applyPatch()", color: T.green },
  { n: 6, k: "verifier", label: "Verifier", desc: "Claude Haiku · 2nd pass", color: T.red },
  { n: 7, k: "corrective", label: "Corrective", desc: "auto-fix ≤10 ops", color: T.indigoDeep },
  { n: 8, k: "persist", label: "Persist", desc: "D1 resumes + applications", color: T.blue },
  { n: 9, k: "matcher", label: "Matcher", desc: "calculateSemanticFit", color: T.purpleVivid },
  { n: 10, k: "hitl", label: "HITL", desc: "human sign-off gate", color: T.amberAccent },
  { n: 11, k: "pdf", label: "PDF", desc: "R2 A4 · Browser or HTML", color: T.greenDark },
  { n: 12, k: "apply", label: "Apply", desc: "sourceUrl dispatch", color: T.text },
];

export function AgentFlowDiagram({ interactive = false, onInject }) {
  const [active, setActive] = useState(null);
  const [injected, setInjected] = useState(false);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
        {STAGES.map(s => (
          <div key={s.k} onMouseEnter={() => interactive && setActive(s.k)} onMouseLeave={() => setActive(null)}
            style={{ background: active === s.k ? T.blueLight : T.card, border: `1px solid ${active === s.k ? T.blueMid : T.border}`, borderRadius: 8, padding: "10px 8px", textAlign: "center", cursor: interactive ? "pointer" : "default", transition: "all 150ms", position: "relative" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.hint, letterSpacing: "0.06em" }}>{String(s.n).padStart(2,"0")}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2, lineHeight: 1.3 }}>{s.desc}</div>
            {s.n < 12 && <span style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", color: T.borderStrong, fontSize: 10 }}>→</span>}
          </div>
        ))}
      </div>
      {interactive && (
        <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => { setInjected(v=>!v); onInject?.(!injected); }} style={{ fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 8, border: `1px solid ${injected ? T.redMid : T.borderStrong}`, background: injected ? T.redLight : T.card, color: injected ? T.red : T.text, cursor: "pointer" }}>
            {injected ? "✓ Injection blocked" : "⚡ Try inject attack: patch /basics/name"}
          </button>
          {injected && <span style={{ fontSize: 11, color: T.red, background: T.redPale, border: `1px solid ${T.redBorder}`, padding: "6px 10px", borderRadius: 999 }}>422 Forbidden field (locked): /basics/name — sanitise dropped it</span>}
          {active && <span style={{ fontSize: 11, color: T.muted, background: T.surface, border: `1px solid ${T.border}`, padding: "6px 10px", borderRadius: 999 }}>{STAGES.find(s=>s.k===active)?.label}: {STAGES.find(s=>s.k===active)?.desc}</span>}
        </div>
      )}
      <div style={{ marginTop: 12, fontSize: 11, color: T.hint, textAlign: "center" }}>registry → tailor → validate → quickVerify → patched → verifier → corrective → persist → matcher → HITL → PDF → apply</div>
    </div>
  );
}
