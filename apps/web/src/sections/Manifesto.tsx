import { T } from "../components/common/Theme.js";
import styles from "./Manifesto.module.css";
export function Manifesto() {
  return (
    <section className={styles.wrap} style={{ background: T.cream, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div>
          <p className="mono" style={{ fontSize: 10, color: T.mutedStrong, marginBottom: 12 }}>
            YOU'VE DONE THE HARD PART
          </p>
          <h2 className={`serif ${styles.h2}`}>
            You don't need more applications. You need <span style={{ color: T.ink }}>better ones.</span>
          </h2>
        </div>
        <div className={styles.right}>
          <p style={{ color: T.ink70 }}>
            You've done the hard part — the skills, the experience, the results.
          </p>
          <p style={{ color: T.ink70, marginTop: 12 }}>
            Every week, good people send the same CV everywhere. It gets ignored. Not because they're bad — because it wasn't written for that job.
          </p>
          <p style={{ color: T.ink, fontWeight: 600, marginTop: 16 }}>
            The problem isn't you. It's the one page that was never quite right.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px 32px" }}>
        <div className={styles.pains}>
          <div style={{ borderLeft: `2px solid ${T.creamBorder}`, paddingLeft: 16 }}>
            The £400k result you saved, that your CV never mentions
          </div>
          <div style={{ borderLeft: `2px solid ${T.creamBorder}`, paddingLeft: 16 }}>
            The company that went bust before your interview
          </div>
          <div style={{ borderLeft: `2px solid ${T.creamBorder}`, paddingLeft: 16 }}>
            The US spelling that got you binned by a UK recruiter
          </div>
        </div>
      </div>
    </section>
  );
}
