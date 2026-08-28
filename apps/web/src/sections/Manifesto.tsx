import { T } from "../components/common/Theme.js";
import styles from "./Manifesto.module.css";
export function Manifesto() {
  return (
    <section className={styles.wrap} style={{ background: T.ink, color: T.cream, borderTop: `1px solid ${T.white10}` }}>
      <div className={styles.inner}>
        <h2 className={`serif ${styles.h2}`}>
          First 100 applications set your trajectory. Get it wrong and you lose signal, response rate, and 3 months momentum. We treat it like <span style={{ color: T.lavender }}>P0.</span>
        </h2>
        <div className={styles.right}>
          <p style={{ color: T.white60 }}>
            JobCompass is not a wishlist. It is a UK apply OS: deterministic guardrails, British spelling, Companies House trust, receipt-grade proof, atomic credits that never expire. <span style={{ color: T.onColor }}>Proof & Pace.</span>
          </p>
          <div className={styles.pills}>
            {["No spam", "No auto-apply", "Receipts"].map((p) => (
              <span key={p} className="mono" style={{ fontSize: 10, padding: "6px 10px", borderRadius: 999, background: T.white10, border: `1px solid ${T.white10}` }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
