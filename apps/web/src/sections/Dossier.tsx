import * as React from "react";
import { T } from "../components/common/Theme.js";
import styles from "./Dossier.module.css";

const Sr = [
  { n: "01", label: "registry", title: "Field Registry", file: "fieldRegistry.js:29", desc: "Editable set from schema. exp.0.bullet.j requiresMetric, basics/education/picture uk_forbidden.", code: "isPathEditable(path) // true/false" },
  { n: "02", label: "tailor", title: "Tailor", file: "agents/tailor.ts:24", desc: "DeepSeek V3 \u00b7 routeChat('tailor') temp 0.25 3000tok jsonMode \u00b7 \u00a3/% + verb \u00b7 British optimise \u00b7 sanitise 92 \u00b7 cap 30", code: "TAILOR_SYSTEM \u2192 patch[]" },
  { n: "03", label: "validate", title: "Validate Patch", file: "fieldRegistry.js:160", desc: "isPathEditable + checkBritishSpelling \\b + photo/DOB/NI + banned 'team player' \u2192 422", code: "validatePatchOperations() => 422" },
  { n: "04", label: "quickVerify", title: "Quick Verify", file: "agents/verifier.ts:127", desc: "Deterministic no AI. Locks, metrics, date overlap, UK compliance.", code: "quickVerify(patch) deterministic" },
  { n: "05", label: "patched", title: "Patched Clone", file: "routes/resumes.ts:76", desc: "fast-json-patch applyPatch clone strict. No mutation of master.", code: "applyPatch(master, ops)" },
  { n: "06", label: "verifier", title: "Verifier", file: "agents/verifier.ts:26", desc: "Claude Haiku routeChat('verifier') 0.15 2500 10 checks + hard diff locked + confidence cap 70 if constraintsDoc<50", code: "confidenceCap = 70 // low constraints" },
  { n: "07", label: "corrective", title: "Corrective Loop", file: "resumes.ts:158", desc: "\u226410 re-validate. Auto-fix British spelling, metric injection, verb upgrade.", code: "while(fail && tries<10) fix()" },
  { n: "08", label: "persist", title: "Persist + Credits", file: "lib/credits.ts:72", desc: "getCreditBalance 402 if <1 else deductCredits after validate \u00b7 addCredits(refund) atomic balance=balance+? \u00b7 reference_id UNIQUE idempotent", code: "WHERE balance>=? \u2192 balance+?" },
  { n: "09", label: "matcher", title: "Matcher Score", file: "lib/matcher.ts:21", desc: "ats 50 + exp 30 + constraints 20 \u00b7 cap 70. ATS Calibri 10pt A4 16/18mm.", code: "score = 0.5*ats+0.3*exp+0.2*const" },
  { n: "10", label: "HITL", title: "HITL Review Station", file: "HitlReviewStation.jsx:278", desc: "Diff + verifier issues error/warning/info + ScoreBar + Fix + checkbox gate ApplyDispatchDrawer", code: "checkbox 'I have reviewed' \u2192 enable" },
  { n: "11", label: "PDF", title: "PDF Render", file: "lib/pdf.ts:27", desc: "renderCvHtml A4 16/18mm Calibri 10pt BROWSER puppeteer \u2192 R2 pdfs/{app}/{ts} tailored_pdf_key POST /applications/:id/pdf", code: "BROWSER \u2192 R2 pdfs/..." },
  { n: "12", label: "apply", title: "Apply Dispatch", file: "PUT /applications/:id", desc: "status applied + sourceUrl external submit, no auto-apply. Receipt saved.", code: "status='applied' // human submits" },
];

export function Dossier() {
  const [active, setActive] = React.useState(5);
  return (
    <section id="dossier" className={styles.wrap} style={{ background: T.cream2, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className="mono" style={{ fontSize: 10, color: T.mutedArtifact }}>
            12-STAGE DOSSIER · REGISTRY→APPLY
          </div>
          <h2 className={`serif ${styles.h2}`}>Evidence chain, not black box.</h2>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: T.ink60, maxWidth: "32ch" }}>
            From docs/AGENT_FLOW.md — every application is a 12-step evidence chain with British spelling guard, field locks, Claude Haiku verifier, and atomic credits.
          </p>
          <div className={styles.liveCard}>
            <div className="mono" style={{ fontSize: 10 }}>
              Live step
            </div>
            <div className={styles.liveRow}>
              <div className={styles.liveNum} style={{ background: T.ink, color: T.onColor }}>
                {Sr[active].n}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{Sr[active].title}</div>
                <div className="mono" style={{ fontSize: 9, color: T.mutedArtifact }}>
                  {Sr[active].file}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.flowNav}>
            <div className="mono" style={{ fontSize: 10, color: T.mutedArtifact, marginBottom: 8 }}>
              FLOW
            </div>
            <div className={styles.flowList}>
              {Sr.map((u, idx) => (
                <button
                  key={u.n}
                  onClick={() => setActive(idx)}
                  className={styles.flowBtn}
                  style={idx === active ? { background: T.ink, color: T.onColor } : { background: "white", border: `1px solid ${T.creamBorder}`, color: T.ink70 }}
                >
                  <span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>
                    {u.n}
                  </span>{" "}
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.line} style={{ background: T.creamBorder }} />
          <div className={styles.cards}>
            {Sr.map((u, idx) => (
              <div
                key={u.n}
                onMouseEnter={() => setActive(idx)}
                className={styles.card}
                style={
                  idx === active
                    ? { borderColor: T.ink, background: "white", boxShadow: `0 8px 32px ${T.shadowHeader}` }
                    : { borderColor: T.creamBorder, background: "white" }
                }
              >
                <div className={styles.branch} style={{ background: T.creamBorder }} />
                <div className={styles.dot} style={{ borderColor: idx === active ? T.ink : T.creamBorder, background: "white" }}>
                  <div style={{ width: 6, height: 6, borderRadius: 999, background: idx === active ? T.ink : T.creamBorder }} />
                </div>
                <div className={styles.cardHead}>
                  <span className="mono" style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, background: T.surfaceCool, border: `1px solid ${T.creamBorder}` }}>
                    {u.n} · {u.label}
                  </span>
                  <span className="mono" style={{ fontSize: 9, color: T.mutedArtifact }}>
                    {u.file}
                  </span>
                  <span className={styles.statusDot} style={{ background: idx <= active ? T.success : T.creamBorder }} />
                </div>
                <h3 className={`serif ${styles.cardTitle}`}>{u.title}</h3>
                <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: T.ink70 }}>{u.desc}</p>
                <div className="mono" style={{ marginTop: 12, fontSize: 10, padding: "6px 10px", borderRadius: 999, background: T.ink, color: T.white60, display: "inline-flex", maxWidth: "100%", overflow: "hidden" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
