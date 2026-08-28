import { T } from "../components/common/Theme.js";
import styles from "./Locks.module.css";
export function Locks() {
  const rows = [
    { path: "exp.0.bullet.j", editable: true, note: "requiresMetric", ok: true },
    { path: "basics.summary", editable: true, note: "British optimise", ok: true },
    { path: "basics.name", editable: false, note: "uk_forbidden unlock", ok: false },
    { path: "basics.picture", editable: false, note: "UK no photo", ok: false },
    { path: "education.0", editable: false, note: "Identity locked", ok: false },
  ];
  return (
    <section className={styles.wrap} style={{ background: T.cream, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: T.mutedArtifact }}>
            MASTER CV + FIELD LOCKS
          </div>
          <h2 className={`serif ${styles.h2}`}>Identity locked. Metrics required.</h2>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: T.ink60 }}>
            FieldLocks.jsx · PUT /resumes/:id/locks · candidate_id+field_id unique · applyUserLocks never unlocks identity. ConstraintsBuilder did_list/did_not_list.
          </p>
          <div className={styles.registry}>
            <div className={styles.registryHead}>
              <span className="mono" style={{ fontSize: 10 }}>
                fieldRegistry.js:29
              </span>
              <span className="mono" style={{ fontSize: 10, color: T.success, display: "flex", alignItems: "center", gap: 4 }}>
                ✓ LOCKS ACTIVE
              </span>
            </div>
            <div>
              {rows.map((r) => (
                <div key={r.path} className={styles.row}>
                  <div className={styles.rowLeft}>
                    <span className={styles.icon} style={r.ok ? { background: T.successBg, color: T.success } : { background: T.dangerBg, color: T.dangerText }}>
                      {r.ok ? "✓" : "✕"}
                    </span>
                    <span className="mono" style={{ fontSize: 11 }}>
                      {r.path}
                    </span>
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: T.mutedArtifact }}>
                    {r.editable ? "editable:true" : "editable:false"} · {r.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.rightCard}>
          <div className="mono" style={{ fontSize: 10 }}>
            ConstraintsBuilder.jsx · PUT /candidates/:id/constraints
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
              <div className="mono" style={{ fontSize: 10, color: T.mutedArtifact }}>
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
            <span style={{ color: T.success }}>✓</span>
            <span style={{ fontSize: 12, lineHeight: 1.5 }}>
              <b>UK Guard:</b> checkBritishSpelling \b optimise/organisation · photo/DOB/NI blocked → 422 · sanitise 92 · applyUserLocks never unlocks identity.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
