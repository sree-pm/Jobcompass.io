import { T } from "../components/common/Theme.js";
import styles from "./Automations.module.css";
export function Automations() {
  return (
    <section className={styles.wrap} style={{ background: T.cream, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div className="mono" style={{ fontSize: 10, color: T.mutedStrong }}>
          AUTOMATIONS · PLATFORM 06:00 GMT + PER-CANDIDATE
        </div>
        <h2 className={`serif ${styles.h2}`}>Runs daily. Nothing hidden.</h2>
        <div className={styles.grid}>
          <div className={styles.cardLight} style={{ background: T.onColor, borderColor: T.creamBorder }}>
            <div className={styles.cardTitle}>
              <span style={{ color: T.ink }} aria-hidden>◷</span>
              <span className="mono" style={{ fontSize: 11, color: T.ink, fontWeight: 600, letterSpacing: "0.04em" }}>Platform · Daily at 06:00 GMT</span>
            </div>
            <ul className={styles.monoList} style={{ color: T.ink60, listStyle: "none", paddingLeft: 0, margin: 0 }}>
              <li>→ Finds fresh roles from partner boards</li>
              <li>→ Verifies each employer at Companies House</li>
              <li>→ Classifies industry, region and salary band</li>
              <li>→ Scores hiring confidence before you see it</li>
            </ul>
            <div className="mono" style={{ marginTop: 16, fontSize: 9, color: T.mutedStrong, letterSpacing: "0.02em" }}>
              Scheduled daily · 06:00 GMT
            </div>
          </div>
          <div className={styles.cardDark} style={{ background: T.ink, color: T.onColor, borderColor: T.white10 }}>
            <div className={styles.cardTitle}>
              <span style={{ color: T.lavender }} aria-hidden>▣</span>
              <span className="mono" style={{ fontSize: 11, color: T.onColor, fontWeight: 600, letterSpacing: "0.04em" }}>Per-candidate · On demand</span>
            </div>
            <ul className={styles.monoList} style={{ color: T.white60, listStyle: "none", paddingLeft: 0, margin: 0 }}>
              <li>→ Daily matches pulled for your profile</li>
              <li>→ Verified jobs embedded and ranked</li>
              <li>→ Failed runs retried, then parked safely</li>
              <li>→ You approve every application</li>
            </ul>
            <div className={styles.dlq} style={{ background: T.white10, borderColor: T.white10 }}>
              <span style={{ color: T.lavender }} aria-hidden>◈</span>
              <span className="mono" style={{ fontSize: 10, color: T.white60 }}>Safe retries — if a run fails it's retried and parked. Nothing is lost, nothing double-sends.</span>
            </div>
            <div className="mono" style={{ marginTop: 16, fontSize: 9, color: T.white60, letterSpacing: "0.02em" }}>
              Runs on demand · safe retries
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
