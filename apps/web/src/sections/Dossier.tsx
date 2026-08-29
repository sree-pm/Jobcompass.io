import * as React from "react";
import { T } from "../components/common/Theme.js";
import styles from "./Dossier.module.css";

const Sr = [
  { n: "01", label: "registry", title: "Field Registry", file: "Your CV, field by field", desc: "Every bullet in your CV is a lockable field. Identity, education and photo stay locked.", code: "Lock every bullet" },
  { n: "02", label: "tailor", title: "Tailor", file: "Drafts with proof", desc: "One model drafts the edits — every bullet needs a verb, an outcome and a £ or % figure.", code: "Verb + outcome + £" },
  { n: "03", label: "validate", title: "Validate Patch", file: "Safety gate", desc: "Locked fields, British spelling and banned phrases are checked. Blocked edits never reach your CV.", code: "Nothing slips through" },
  { n: "04", label: "quickVerify", title: "Quick Verify", file: "Instant scan", desc: "A fast no-AI scan catches protected details and locked fields before anything is applied.", code: "Instant pre-check" },
  { n: "05", label: "patched", title: "Patched Clone", file: "Safe copy", desc: "Edits apply to a cloned CV — your master stays untouched.", code: "Master stays intact" },
  { n: "06", label: "verifier", title: "Verifier", file: "Independent audit", desc: "A second, different model audits the result — confidence is capped at 70 without your ground truth.", code: "Second opinion, always" },
  { n: "07", label: "corrective", title: "Corrective Loop", file: "Self-repair", desc: "Up to 10 auto-fixes are re-validated, then applied. Nothing unlocks.", code: "Auto-fix, re-checked" },
  { n: "08", label: "persist", title: "Persist + Credits", file: "Fair billing", desc: "One credit is deducted only after checks pass. Failed runs are refunded automatically.", code: "Charge only on success" },
  { n: "09", label: "matcher", title: "Matcher Score", file: "Your score", desc: "Your match score blends ATS, experience and your constraints — capped at 70 without evidence.", code: "Honest match score" },
  { n: "10", label: "HITL", title: "HITL Review Station", file: "Your sign-off", desc: "You see the diff, the issues and the score. Nothing dispatches until you tick 'I have reviewed'.", code: "Your approval gates send" },
  { n: "11", label: "PDF", title: "PDF Render", file: "Final document", desc: "A print-perfect A4 with 16/18mm margins. Stored to your private library.", code: "Print-ready A4" },
  { n: "12", label: "apply", title: "Apply Dispatch", file: "The send", desc: "You click the employer's site and submit. We mark it applied — no auto-submit, ever.", code: "You stay in control" },
];

export function Dossier() {
  const [active, setActive] = React.useState(5);
  return (
    <section id="dossier" className={styles.wrap} style={{ background: T.cream2, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className="mono" style={{ fontSize: 10, color: T.mutedStrong }}>
            12-STAGE DOSSIER · REGISTRY→APPLY
          </div>
          <h2 className={`serif ${styles.h2}`}>Evidence chain, not black box.</h2>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: T.ink60, maxWidth: "32ch" }}>
            From docs/AGENT_FLOW.md — every application is a 12-step evidence chain with British spelling guard, field locks, Claude Haiku verifier, and atomic credits.
          </p>
          <div className={styles.flowNav}>
            <div className="mono" style={{ fontSize: 10, color: T.mutedStrong, marginBottom: 8 }}>
              FLOW
            </div>
            <div className={styles.flowList}>
              {Sr.map((u, idx) => (
                <button
                  key={u.n}
                  onClick={() => setActive(idx)}
                  aria-current={idx === active ? "step" : undefined}
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
            {Sr.map((u, idx) => {
              const isActive = idx === active;
              return (
                <div
                  key={u.n}
                  onClick={() => setActive(idx)}
                  onFocus={() => setActive(idx)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  aria-controls={`stage-body-${u.n}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActive(idx);
                    }
                  }}
                  className={`${styles.card} ${isActive ? styles.cardExpanded : styles.cardCollapsed}`}
                  style={
                    isActive
                      ? { borderColor: T.ink, background: "white", boxShadow: `0 8px 32px ${T.shadowHeader}` }
                      : { borderColor: T.creamBorder, background: "white" }
                  }
                >
                  <div className={styles.branch} style={{ background: T.creamBorder }} />
                  <div className={styles.dot} style={{ borderColor: isActive ? T.ink : T.creamBorder, background: "white" }}>
                    <div style={{ width: 6, height: 6, borderRadius: 999, background: isActive ? T.ink : T.creamBorder }} />
                  </div>
                  <div className={styles.cardHead}>
                    <span className="mono" style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, background: T.surfaceCool, border: `1px solid ${T.creamBorder}` }}>
                      {u.n} · {u.label}
                    </span>
                    <span className="mono" style={{ fontSize: 9, color: T.mutedStrong }}>
                      {u.file}
                    </span>
                    <span
                      className={styles.statusDot}
                      role="img"
                      aria-label={idx < active ? "Completed" : idx === active ? "Current" : "Pending"}
                      style={idx < active ? { background: T.success } : { background: "white", border: `2px solid ${T.creamBorder}` }}
                    />
                  </div>
                  <h3 className={`serif ${styles.cardTitle}`}>{u.title}</h3>
                  <div id={`stage-body-${u.n}`} className={`${styles.cardBody} ${isActive ? styles.cardBodyOpen : styles.cardBodyClosed}`} aria-hidden={!isActive}>
                    <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: T.ink70 }}>{u.desc}</p>
                    <div className="mono" style={{ marginTop: 12, fontSize: 10, padding: "6px 10px", borderRadius: 999, background: T.ink, color: T.white60, display: "inline-flex", maxWidth: "100%", overflow: "hidden" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.code}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
