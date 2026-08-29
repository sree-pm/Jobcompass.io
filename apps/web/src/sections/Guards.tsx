import { T } from "../components/common/Theme.js";
import styles from "./Guards.module.css";
const guards = [
  ["Prompt injection blocked", "Job descriptions are data, never instructions"],
  ["Locked fields verified twice", "Deterministic checks after every edit"],
  ["British spelling enforced", "US spellings flagged per bullet"],
  ["Honest confidence score", "Capped at 70 without your evidence"],
  ["Banned clichés removed", "'Team player' never ships"],
  ["Protected details blocked", "Photo, DOB, NI never sent"],
  ["Atomic credits", "Charged only on success, refunded on failure"],
  ["Rate-limited sign-in", "3 attempts per 10 minutes"],
  ["Allowlisted origins", "Only known domains can call the API"],
  ["Encrypted sessions", "Signed tokens, single-use codes"],
  ["Receipt-grade proof", "Every application leaves a trace"],
  ["No auto-apply", "You click submit, always"],
];
export function Guards() {
  return (
    <section className={styles.wrap} style={{ background: T.ink, color: T.onColor }}>
      <div className={styles.inner}>
        <div className="mono" style={{ fontSize: 10, color: T.white60 }}>
          SECURITY GUARDS · 5/5 · 50 FILES 100% T.*
        </div>
        <h2 className={`serif ${styles.h2}`}>Guardrails, not prompts.</h2>
        <div className={styles.grid}>
          {guards.map(([a, b]) => (
            <div key={a} className={styles.card} style={{ borderColor: T.white20, background: T.white08 }}>
              <span className={styles.iconWrap} style={{ background: T.white10, color: T.success, border: `1px solid ${T.white10}` }} aria-hidden="true">
                ✓
              </span>
              <div>
                <div className="mono" style={{ fontSize: 11, lineHeight: 1.3, color: T.onColor }}>
                  {a}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.45, color: T.white50 }}>{b}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
