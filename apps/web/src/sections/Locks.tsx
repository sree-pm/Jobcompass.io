import { T } from "../components/common/Theme.js";
import styles from "./Locks.module.css";
export function Locks() {
  const rows = [
    { path: "Experience bullets", editable: true, note: "Needs a number or amount", ok: true },
    { path: "Professional summary", editable: true, note: "British spelling enforced", ok: true },
    { path: "Your name", editable: false, note: "UK rules", ok: false },
    { path: "Photo", editable: false, note: "UK rules", ok: false },
    { path: "Education", editable: false, note: "UK rules", ok: false },
  ];
  return (
    <section className={styles.wrap} style={{ background: T.cream, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: T.mutedStrong }}>
            MASTER CV · WHAT WE NEVER TOUCH
          </div>
          <h2 className={`serif ${styles.h2}`}>Your real details never change.</h2>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: T.ink60 }}>
            Lock anything you never want touched. Your name, school and photo stay exactly as they are — on every single CV.
          </p>
          <div className={styles.registry}>
            <div className={styles.registryHead}>
              <span className="mono" style={{ fontSize: 10 }}>
                YOUR CV · FIELD REGISTRY
              </span>
              <span className="mono" style={{ fontSize: 10, color: T.success, display: "flex", alignItems: "center", gap: 4 }}>
                <span aria-hidden="true">✓</span> LOCKS ACTIVE
              </span>
            </div>
            <div>
              {rows.map((r) => (
                <div key={r.path} className={styles.row}>
                  <div className={styles.rowLeft}>
                    <span className={styles.icon} aria-hidden="true" style={r.ok ? { background: T.successBg, color: T.success } : { background: T.dangerBg, color: T.dangerText }}>
                      {r.ok ? "✓" : "✕"}
                    </span>
                    <span className="mono" style={{ fontSize: 11 }}>
                      {r.path}
                    </span>
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: T.mutedStrong }}>
                    {r.editable ? "Editable" : "Locked"} · {r.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.rightCard}>
          <div className="mono" style={{ fontSize: 10 }}>
            YOUR RULES · DID / DID NOT
          </div>
          <div className={styles.twoCol}>
            <div className={styles.did} style={{ background: T.ink, color: T.onColor }}>
              <div className="mono" style={{ fontSize: 10, color: T.white50 }}>
                DID LIST
              </div>
              <ul className={styles.list}>
                <li>· Optimised checkout +23% (1.2M)</li>
                <li>· Led 6-person squad</li>
                <li>· Right to work: UK citizen</li>
              </ul>
            </div>
            <div className={styles.didNot} style={{ background: T.surfaceCool, borderColor: T.creamBorder }}>
              <div className="mono" style={{ fontSize: 10, color: T.mutedStrong }}>
                DID NOT LIST
              </div>
              <ul className={styles.listMuted}>
                <li>· No photo / DOB / NI</li>
                <li>· No team player cliché</li>
                <li>· No 3-page CV</li>
              </ul>
            </div>
          </div>
          <div className={styles.guard} style={{ background: T.successBg, borderColor: T.success }}>
            <span aria-hidden="true" style={{ color: T.success }}>✓</span>
            <span style={{ fontSize: 12, lineHeight: 1.5 }}>
              <b>UK Guard:</b> British spelling is enforced. Photo, date of birth and NI number are never added — UK rules.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
