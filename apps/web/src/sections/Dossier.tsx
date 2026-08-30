import * as React from "react";
import { T } from "../components/common/Theme.js";
import styles from "./Dossier.module.css";

const Sr = [
  { n: "01", label: "read", title: "Read your CV", file: "Your CV, field by field", desc: "We read your CV and mark what can change", code: "Your name stays yours" },
  { n: "02", label: "tailor", title: "Tailor your CV", file: "Drafts with proof", desc: "We rewrite your CV for one exact job", code: "Written for this job" },
  { n: "03", label: "check", title: "Check every change", file: "Safety gate", desc: "Every change is checked before it touches your CV", code: "Nothing sneaks in" },
  { n: "04", label: "quick scan", title: "Quick scan", file: "First check", desc: "A quick computer check runs first", code: "Instant safety check" },
  { n: "05", label: "safe copy", title: "Your safe copy", file: "Side by side", desc: "You see your CV with the changes, side by side", code: "Your CV, improved" },
  { n: "06", label: "second check", title: "Second opinion", file: "Independent audit", desc: "A second AI helper checks the first one's work", code: "Two pairs of eyes" },
  { n: "07", label: "fix up", title: "Fix and re-check", file: "Self-repair", desc: "Small fixes get applied and checked again", code: "Tidied up" },
  { n: "08", label: "billing", title: "Fair billing", file: "No surprise charges", desc: "You only pay when it works", code: "Free if it fails" },
  { n: "09", label: "score", title: "Match score", file: "Your score", desc: "We score how well your CV fits the job", code: "Honest match score" },
  { n: "10", label: "you approve", title: "You approve", file: "Your sign-off", desc: "You tick a box to say it's all true", code: "You have the final say" },
  { n: "11", label: "PDF", title: "Your PDF", file: "Final document", desc: "You get a clean one-page PDF, ready to print", code: "Ready to send" },
  { n: "12", label: "you apply", title: "You apply", file: "The send", desc: "You apply on the company's site yourself", code: "You stay in charge" },
];

export function Dossier() {
  const [active, setActive] = React.useState(5);
  return (
    <section id="dossier" className={styles.wrap} style={{ background: T.cream2, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className="mono" style={{ fontSize: 10, color: T.mutedStrong }}>
            12 STEPS · YOUR CV TO APPLIED
          </div>
          <h2 className={`serif ${styles.h2}`}>Every step, out in the open.</h2>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: T.ink60, maxWidth: "32ch" }}>
            Twelve small steps. Two AI helpers. One CV you're proud to send.
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
