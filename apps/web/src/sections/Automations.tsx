import { T } from "../components/common/Theme.js";
import styles from "./Automations.module.css";
export function Automations() {
  return (
    <section className={styles.wrap} style={{ background: T.cream, borderTop: `1px solid ${T.creamBorder}`, borderBottom: `1px solid ${T.creamBorder}` }}>
      <div className={styles.inner}>
        <div className="mono" style={{ fontSize: 10, color: T.mutedStrong }}>
          EVERY MORNING · JUST FOR YOU
        </div>
        <h2 className={`serif ${styles.h2}`}>Runs daily. Nothing hidden.</h2>
        <div className={styles.grid}>
          <div className={styles.cardLight} style={{ background: T.onColor, borderColor: T.creamBorder }}>
            <div className={styles.cardTitle}>
              <span style={{ color: T.ink }} aria-hidden>◷</span>
              <span className="mono" style={{ fontSize: 11, color: T.ink, fontWeight: 600, letterSpacing: "0.04em" }}>Every morning</span>
            </div>
            <ul className={styles.monoList} style={{ color: T.ink60, listStyle: "none", paddingLeft: 0, margin: 0 }}>
              <li>→ New jobs arrive from trusted boards</li>
              <li>→ Every employer gets a background check</li>
              <li>→ Jobs sorted by pay, place and type</li>
              <li>→ You only see jobs worth your time</li>
            </ul>
            <div className="mono" style={{ marginTop: 16, fontSize: 9, color: T.mutedStrong, letterSpacing: "0.02em" }}>
              Every morning · 06:00 GMT
            </div>
          </div>
          <div className={styles.cardDark} style={{ background: T.ink, color: T.onColor, borderColor: T.white10 }}>
            <div className={styles.cardTitle}>
              <span style={{ color: T.lavender }} aria-hidden>▣</span>
              <span className="mono" style={{ fontSize: 11, color: T.onColor, fontWeight: 600, letterSpacing: "0.04em" }}>Just for you</span>
            </div>
            <ul className={styles.monoList} style={{ color: T.white60, listStyle: "none", paddingLeft: 0, margin: 0 }}>
              <li>→ Jobs matched to what you want</li>
              <li>→ Your CV tailored for each one</li>
              <li>→ If something breaks, it fixes itself</li>
              <li>→ You press send, always</li>
            </ul>
            <div className={styles.dlq} style={{ background: T.white10, borderColor: T.white10 }}>
              <span style={{ color: T.lavender }} aria-hidden>◈</span>
              <span className="mono" style={{ fontSize: 10, color: T.white60 }}>If a run fails, you get it back automatically. Nothing is lost.</span>
            </div>
            <div className="mono" style={{ marginTop: 16, fontSize: 9, color: T.white60, letterSpacing: "0.02em" }}>
              Runs when you need it
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
